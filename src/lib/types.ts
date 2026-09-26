export const MAX_MEMBERS = 4;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
/** A member counts as online if we heard from them within this window. */
export const ONLINE_WINDOW_MS = 45 * 1000;
/** Members silent for this long lose their seat. */
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

export interface Member {
  id: string;
  tokenHash: string;
  name: string;
  tag: string;
  joinedAt: Date;
  lastSeen: Date;
  status: MemberStatus;
}

export interface Session {
  _id: string;
  hostId: string;
  otpHash: string;
  otpExpiresAt: Date;
  /** Shown to members so anyone inside can invite; OTP lookups still go through otpHash. */
  otp: string;
  invite: string;
  createdAt: Date;
  expiresAt: Date;
  members: Member[];
}

export interface Signal {
  sid: string;
  to: string;
  from: string;
  type: 'offer' | 'answer' | 'clip' | 'bye';
  data: unknown;
  at: Date;
}

/** What clients get to see about a member. */
export interface PublicMember {
  id: string;
  name: string;
  tag: string;
  host: boolean;
  online: boolean;
  joinedAt: number;
  status: MemberStatus;
}
