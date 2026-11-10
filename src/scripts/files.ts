/**
 * Peer-to-peer file transfer over the mesh's data channels.
 *
 * Framing on the (ordered) channel, one transfer at a time per peer:
 *   {t:'file-start', id, name, size, mime}  →  N binary chunks  →  {t:'file-end', id}
 * Files never touch the server, so a peer needs a direct link to receive one.
 */
import type { Mesh } from './mesh';
import { blockedName, checkFile, looksExecutable, type Verdict } from './filecheck';

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
  status: 'active' | 'done' | 'partial' | 'failed' | 'blocked' | 'recalled';
  /** Who didn't get it, for partial/failed sends. */
  missed?: string[];
  /** Pulled back, but these people had already saved it to their device (out). */
  keptBy?: string[];
  url?: string;
  /** The receiver pressed Save (so leaving/reloading won't lose it). */
  saved?: boolean;
}

interface Incoming { item: FileItem; chunks: ArrayBuffer[]; got: number }

export type SendResult = FileItem | { tooBig: true } | { blocked: Verdict };

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
  /** Recalls a peer hasn't heard yet because the link was down; resent when it comes back. */
  private pendingRecalls = new Map<string, Set<string>>();
  /** Incoming files the user saved, remembered even after the list is cleared. */
  private savedIds = new Set<string>();

  constructor(
    private mesh: Mesh,
    private me: string,
    private changed: (item: FileItem) => void,
    /** A recall reached `peerId`; `saved` says whether they had already saved it (null: they no longer had it). */
    private recallAnswered: (item: FileItem, peerId: string, saved: boolean | null) => void = () => {},
  ) {}

  markSaved(item: FileItem) {
    item.saved = true;
    this.savedIds.add(item.id);
  }

  /** Pull back a file we sent: stops it mid-transfer, and removes it from receivers who haven't saved it. */
  recall(id: string) {
    const item = this.items.find((i) => i.id === id && i.dir === 'out');
    if (!item || item.status === 'recalled' || item.status === 'failed') return;
    item.status = 'recalled';
    item.keptBy = [];
    for (const p of item.peers) {
      if (this.mesh.send(p, { t: 'file-recall', id })) continue;
      if (!this.pendingRecalls.has(p)) this.pendingRecalls.set(p, new Set());
      this.pendingRecalls.get(p)!.add(id);
    }
    this.changed(item);
  }

  /** Call when the direct link to a peer (re)opens. */
  peerOpen(peerId: string) {
    const ids = this.pendingRecalls.get(peerId);
    if (!ids) return;
    for (const id of ids) if (this.mesh.send(peerId, { t: 'file-recall', id })) ids.delete(id);
    if (!ids.size) this.pendingRecalls.delete(peerId);
  }

  /** Check `file`, then queue it for each peer. */
  async send(file: File, peerIds: string[]): Promise<SendResult> {
    if (file.size > MAX_FILE) return { tooBig: true };
    const verdict = await checkFile(file);
    if (!verdict.ok) return { blocked: verdict };
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
      if (blockedName(item.name)) { this.finish(item, 'blocked'); return true; } // never collect its bytes
      this.incoming.set(from, { item, chunks: [], got: 0 });
      this.changed(item);
      return true;
    }
    if (msg?.t === 'file-recall') {
      // Only the person who sent a file can pull it back.
      const item = this.items.find((i) => i.id === msg.id && i.dir === 'in' && i.from === from);
      const inc = this.incoming.get(from);
      if (inc && inc.item.id === msg.id) this.incoming.delete(from);
      const saved = item ? !!item.saved : this.savedIds.has(msg.id) ? true : null;
      if (item && item.status !== 'recalled' && item.status !== 'blocked') {
        if (item.url) URL.revokeObjectURL(item.url);
        item.url = undefined;
        this.finish(item, 'recalled');
      }
      this.mesh.send(from, { t: 'file-recall-ack', id: msg.id, saved });
      return true;
    }
    if (msg?.t === 'file-recall-ack') {
      const item = this.items.find((i) => i.id === msg.id && i.dir === 'out' && i.peers.includes(from));
      if (!item) return true;
      if (msg.saved === true && !item.keptBy?.includes(from)) (item.keptBy ??= []).push(from);
      this.recallAnswered(item, from, msg.saved === true ? true : msg.saved === false ? false : null);
      this.changed(item);
      return true;
    }
    if (msg?.t === 'file-end') {
      const inc = this.incoming.get(from);
      if (!inc || inc.item.id !== msg.id) return true;
      this.incoming.delete(from);
      if (inc.got !== inc.item.size) { this.finish(inc.item, 'failed'); return true; }
      const blob = new Blob(inc.chunks, { type: inc.item.mime });
      inc.chunks = [];
      void checkFile(Object.assign(blob, { name: inc.item.name })).then((v) => {
        if (inc.item.status === 'recalled') return; // pulled back while we were checking it
        if (!v.ok) { this.finish(inc.item, 'blocked'); return; }
        inc.item.url = URL.createObjectURL(blob);
        inc.item.progress = 1;
        this.finish(inc.item, 'done');
      });
      return true;
    }
    return false;
  }

  binary(from: string, data: ArrayBuffer) {
    const inc = this.incoming.get(from);
    if (!inc) return;
    if (!inc.got && looksExecutable(new Uint8Array(data, 0, Math.min(8, data.byteLength)))) {
      this.incoming.delete(from); // a program wearing another name: drop it before keeping any of it
      this.finish(inc.item, 'blocked');
      return;
    }
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
      const recalled = () => item.status === 'recalled'; // a function so TS doesn't narrow it across awaits
      if (recalled()) throw new Error('pulled back');
      if (!dc) throw new Error('no direct link');
      dc.bufferedAmountLowThreshold = LOW_WATER;
      dc.send(JSON.stringify({ t: 'file-start', id: item.id, name: item.name, size: item.size, mime: item.mime }));
      for (let off = 0; off < file.size; off += CHUNK) {
        if (recalled()) throw new Error('pulled back'); // the receiver drops what it has on file-recall
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
    if (item.status === 'recalled') { this.changed(item); return; }
    if (states.some(([, s]) => s.state === 'active')) item.status = 'active';
    else if (!missed.length) item.status = 'done';
    else item.status = missed.length === states.length ? 'failed' : 'partial';
    item.missed = missed;
    this.changed(item);
  }
}
