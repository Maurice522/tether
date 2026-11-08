/**
 * Full-mesh WebRTC data channels for 2–4 peers.
 *
 * Signaling rides on the /sync poll, so we skip trickle ICE: each side waits
 * for candidate gathering, then sends one offer / one answer. The peer with
 * the lexically smaller id always initiates, which avoids offer glare.
 */
export type PeerState = 'connecting' | 'open' | 'failed';

export interface MeshEvents {
  signal(to: string, type: 'offer' | 'answer', data: RTCSessionDescriptionInit): void;
  message(from: string, msg: any): void;
  /** Raw file chunks; framing lives in the JSON messages around them (channel is ordered). */
  binary(from: string, data: ArrayBuffer): void;
  state(peerId: string, state: PeerState): void;
}

interface Peer {
  pc: RTCPeerConnection;
  dc?: RTCDataChannel;
  state: PeerState;
  since: number;
}

const RETRY_AFTER_MS = 12_000;

function iceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302'] },
  ];
  const url = import.meta.env.PUBLIC_TURN_URL;
  if (url) {
    servers.push({
      urls: url.split(',').map((u: string) => u.trim()),
      username: import.meta.env.PUBLIC_TURN_USERNAME,
      credential: import.meta.env.PUBLIC_TURN_CREDENTIAL,
    });
  }
  return servers;
}

function gathered(pc: RTCPeerConnection, maxMs = 2500): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => { pc.removeEventListener('icegatheringstatechange', check); clearTimeout(t); resolve(); };
    const check = () => { if (pc.iceGatheringState === 'complete') done(); };
    const t = setTimeout(done, maxMs);
    pc.addEventListener('icegatheringstatechange', check);
  });
}

export class Mesh {
  private peers = new Map<string, Peer>();

  constructor(private me: string, private on: MeshEvents) {}

  state(peerId: string): PeerState | undefined {
    return this.peers.get(peerId)?.state;
  }

  /** Reconcile connections with who is online right now. */
  reconcile(onlinePeerIds: string[]) {
    const want = new Set(onlinePeerIds.filter((id) => id !== this.me));
    for (const id of this.peers.keys()) if (!want.has(id)) this.drop(id);

    const now = Date.now();
    for (const id of want) {
      const p = this.peers.get(id);
      // A failed/closed link (e.g. the other side reloaded) retries quickly; a hung handshake gets longer.
      const stuck = p && ((p.state === 'failed' && now - p.since > 3000) || (p.state === 'connecting' && now - p.since > RETRY_AFTER_MS));
      if (stuck) this.drop(id, 'failed');
      if ((!p || stuck) && this.me < id) void this.call(id);
    }
  }

  async handleSignal(from: string, type: string, data: any) {
    if (type === 'offer') await this.answer(from, data);
    else if (type === 'answer') {
      const p = this.peers.get(from);
      if (p && p.pc.signalingState === 'have-local-offer') {
        await p.pc.setRemoteDescription(data).catch(() => this.drop(from, 'failed'));
      }
    } else if (type === 'bye') this.drop(from);
  }

  /** Returns false if there is no open channel to that peer. */
  send(peerId: string, msg: unknown): boolean {
    const dc = this.peers.get(peerId)?.dc;
    if (!dc || dc.readyState !== 'open') return false;
    try { dc.send(JSON.stringify(msg)); return true; } catch { return false; }
  }

  /** The open data channel to a peer, for callers that need backpressure (file transfers). */
  channel(peerId: string): RTCDataChannel | null {
    const dc = this.peers.get(peerId)?.dc;
    return dc && dc.readyState === 'open' ? dc : null;
  }

  close() {
    for (const id of [...this.peers.keys()]) this.drop(id);
  }

  /* ---------------------------------------------------------------- inner */

  private create(peerId: string): Peer {
    this.drop(peerId);
    const pc = new RTCPeerConnection({ iceServers: iceServers() });
    const peer: Peer = { pc, state: 'connecting', since: Date.now() };
    this.peers.set(peerId, peer);
    this.on.state(peerId, 'connecting');
    pc.addEventListener('connectionstatechange', () => {
      if (this.peers.get(peerId) !== peer) return;
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') this.setState(peerId, peer, 'failed');
    });
    pc.addEventListener('datachannel', (e) => this.wire(peerId, peer, e.channel));
    return peer;
  }

  private wire(peerId: string, peer: Peer, dc: RTCDataChannel) {
    peer.dc = dc;
    dc.binaryType = 'arraybuffer';
    dc.addEventListener('open', () => this.setState(peerId, peer, 'open'));
    dc.addEventListener('close', () => { if (this.peers.get(peerId) === peer) this.setState(peerId, peer, 'failed'); });
    dc.addEventListener('message', (e) => {
      if (e.data instanceof ArrayBuffer) { this.on.binary(peerId, e.data); return; }
      try { this.on.message(peerId, JSON.parse(e.data)); } catch { /* ignore junk */ }
    });
  }

  private setState(peerId: string, peer: Peer, state: PeerState) {
    if (peer.state === state) return;
    peer.state = state;
    peer.since = Date.now();
    this.on.state(peerId, state);
  }

  private async call(peerId: string) {
    const peer = this.create(peerId);
    try {
      this.wire(peerId, peer, peer.pc.createDataChannel('tether', { ordered: true }));
      await peer.pc.setLocalDescription(await peer.pc.createOffer());
      await gathered(peer.pc);
      if (this.peers.get(peerId) !== peer) return;
      this.on.signal(peerId, 'offer', peer.pc.localDescription!.toJSON());
    } catch {
      this.setState(peerId, peer, 'failed');
    }
  }

  private async answer(peerId: string, offer: RTCSessionDescriptionInit) {
    const peer = this.create(peerId);
    try {
      await peer.pc.setRemoteDescription(offer);
      await peer.pc.setLocalDescription(await peer.pc.createAnswer());
      await gathered(peer.pc);
      if (this.peers.get(peerId) !== peer) return;
      this.on.signal(peerId, 'answer', peer.pc.localDescription!.toJSON());
    } catch {
      this.setState(peerId, peer, 'failed');
    }
  }

  private drop(peerId: string, reportAs?: PeerState) {
    const p = this.peers.get(peerId);
    if (!p) return;
    this.peers.delete(peerId);
    try { p.dc?.close(); } catch { /* already closed */ }
    try { p.pc.close(); } catch { /* already closed */ }
    if (reportAs) this.on.state(peerId, reportAs);
  }
}
