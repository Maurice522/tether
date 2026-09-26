import { AsyncLocalStorage } from 'node:async_hooks';
import { MongoClient, type Collection } from 'mongodb';
import { envVar } from './env';
import { EVICT_AFTER_MS, SESSION_TTL_MS, type Member, type MemberStatus, type Session, type Signal } from './types';

export type AddResult = 'ok' | 'full' | 'missing';

export interface Store {
  createSession(s: Session): Promise<void>;
  getSession(id: string): Promise<Session | null>;
  findByOtp(otpHash: string, now: Date): Promise<Session | null>;
  addMember(id: string, m: Member, max: number): Promise<AddResult>;
  touchMember(id: string, memberId: string, now: Date, status?: MemberStatus): Promise<void>;
  removeMember(id: string, memberId: string): Promise<void>;
  setOtp(id: string, otp: string, otpHash: string, expiresAt: Date): Promise<void>;
  pushSignals(list: Signal[]): Promise<void>;
  takeSignals(sid: string, to: string): Promise<Signal[]>;
  /** Returns true while `key` is under `max` hits in the window. */
  hit(key: string, max: number, windowMs: number): Promise<boolean>;
}

/* ------------------------------------------------------------------ Mongo */

interface RateDoc { _id: string; count: number; expiresAt: Date }
interface SignalDoc extends Signal { expiresAt: Date }

class MongoStore implements Store {
  private ready: Promise<{ sessions: Collection<Session>; signals: Collection<SignalDoc>; rates: Collection<RateDoc> }>;
  private client: MongoClient;

  constructor(uri: string, dbName: string) {
    // Workers can't share sockets between requests, so each request gets a small, short-lived client.
    const client = new MongoClient(uri, { maxPoolSize: 1, minPoolSize: 0, serverSelectionTimeoutMS: 8000 });
    this.client = client;
    this.ready = (async () => {
      await client.connect();
      const db = client.db(dbName);
      const sessions = db.collection<Session>('sessions');
      const signals = db.collection<SignalDoc>('signals');
      const rates = db.collection<RateDoc>('ratelimits');
      if (!g.__tetherIndexed) {
        // Idempotent; racing first requests just both create them.
        await Promise.all([
          sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
          sessions.createIndex({ otpHash: 1 }),
          signals.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
          signals.createIndex({ sid: 1, to: 1, at: 1 }),
          rates.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        ]);
        g.__tetherIndexed = true;
      }
      return { sessions, signals, rates };
    })();
  }

  async close() {
    await this.client.close().catch(() => {});
  }

  async createSession(s: Session) {
    const { sessions } = await this.ready;
    await sessions.insertOne(s);
  }

  async getSession(id: string) {
    const { sessions } = await this.ready;
    return sessions.findOne({ _id: id });
  }

  async findByOtp(otpHash: string, now: Date) {
    const { sessions } = await this.ready;
    return sessions.findOne({ otpHash, otpExpiresAt: { $gt: now } });
  }

  async addMember(id: string, m: Member, max: number): Promise<AddResult> {
    const { sessions } = await this.ready;
    const stale = new Date(m.joinedAt.getTime() - EVICT_AFTER_MS);
    // Free seats held by people who vanished long ago, then claim one atomically.
    await sessions.updateOne({ _id: id }, { $pull: { members: { lastSeen: { $lt: stale } } } });
    const res = await sessions.updateOne(
      { _id: id, [`members.${max - 1}`]: { $exists: false } },
      { $push: { members: m }, $set: { expiresAt: new Date(Date.now() + SESSION_TTL_MS) } },
    );
    if (res.modifiedCount === 1) return 'ok';
    return (await sessions.countDocuments({ _id: id })) ? 'full' : 'missing';
  }

  async touchMember(id: string, memberId: string, now: Date, status?: MemberStatus) {
    const { sessions } = await this.ready;
    const set: Record<string, unknown> = {
      'members.$.lastSeen': now,
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    };
    if (status) set['members.$.status'] = status;
    await sessions.updateOne({ _id: id, 'members.id': memberId }, { $set: set });
  }

  async removeMember(id: string, memberId: string) {
    const { sessions } = await this.ready;
    await sessions.updateOne({ _id: id }, { $pull: { members: { id: memberId } } });
  }

  async setOtp(id: string, otp: string, otpHash: string, expiresAt: Date) {
    const { sessions } = await this.ready;
    await sessions.updateOne({ _id: id }, { $set: { otp, otpHash, otpExpiresAt: expiresAt } });
  }

  async pushSignals(list: Signal[]) {
    if (!list.length) return;
    const { signals } = await this.ready;
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    await signals.insertMany(list.map((s) => ({ ...s, expiresAt })));
  }

  async takeSignals(sid: string, to: string) {
    const { signals } = await this.ready;
    const docs = await signals.find({ sid, to }).sort({ at: 1 }).limit(50).toArray();
    if (docs.length) await signals.deleteMany({ _id: { $in: docs.map((d) => d._id) } });
    return docs.map(({ _id, expiresAt, ...s }) => s as Signal);
  }

  async hit(key: string, max: number, windowMs: number) {
    const { rates } = await this.ready;
    const now = new Date();
    const doc = await rates.findOneAndUpdate(
      { _id: key, expiresAt: { $gt: now } },
      { $inc: { count: 1 } },
      { returnDocument: 'after' },
    );
    if (doc) return doc.count <= max;
    await rates.replaceOne({ _id: key }, { count: 1, expiresAt: new Date(now.getTime() + windowMs) }, { upsert: true });
    return true;
  }
}

/* --------------------------------------------------------- Memory (dev only) */

class MemoryStore implements Store {
  private sessions = new Map<string, Session>();
  private signals: Signal[] = [];
  private rates = new Map<string, { count: number; until: number }>();

  async createSession(s: Session) { this.sessions.set(s._id, structuredClone(s)); }
  async getSession(id: string) {
    const s = this.sessions.get(id);
    return s && s.expiresAt.getTime() > Date.now() ? structuredClone(s) : null;
  }
  async findByOtp(otpHash: string, now: Date) {
    for (const s of this.sessions.values()) if (s.otpHash === otpHash && s.otpExpiresAt > now) return structuredClone(s);
    return null;
  }
  async addMember(id: string, m: Member, max: number): Promise<AddResult> {
    const s = this.sessions.get(id);
    if (!s) return 'missing';
    const stale = m.joinedAt.getTime() - EVICT_AFTER_MS;
    s.members = s.members.filter((x) => x.lastSeen.getTime() >= stale);
    if (s.members.length >= max) return 'full';
    s.members.push(structuredClone(m));
    return 'ok';
  }
  async touchMember(id: string, memberId: string, now: Date, status?: MemberStatus) {
    const m = this.sessions.get(id)?.members.find((x) => x.id === memberId);
    if (!m) return;
    m.lastSeen = now;
    if (status) m.status = status;
  }
  async removeMember(id: string, memberId: string) {
    const s = this.sessions.get(id);
    if (s) s.members = s.members.filter((x) => x.id !== memberId);
  }
  async setOtp(id: string, otp: string, otpHash: string, expiresAt: Date) {
    const s = this.sessions.get(id);
    if (s) Object.assign(s, { otp, otpHash, otpExpiresAt: expiresAt });
  }
  async pushSignals(list: Signal[]) { this.signals.push(...list); }
  async takeSignals(sid: string, to: string) {
    const cutoff = Date.now() - 2 * 60 * 1000;
    const mine = this.signals.filter((s) => s.sid === sid && s.to === to && s.at.getTime() > cutoff);
    this.signals = this.signals.filter((s) => !mine.includes(s) && s.at.getTime() > cutoff);
    return mine;
  }
  async hit(key: string, max: number, windowMs: number) {
    const now = Date.now();
    const r = this.rates.get(key);
    if (!r || r.until < now) { this.rates.set(key, { count: 1, until: now + windowMs }); return true; }
    return ++r.count <= max;
  }
}

/* ------------------------------------------------------------------ export */

const g = globalThis as unknown as { __tetherMemory?: MemoryStore; __tetherIndexed?: boolean };
const scope = new AsyncLocalStorage<{ store?: MongoStore }>();

/** Runs a request handler with its own DB client, closed once the handler settles. */
export async function withStore<T>(fn: () => Promise<T>): Promise<T> {
  const slot: { store?: MongoStore } = {};
  try {
    return await scope.run(slot, fn);
  } finally {
    await slot.store?.close();
  }
}

export function store(): Store {
  const uri = envVar('MONGODB_URI');
  if (!uri) {
    if (!import.meta.env.DEV) throw new Error('MONGODB_URI is not set');
    if (!g.__tetherMemory) {
      console.warn('[tether] MONGODB_URI not set — using in-memory store (dev only).');
      g.__tetherMemory = new MemoryStore();
    }
    return g.__tetherMemory;
  }
  const slot = scope.getStore();
  if (!slot) throw new Error('store() called outside withStore()');
  slot.store ??= new MongoStore(uri, envVar('MONGODB_DB') ?? 'tether');
  return slot.store;
}
