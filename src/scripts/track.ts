/**
 * Anonymous funnel events for Google Tag Manager (GTM-TSGKCDZF).
 *
 * Each call pushes `{ event: 'tether_<name>', ...params }` onto the dataLayer. Params are only
 * counts and labels, never names, codes, clip text, file names or session IDs.
 *
 * Funnel: session_start | session_join → peer_connected → clip_sent / file_sent
 */
export type TrackEvent =
  | 'session_start'
  | 'session_join'
  | 'peer_connected'
  | 'clip_sent'
  | 'file_sent'
  | 'devices_remembered'
  | 'paired_reopen';

type Params = Record<string, string | number | boolean>;

/** Only fire once per page load for these, so a reconnect doesn't count twice. */
const ONCE = new Set<TrackEvent>(['peer_connected', 'clip_sent', 'file_sent']);
const fired = new Set<TrackEvent>();
const PENDING = 'tether:pending-events';

function push(entry: Record<string, unknown>) {
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    (w.dataLayer ??= []).push(entry);
  } catch { /* analytics must never break the app */ }
}

// Events recorded right before a navigation (start/join) are sent from the next page instead,
// because the page unloads before Tag Manager gets a chance to send them.
try {
  const queued = JSON.parse(sessionStorage.getItem(PENDING) ?? '[]') as Record<string, unknown>[];
  sessionStorage.removeItem(PENDING);
  queued.forEach(push);
} catch { /* private mode */ }

export function track(name: TrackEvent, params: Params = {}, opts: { beforeNavigation?: boolean } = {}) {
  if (ONCE.has(name)) {
    if (fired.has(name)) return;
    fired.add(name);
  }
  const entry = { event: `tether_${name}`, ...params };
  if (opts.beforeNavigation) {
    try {
      const queued = JSON.parse(sessionStorage.getItem(PENDING) ?? '[]');
      sessionStorage.setItem(PENDING, JSON.stringify([...queued, entry]));
      return;
    } catch { /* fall through and push now */ }
  }
  push(entry);
}
