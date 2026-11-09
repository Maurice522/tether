/**
 * Spotify "now playing" via Authorization Code + PKCE, entirely in the browser
 * (no client secret). Needs PUBLIC_SPOTIFY_CLIENT_ID and the redirect URI
 * <origin>/spotify/callback registered in the Spotify dashboard.
 */
import { T } from '../i18n/client';
import type { Music } from '../lib/types';

const CLIENT_ID: string | undefined = import.meta.env.PUBLIC_SPOTIFY_CLIENT_ID || undefined;
const KEY = 'tether:spotify';
const PKCE_KEY = 'tether:spotify:pkce';
const SCOPES = 'user-read-currently-playing user-read-playback-state';

interface Tokens { access: string; refresh: string; expiresAt: number }

export const spotifyAvailable = () => !!CLIENT_ID;
const redirectUri = () => `${location.origin}/spotify/callback`;

function load(): Tokens | null {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { return null; }
}
function save(t: Tokens | null) {
  try { t ? localStorage.setItem(KEY, JSON.stringify(t)) : localStorage.removeItem(KEY); } catch { /* ignore */ }
}
export const spotifyConnected = () => !!load();
export const disconnectSpotify = () => save(null);

function b64url(bytes: ArrayBuffer | Uint8Array) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function connectSpotify() {
  if (!CLIENT_ID) return;
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)));
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  const state = b64url(crypto.getRandomValues(new Uint8Array(12)));
  sessionStorage.setItem(PKCE_KEY, JSON.stringify({ verifier, state, back: location.pathname }));
  const q = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri(),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES,
    state,
  });
  location.href = `https://accounts.spotify.com/authorize?${q}`;
}

async function tokenRequest(params: Record<string, string>): Promise<Tokens> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID!, ...params }),
  });
  if (!res.ok) throw new Error(T('Spotify sign-in failed'));
  const d = await res.json();
  return { access: d.access_token, refresh: d.refresh_token ?? params.refresh_token, expiresAt: Date.now() + (d.expires_in - 60) * 1000 };
}

/** Called on /spotify/callback. Returns the path to go back to. */
export async function finishSpotifyLogin(): Promise<string> {
  const q = new URLSearchParams(location.search);
  const pkce = JSON.parse(sessionStorage.getItem(PKCE_KEY) ?? 'null');
  sessionStorage.removeItem(PKCE_KEY);
  if (!pkce) throw new Error(T('Sign-in expired, try again.'));
  if (q.get('error')) throw Object.assign(new Error(T('Spotify access was not granted.')), { back: pkce.back });
  if (q.get('state') !== pkce.state) throw Object.assign(new Error(T('Sign-in state mismatch.')), { back: pkce.back });
  save(await tokenRequest({ grant_type: 'authorization_code', code: q.get('code')!, redirect_uri: redirectUri(), code_verifier: pkce.verifier }));
  return pkce.back || '/';
}

async function accessToken(): Promise<string | null> {
  let t = load();
  if (!t) return null;
  if (Date.now() > t.expiresAt) {
    try { t = await tokenRequest({ grant_type: 'refresh_token', refresh_token: t.refresh }); save(t); }
    catch { save(null); return null; }
  }
  return t.access;
}

/** undefined = not connected / error, null = nothing playing. */
export async function nowPlaying(): Promise<Music | null | undefined> {
  const token = await accessToken();
  if (!token) return undefined;
  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers: { authorization: `Bearer ${token}` } });
  if (res.status === 204) return null;
  if (res.status === 401) { const t = load(); if (t) save({ ...t, expiresAt: 0 }); return undefined; }
  if (!res.ok) return undefined;
  const d = await res.json();
  const item = d?.item;
  if (!item) return null;
  return {
    title: item.name,
    artist: item.artists?.map((a: any) => a.name).join(', ') || item.show?.name || '',
    playing: !!d.is_playing,
    url: item.external_urls?.spotify,
  };
}
