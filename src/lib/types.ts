export const MAX_MEMBERS = 4;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
/** Members offline for this long lose their seat. */
export const EVICT_AFTER_MS = 15 * 60 * 1000;
export const MAX_CLIP_BYTES = 64 * 1024;

export interface Music {
  title: string;
  artist: string;
  playing: boolean;
  url?: string;
}

export interface MemberStatus {
  /** What the person says they are working in (manual, web can't detect apps). */
  app?: string;
  /** Spotify now playing, if connected. */
  music?: Music | null;
  /** Is their Tether tab focused right now. */
  focused?: boolean;
}

/** What clients get to see about a member. */
export interface PublicMember {
  id: string;
  name: string;
  tag: string;
  host: boolean;
  /** Has a live WebSocket to the room right now. */
  online: boolean;
  joinedAt: number;
  status: MemberStatus;
}

export type JoinResult = 'ok' | 'full' | 'missing' | 'badinvite';
