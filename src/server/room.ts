import { DurableObject } from 'cloudflare:workers';
import { digest, randomOtp, safeEqual } from '../lib/crypto';
import {
  EVICT_AFTER_MS, MAX_CLIP_BYTES, MAX_MEMBERS, OTP_TTL_MS, SESSION_TTL_MS,
  type JoinResult, type MemberStatus, type PublicMember,
} from '../lib/types';

/** Persisted seat. Live status is kept on the socket instead, so focus changes cost no storage writes. */
interface Seat {
  id: string;
  tokenHash: string;
  name: string;
  tag: string;
  joinedAt: number;
  lastSeen: number;
}

interface Meta {
  sid: string;
  hostId: string;
  otp: string;
  otpHash: string;
  otpExpiresAt: number;
  invite: string;
  createdAt: number;
  lastActive: number;
}

/** Survives hibernation via serializeAttachment. */
interface SocketInfo { id: string | null; status: MemberStatus }



const SIGNAL_TYPES = new Set(['offer', 'answer', 'clip', 'bye']);
const SWEEP_MS = 10 * 60 * 1000;

function cleanStatus(v: unknown): MemberStatus {
  if (!v || typeof v !== 'object') return {};
  const s = v as Record<string, any>;
  const str = (x: unknown, max: number) => (typeof x === 'string' ? x.slice(0, max) : undefined);
  const music = s.music && typeof s.music === 'object'
    ? { title: str(s.music.title, 120) ?? '', artist: str(s.music.artist, 120) ?? '', playing: !!s.music.playing, url: str(s.music.url, 300) }
    : null;
  return { app: str(s.app, 40), music, focused: !!s.focused };
}

/**
 * One object per session. Seats + code + invite live in storage; presence, status,
 * WebRTC signaling and the clip relay all ride on hibernatable WebSockets.
 */
export class Room extends DurableObject<Env> {
  private meta: Meta | null = null;
  private seats: Seat[] = [];

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.meta = (await ctx.storage.get<Meta>('meta')) ?? null;
      this.seats = (await ctx.storage.get<Seat[]>('seats')) ?? [];
    });
    // Keepalive pings are answered without waking the object.
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }

  /* ---------------------------------------------------------------- RPC */

  async init(sid: string, host: Seat): Promise<void> {
    if (this.meta) throw new Error('session exists');
    const now = Date.now();
    this.meta = { sid, hostId: host.id, otp: '', otpHash: '', otpExpiresAt: 0, invite: crypto.randomUUID().replace(/-/g, ''), createdAt: now, lastActive: now };
    this.seats = [host];
    await this.newOtp();
    await this.save();
    await this.ctx.storage.setAlarm(now + SWEEP_MS);
  }

  /** For the "check code" step: who's hosting and is there room. */
  info(): { host: string | null; full: boolean } | null {
    if (!this.meta) return null;
    this.evictStale();
    const host = this.seats.find((s) => s.id === this.meta!.hostId) ?? this.seats[0];
    return { host: host?.name ?? null, full: this.seats.length >= MAX_MEMBERS };
  }

  async join(seat: Seat, invite?: string): Promise<JoinResult> {
    if (!this.meta) return 'missing';
    if (invite !== undefined && !safeEqual(invite, this.meta.invite)) return 'badinvite';
    this.evictStale();
    if (this.seats.length >= MAX_MEMBERS) return 'full';
    this.seats.push(seat);
    this.meta.lastActive = Date.now();
    await this.save();
    this.broadcastRoster();
    return 'ok';
  }

  async rotateOtp(id: string, token: string): Promise<{ otp: string; otpExpiresAt: number } | null> {
    if (!this.meta || !this.authed(id, token)) return null;
    await this.newOtp();
    await this.save();
    this.broadcastRoster();
    return { otp: this.meta.otp, otpExpiresAt: this.meta.otpExpiresAt };
  }

  async leave(id: string, token: string): Promise<boolean> {
    if (!this.meta || !this.authed(id, token)) return false;
    this.seats = this.seats.filter((s) => s.id !== id);
    for (const ws of this.sockets(id)) ws.close(4001, 'left');
    for (const ws of this.ctx.getWebSockets()) {
      const info = ws.deserializeAttachment() as SocketInfo | null;
      if (info?.id) this.send(ws, { t: 'signal', from: id, type: 'bye', data: null });
    }
    await this.save();
    this.broadcastRoster();
    return true;
  }

  /* ------------------------------------------------------------ sockets */

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket') return new Response('Expected WebSocket', { status: 426 });
    const [client, server] = Object.values(new WebSocketPair());
    if (!this.meta) {
      // Accept just to say why: a failed upgrade looks like a network error and the client would retry forever.
      server.accept();
      server.send(JSON.stringify({ t: 'denied', reason: 'ended' }));
      server.close(4003, 'ended');
      return new Response(null, { status: 101, webSocket: client });
    }
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ id: null, status: {} } satisfies SocketInfo);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
    if (typeof raw !== 'string' || raw.length > MAX_CLIP_BYTES * 2 + 8192) return;
    let msg: any;
    try { msg = JSON.parse(raw); } catch { return; }
    const info = ws.deserializeAttachment() as SocketInfo;

    // First message must authenticate (keeps the member token out of URLs and logs).
    if (!info.id) {
      if (msg?.t !== 'auth' || !this.meta || !this.authed(msg.id, msg.token)) {
        this.send(ws, { t: 'denied', reason: this.meta ? 'not-member' : 'ended' });
        ws.close(4003, 'denied');
        return;
      }
      // One live socket per seat: a newer tab replaces an older one.
      for (const old of this.sockets(msg.id)) old.close(4002, 'replaced');
      ws.serializeAttachment({ id: msg.id, status: cleanStatus(msg.status) } satisfies SocketInfo);
      this.touch(msg.id);
      this.broadcastRoster();
      return;
    }

    switch (msg?.t) {
      case 'status':
        ws.serializeAttachment({ id: info.id, status: cleanStatus(msg.status) } satisfies SocketInfo);
        this.broadcastRoster();
        break;
      case 'signal': {
        if (!SIGNAL_TYPES.has(msg.type) || typeof msg.to !== 'string' || msg.to === info.id) return;
        const delivered = this.sockets(msg.to).map((peer) => this.send(peer, { t: 'signal', from: info.id, type: msg.type, data: msg.data ?? null }));
        if (!delivered.some(Boolean) && msg.type === 'clip') this.send(ws, { t: 'undelivered', to: msg.to });
        break;
      }
    }
  }

  async webSocketClose(ws: WebSocket) {
    const info = ws.deserializeAttachment() as SocketInfo | null;
    if (info?.id) {
      this.touch(info.id);
      await this.save();
    }
    this.broadcastRoster(ws);
  }

  async webSocketError(ws: WebSocket) {
    await this.webSocketClose(ws);
  }

  /** Every 10 min: free stale seats; after 12 h with nobody connected the session is deleted. */
  async alarm() {
    if (!this.meta) return;
    const now = Date.now();
    const live = this.ctx.getWebSockets().length > 0;
    if (live) this.meta.lastActive = now;
    if (!live && now - this.meta.lastActive > SESSION_TTL_MS) {
      await this.env.DIRECTORY.get(this.env.DIRECTORY.idFromName('v1')).releaseOtp(this.meta.otpHash, this.meta.sid);
      await this.ctx.storage.deleteAll();
      this.meta = null;
      this.seats = [];
      return;
    }
    if (this.evictStale()) this.broadcastRoster();
    await this.save();
    await this.ctx.storage.setAlarm(now + SWEEP_MS);
  }

  /* ------------------------------------------------------------ helpers */

  private authed(id: unknown, token: unknown): boolean {
    if (typeof id !== 'string' || typeof token !== 'string') return false;
    const seat = this.seats.find((s) => s.id === id);
    return !!seat && safeEqual(seat.tokenHash, digest(token));
  }

  private sockets(id: string): WebSocket[] {
    return this.ctx.getWebSockets().filter((ws) => (ws.deserializeAttachment() as SocketInfo | null)?.id === id);
  }

  private send(ws: WebSocket, msg: unknown): boolean {
    try { ws.send(JSON.stringify(msg)); return true; } catch { return false; }
  }

  private touch(id: string) {
    const seat = this.seats.find((s) => s.id === id);
    if (seat) seat.lastSeen = Date.now();
    if (this.meta) this.meta.lastActive = Date.now();
  }

  /** Drop seats nobody has used for a while (offline and not seen recently). Returns true if any went. */
  private evictStale(): boolean {
    const online = new Set(this.onlineIds());
    const cutoff = Date.now() - EVICT_AFTER_MS;
    const before = this.seats.length;
    this.seats = this.seats.filter((s) => online.has(s.id) || s.lastSeen >= cutoff);
    return this.seats.length !== before;
  }

  private onlineIds(except?: WebSocket): string[] {
    return this.ctx.getWebSockets()
      .filter((ws) => ws !== except)
      .map((ws) => (ws.deserializeAttachment() as SocketInfo | null)?.id)
      .filter((id): id is string => !!id);
  }

  private async newOtp() {
    const dir = this.env.DIRECTORY.get(this.env.DIRECTORY.idFromName('v1'));
    if (this.meta!.otpHash) await dir.releaseOtp(this.meta!.otpHash, this.meta!.sid);
    const candidates = Array.from({ length: 8 }, () => randomOtp());
    const i = await dir.claimOtp(candidates.map(digest), this.meta!.sid, OTP_TTL_MS);
    if (i < 0) throw new Error('Could not allocate a unique code');
    this.meta!.otp = candidates[i];
    this.meta!.otpHash = digest(candidates[i]);
    this.meta!.otpExpiresAt = Date.now() + OTP_TTL_MS;
  }

  private async save() {
    if (!this.meta) return;
    await this.ctx.storage.put({ meta: this.meta, seats: this.seats });
  }

  private roster(except?: WebSocket): PublicMember[] {
    const statuses = new Map<string, MemberStatus>();
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue;
      const info = ws.deserializeAttachment() as SocketInfo | null;
      if (info?.id) statuses.set(info.id, info.status);
    }
    return this.seats.map((s) => ({
      id: s.id,
      name: s.name,
      tag: s.tag,
      host: s.id === this.meta?.hostId,
      online: statuses.has(s.id),
      joinedAt: s.joinedAt,
      status: statuses.get(s.id) ?? {},
    }));
  }

  /** Everyone gets the same roster; `except` is a socket that is closing right now. */
  private broadcastRoster(except?: WebSocket) {
    if (!this.meta) return;
    const msg = {
      t: 'roster',
      now: Date.now(),
      members: this.roster(except),
      otp: this.meta.otp,
      otpExpiresAt: this.meta.otpExpiresAt,
      invite: this.meta.invite,
    };
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue;
      const info = ws.deserializeAttachment() as SocketInfo | null;
      if (info?.id) this.send(ws, { ...msg, me: info.id });
    }
  }
}
