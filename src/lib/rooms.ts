import { env } from 'cloudflare:workers';
import type { JoinResult } from './types';

/**
 * Typed handles on the Durable Objects for the Astro API routes. The real classes are type-checked
 * separately (tsconfig.worker.json) because Workers runtime types clash with DOM types in client code.
 */
export interface SeatInit { id: string; tokenHash: string; name: string; tag: string; joinedAt: number; lastSeen: number }

export interface RoomStub {
  init(sid: string, host: SeatInit): Promise<void>;
  info(): Promise<{ host: string | null; full: boolean } | null>;
  join(seat: SeatInit, invite?: string): Promise<JoinResult>;
  rotateOtp(id: string, token: string): Promise<{ otp: string; otpExpiresAt: number } | null>;
  leave(id: string, token: string): Promise<boolean>;
}

export interface DirectoryStub {
  lookupOtp(hash: string): Promise<string | null>;
  hit(key: string, max: number, windowMs: number): Promise<boolean>;
}

interface Namespace<T> { idFromName(name: string): unknown; get(id: unknown): T }
const bindings = env as unknown as { ROOM: Namespace<RoomStub>; DIRECTORY: Namespace<DirectoryStub> };

export function room(sid: string): RoomStub {
  return bindings.ROOM.get(bindings.ROOM.idFromName(sid));
}

export function directory(): DirectoryStub {
  return bindings.DIRECTORY.get(bindings.DIRECTORY.idFromName('v1'));
}
