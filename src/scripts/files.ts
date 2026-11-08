/**
 * Peer-to-peer file transfer over the mesh's data channels.
 *
 * Framing on the (ordered) channel, one transfer at a time per peer:
 *   {t:'file-start', id, name, size, mime}  →  N binary chunks  →  {t:'file-end', id}
 * Files never touch the server, so a peer needs a direct link to receive one.
 */
import type { Mesh } from './mesh';

export const MAX_FILE = 500 * 1024 * 1024;
const CHUNK = 64 * 1024;               // safe message size across Chrome/Firefox/Safari
const HIGH_WATER = 4 * 1024 * 1024;    // pause reading the file while this much is queued
const LOW_WATER = 1024 * 1024;

type PeerTransfer = 'active' | 'done' | 'failed';

export interface FileItem {
  kind: 'file';
  id: string;
  name: string;
  size: number;
  mime: string;
  from: string;
  at: number;
  dir: 'in' | 'out';
  /** Recipients (out) or sender (in). */
  peers: string[];
  /** 0..1 across all recipients. */
  progress: number;
  status: 'active' | 'done' | 'partial' | 'failed';
  /** Who didn't get it, for partial/failed sends. */
  missed?: string[];
  url?: string;
}

interface Incoming { item: FileItem; chunks: ArrayBuffer[]; got: number }

const safeName = (v: unknown) =>
  (typeof v === 'string' && v.trim() ? v : 'file').slice(0, 200).replace(/[\\/:*?"<>|\x00-\x1f]/g, '_');
const safeMime = (v: unknown) =>
  typeof v === 'string' && /^[\w.+-]+\/[\w.+-]+$/.test(v) ? v : 'application/octet-stream';

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB'];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

function drained(dc: RTCDataChannel): Promise<void> {
  return new Promise((resolve, reject) => {
    const done = () => { cleanup(); resolve(); };
    const closed = () => { cleanup(); reject(new Error('channel closed')); };
    const cleanup = () => { dc.removeEventListener('bufferedamountlow', done); dc.removeEventListener('close', closed); };
    dc.addEventListener('bufferedamountlow', done);
    dc.addEventListener('close', closed);
  });
}

export class FileTransfers {
  items: FileItem[] = [];
  private queues = new Map<string, Promise<void>>();
  private incoming = new Map<string, Incoming>();
  private outState = new Map<string, Map<string, { state: PeerTransfer; bytes: number }>>();

  constructor(private mesh: Mesh, private me: string, private changed: (item: FileItem) => void) {}

  /** Queue `file` for each peer. Returns null if it's too big. */
  send(file: File, peerIds: string[]): FileItem | null {
    if (file.size > MAX_FILE) return null;
    const item: FileItem = {
      kind: 'file', id: crypto.randomUUID(), name: safeName(file.name), size: file.size, mime: safeMime(file.type),
      from: this.me, at: Date.now(), dir: 'out', peers: peerIds, progress: 0, status: 'active',
    };
    this.items.unshift(item);
    this.outState.set(item.id, new Map(peerIds.map((p) => [p, { state: 'active' as PeerTransfer, bytes: 0 }])));
    for (const p of peerIds) {
      const prev = this.queues.get(p) ?? Promise.resolve();
      this.queues.set(p, prev.then(() => this.sendTo(p, file, item)));
    }
    this.changed(item);
    return item;
  }

  /** Returns true if the message was a file-protocol message. */
  message(from: string, msg: any): boolean {
    if (msg?.t === 'file-start') {
      this.fail(from); // a new start means any previous one from this peer is dead
      const size = Number(msg.size);
      if (typeof msg.id !== 'string' || !Number.isFinite(size) || size < 0 || size > MAX_FILE) return true;
      const item: FileItem = {
        kind: 'file', id: msg.id, name: safeName(msg.name), size, mime: safeMime(msg.mime),
        from, at: Date.now(), dir: 'in', peers: [from], progress: size ? 0 : 1, status: 'active',
      };
      this.items.unshift(item);
      this.incoming.set(from, { item, chunks: [], got: 0 });
      this.changed(item);
      return true;
    }
    if (msg?.t === 'file-end') {
      const inc = this.incoming.get(from);
      if (!inc || inc.item.id !== msg.id) return true;
      this.incoming.delete(from);
      if (inc.got !== inc.item.size) { this.finish(inc.item, 'failed'); return true; }
      inc.item.url = URL.createObjectURL(new Blob(inc.chunks, { type: inc.item.mime }));
      inc.item.progress = 1;
      this.finish(inc.item, 'done');
      return true;
    }
    return false;
  }

  binary(from: string, data: ArrayBuffer) {
    const inc = this.incoming.get(from);
    if (!inc) return;
    inc.chunks.push(data);
    inc.got += data.byteLength;
    if (inc.got > inc.item.size) { this.fail(from); return; }
    inc.item.progress = inc.item.size ? inc.got / inc.item.size : 1;
    this.changed(inc.item);
  }

  /** The link to a peer went away: drop whatever it was sending us. Outgoing sends notice on their own. */
  peerGone(peerId: string) {
    this.fail(peerId);
  }

  private fail(peerId: string) {
    const inc = this.incoming.get(peerId);
    if (!inc) return;
    this.incoming.delete(peerId);
    this.finish(inc.item, 'failed');
  }

  private finish(item: FileItem, status: FileItem['status']) {
    item.status = status;
    this.changed(item);
  }

  private async sendTo(peerId: string, file: File, item: FileItem) {
    const state = this.outState.get(item.id)!.get(peerId)!;
    const dc = this.mesh.channel(peerId);
    try {
      if (!dc) throw new Error('no direct link');
      dc.bufferedAmountLowThreshold = LOW_WATER;
      dc.send(JSON.stringify({ t: 'file-start', id: item.id, name: item.name, size: item.size, mime: item.mime }));
      for (let off = 0; off < file.size; off += CHUNK) {
        if (dc.readyState !== 'open') throw new Error('channel closed');
        if (dc.bufferedAmount > HIGH_WATER) await drained(dc);
        dc.send(await file.slice(off, off + CHUNK).arrayBuffer());
        state.bytes = Math.min(file.size, off + CHUNK);
        this.recompute(item);
      }
      dc.send(JSON.stringify({ t: 'file-end', id: item.id }));
      state.state = 'done';
      state.bytes = file.size;
    } catch {
      state.state = 'failed';
    }
    this.recompute(item);
  }

  private recompute(item: FileItem) {
    const states = [...this.outState.get(item.id)!.entries()];
    const total = item.size * states.length;
    item.progress = total ? states.reduce((n, [, s]) => n + s.bytes, 0) / total : 1;
    const missed = states.filter(([, s]) => s.state === 'failed').map(([p]) => p);
    if (states.some(([, s]) => s.state === 'active')) item.status = 'active';
    else if (!missed.length) item.status = 'done';
    else item.status = missed.length === states.length ? 'failed' : 'partial';
    item.missed = missed;
    this.changed(item);
  }
}
