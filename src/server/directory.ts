import { DurableObject } from 'cloudflare:workers';

interface OtpEntry { sid: string; exp: number }

/**
 * One global object: maps live 6-digit codes (by hash) to session ids, and keeps rate-limit counters.
 * Rate limits live in memory only; if the object is evicted they reset, which just makes them lenient.
 */
export class Directory extends DurableObject<Env> {
  private hits = new Map<string, { count: number; until: number }>();

  /** Reserve a code for `sid`. `make` produces candidates; `hash` turns one into its storage key. */
  async claimOtp(hashes: string[], sid: string, ttlMs: number): Promise<number> {
    const now = Date.now();
    for (let i = 0; i < hashes.length; i++) {
      const key = `otp:${hashes[i]}`;
      const held = await this.ctx.storage.get<OtpEntry>(key);
      if (held && held.exp > now) continue;
      await this.ctx.storage.put(key, { sid, exp: now + ttlMs } satisfies OtpEntry);
      await this.ensureSweep();
      return i;
    }
    return -1;
  }

  async lookupOtp(hash: string): Promise<string | null> {
    const entry = await this.ctx.storage.get<OtpEntry>(`otp:${hash}`);
    if (!entry) return null;
    if (entry.exp <= Date.now()) {
      await this.ctx.storage.delete(`otp:${hash}`);
      return null;
    }
    return entry.sid;
  }

  async releaseOtp(hash: string, sid: string) {
    const key = `otp:${hash}`;
    const entry = await this.ctx.storage.get<OtpEntry>(key);
    if (entry?.sid === sid) await this.ctx.storage.delete(key);
  }

  /** True while `key` is under `max` hits in the window. */
  hit(key: string, max: number, windowMs: number): boolean {
    const now = Date.now();
    const r = this.hits.get(key);
    if (!r || r.until < now) {
      this.hits.set(key, { count: 1, until: now + windowMs });
      if (this.hits.size > 5000) for (const [k, v] of this.hits) if (v.until < now) this.hits.delete(k);
      return true;
    }
    return ++r.count <= max;
  }

  private async ensureSweep() {
    if ((await this.ctx.storage.getAlarm()) == null) await this.ctx.storage.setAlarm(Date.now() + 60 * 60 * 1000);
  }

  /** Hourly: drop expired codes so storage doesn't grow. */
  async alarm() {
    const now = Date.now();
    const all = await this.ctx.storage.list<OtpEntry>({ prefix: 'otp:' });
    const dead = [...all].filter(([, v]) => v.exp <= now).map(([k]) => k);
    for (let i = 0; i < dead.length; i += 128) await this.ctx.storage.delete(dead.slice(i, i + 128));
    if (all.size > dead.length) await this.ctx.storage.setAlarm(now + 60 * 60 * 1000);
  }
}
