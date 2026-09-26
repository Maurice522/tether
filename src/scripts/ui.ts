export function toast(message: string, opts: { error?: boolean; ms?: number; icon?: string } = {}) {
  let host = document.querySelector('.toasts');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toasts';
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');
    document.body.append(host);
  }
  const el = document.createElement('div');
  el.className = 'toast' + (opts.error ? ' error' : '');
  if (opts.icon) {
    const i = document.createElement('span');
    i.textContent = opts.icon;
    el.append(i);
  }
  el.append(document.createTextNode(message));
  host.append(el);
  while (host.children.length > 3) host.firstElementChild?.remove();
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, opts.ms ?? 2600);
}

export async function api<T = any>(path: string, init: { body?: unknown; member?: { id: string; token: string } } = {}): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (init.member) headers['x-tether-member'] = `${init.member.id}.${init.member.token}`;
  const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(init.body ?? {}) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error ?? `Request failed (${res.status})`), { status: res.status });
  return data as T;
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, any> = {},
  ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k.startsWith('--')) el.style.setProperty(k, String(v));
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children) if (c != null && c !== false) el.append(c);
  return el;
}

export function timeAgo(ts: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.round(m / 60)}h ago`;
}

/** Memberships live in localStorage so a refresh keeps your seat. */
export interface Membership { id: string; token: string }
export const membership = {
  get(sid: string): Membership | null {
    try { return JSON.parse(localStorage.getItem(`tether:m:${sid}`) ?? 'null'); } catch { return null; }
  },
  set(sid: string, m: Membership) {
    try { localStorage.setItem(`tether:m:${sid}`, JSON.stringify(m)); } catch { /* private mode */ }
  },
  clear(sid: string) {
    try { localStorage.removeItem(`tether:m:${sid}`); } catch { /* private mode */ }
  },
};

export function formatSid(sid: string) {
  return `${sid.slice(0, 4)}·${sid.slice(4)}`;
}
