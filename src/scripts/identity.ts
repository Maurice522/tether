/**
 * Who this browser is: a display name (cookie, persists until cleared) and a
 * stable 4-char device tag so two "Alex"es can be told apart: Alex#7F3A.
 */
import { T } from '../i18n/client';

const NAME_COOKIE = 'tether_name';
const TAG_COOKIE = 'tether_tag';
const MAX_AGE = 400 * 24 * 60 * 60; // browsers cap cookie lifetime at 400 days
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export interface Identity { name: string | null; tag: string }

function readCookie(key: string): string | null {
  const hit = document.cookie.split('; ').find((c) => c.startsWith(key + '='));
  return hit ? decodeURIComponent(hit.slice(key.length + 1)) : null;
}

function writeCookie(key: string, value: string, maxAge = MAX_AGE) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${key}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

export function identity(): Identity {
  let tag = readCookie(TAG_COOKIE);
  if (!tag || !/^[0-9A-Z]{4}$/.test(tag)) {
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    tag = Array.from(bytes, (b) => ALPHABET[b % 32]).join('');
  }
  writeCookie(TAG_COOKIE, tag); // refresh expiry on every visit
  const name = readCookie(NAME_COOKIE);
  if (name) writeCookie(NAME_COOKIE, name);
  return { name: name?.trim() || null, tag };
}

export function setName(name: string) {
  writeCookie(NAME_COOKIE, name.replace(/\s+/g, ' ').trim().slice(0, 24));
  paintIdentity();
}

export function forgetName() {
  writeCookie(NAME_COOKIE, '', 0);
  paintIdentity();
}

export function hueFor(seed: string): number {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 360;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Fill every [data-identity] element on the page. */
export function paintIdentity() {
  const { name, tag } = identity();
  document.querySelectorAll<HTMLElement>('[data-identity]').forEach((el) => {
    el.hidden = false;
    const n = el.querySelector<HTMLElement>('[data-identity-name]');
    const t = el.querySelector<HTMLElement>('[data-identity-tag]');
    const a = el.querySelector<HTMLElement>('[data-identity-avatar]');
    if (n) n.textContent = name ?? T('Set your name');
    if (t) t.textContent = name ? `#${tag}` : '';
    if (a) {
      a.textContent = name ? initials(name) : '?';
      a.style.setProperty('--hue', String(hueFor(tag)));
    }
  });
}

/**
 * Resolve with a named identity, asking for a name first if we don't have one.
 * `force` re-opens the sheet to rename.
 */
export function ensureName(opts: { force?: boolean; reason?: string } = {}): Promise<Identity & { name: string }> {
  const current = identity();
  if (current.name && !opts.force) return Promise.resolve(current as Identity & { name: string });

  const dialog = document.getElementById('name-gate') as HTMLDialogElement;
  const form = dialog.querySelector('form')!;
  const input = dialog.querySelector<HTMLInputElement>('input[name="name"]')!;
  const reason = dialog.querySelector<HTMLElement>('[data-reason]')!;
  const tagEl = dialog.querySelector<HTMLElement>('[data-gate-tag]')!;
  const preview = dialog.querySelector<HTMLElement>('[data-gate-preview]')!;
  const avatar = dialog.querySelector<HTMLElement>('[data-gate-avatar]')!;

  reason.textContent = opts.reason ?? T('This is how others in the session will see you.');
  tagEl.textContent = `#${current.tag}`;
  input.value = current.name ?? '';
  avatar.style.setProperty('--hue', String(hueFor(current.tag)));
  const update = () => {
    const v = input.value.trim();
    preview.textContent = v || T('Your name');
    preview.classList.toggle('empty', !v);
    avatar.textContent = v ? initials(v) : '?';
  };
  update();
  input.oninput = update;

  return new Promise((resolve, reject) => {
    form.onsubmit = (e) => {
      e.preventDefault();
      const v = input.value.replace(/\s+/g, ' ').trim();
      if (!v) { input.focus(); return; }
      setName(v);
      dialog.close('ok');
    };
    dialog.onclose = () => {
      const id = identity();
      if (dialog.returnValue === 'ok' && id.name) resolve(id as Identity & { name: string });
      else reject(new Error('cancelled'));
      dialog.returnValue = '';
    };
    dialog.showModal();
    requestAnimationFrame(() => { input.focus(); input.select(); });
  });
}
