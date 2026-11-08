import type { MemberStatus, Music, PublicMember } from '../lib/types';
import { detectReadMode, readClipboard, writeClipboard, type ReadMode } from './clipboard';
import { ensureName, hueFor, initials } from './identity';
import { FileTransfers, formatBytes, type FileItem } from './files';
import { Mesh, type PeerState } from './mesh';
import { connectSpotify, disconnectSpotify, nowPlaying, spotifyAvailable, spotifyConnected } from './spotify';
import { api, h, membership, timeAgo, toast, type Membership } from './ui';

const MAX_CLIP = 64 * 1024;
const MAX_HISTORY = 30;
const touch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
const APP_PRESETS = ['VS Code', 'Cursor', 'Figma', 'Chrome', 'Terminal', 'Photoshop', 'Excel', 'Notion', 'Slack', 'Zoom', 'Blender', 'Gaming'];

interface Clip {
  id: string;
  text: string;
  from: string;
  fromName: string;
  fromTag: string;
  at: number;
  dir: 'in' | 'out';
  via: 'p2p' | 'relay' | 'mixed';
  landed?: boolean;
}

const ICON = {
  app: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3 4 14h7l-1 7 9-11h-7z"/></svg>',
  hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8"/></svg>',
  clip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m20 11.5-8.2 8.2a5 5 0 0 1-7.1-7.1l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l7.9-7.9"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
  spotify: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1ed760"/><path d="M7 9.5c3.5-1 7.5-.7 10.5 1M7.6 12.6c3-.8 6.2-.5 8.6.9M8.2 15.5c2.4-.6 4.8-.4 6.8.7" stroke="#000" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>',
};

export async function startRoom(root: HTMLElement) {
  const sid = root.dataset.sid!;
  const $ = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;

  const views = root.querySelectorAll<HTMLElement>('[data-view]');
  const show = (name: string) => views.forEach((v) => (v.hidden = v.dataset.view !== name));

  /* ------------------------------------------------------ getting a seat */

  function showJoin(title?: string, sub?: string) {
    show('join');
    if (title) $('[data-join-title]').textContent = title;
    if (sub) $('[data-join-sub]').textContent = sub;
    setConn('off', 'Not joined');
    const form = $<HTMLFormElement>('[data-join-form]');
    const input = form.querySelector('input')!;
    const msg = $('[data-join-msg]');
    input.oninput = () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 6);
      if (input.value) { msg.hidden = true; input.classList.remove('bad'); }
    };
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (input.value.length !== 6) return input.focus();
      try {
        // Check the code before asking for a name, so a typo fails fast.
        const info = await api('/api/session/check', { body: { otp: input.value } });
        const me = await ensureName({ reason: info.host ? `You're joining ${info.host}'s session. They'll see this name.` : undefined });
        const res = await api('/api/session/join', { body: { otp: input.value, name: me.name, tag: me.tag } });
        membership.set(res.sessionId, res.member);
        if (res.sessionId !== sid) location.href = `/s/${res.sessionId}`;
        else location.reload();
      } catch (err: any) {
        if (err.message === 'cancelled') return;
        // Keep the error on screen next to the field and clear it for a retry.
        msg.textContent = err.message;
        msg.hidden = false;
        input.classList.add('bad');
        input.value = '';
        input.focus();
      }
    };
    input.focus();
  }

  let seat = membership.get(sid);
  const invite = new URLSearchParams(location.hash.slice(1)).get('invite');
  if (invite) history.replaceState(null, '', location.pathname); // keep the token out of history/screenshots
  if (!seat && invite) {
    try {
      const me = await ensureName({ reason: "You've been invited. Pick the name others will see." });
      const res = await api('/api/session/join', { body: { sessionId: sid, invite, name: me.name, tag: me.tag } });
      membership.set(sid, res.member);
      seat = res.member;
    } catch (err: any) {
      if (err.message === 'cancelled') return showJoin('Join this session?', 'You need a name to join. Open the invite link again, or enter the code.');
      return showJoin('Invite not valid', err.message);
    }
  }
  if (!seat) return showJoin();

  run(root, sid, seat, show, showJoin);
}

/* ======================================================================= */

function setConn(kind: 'ok' | 'warn' | 'off', label: string) {
  const pill = document.querySelector<HTMLElement>('[data-conn]');
  if (!pill) return;
  pill.querySelector('.dot')!.className = 'dot' + (kind === 'ok' ? ' on' : kind === 'warn' ? ' away' : '');
  pill.querySelector('[data-conn-label]')!.textContent = label;
}

function run(root: HTMLElement, sid: string, seat: Membership, show: (v: string) => void, showJoin: (t?: string, s?: string) => void) {
  const $ = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const myId = seat.id;

  /* ----------------------------------------------------------------- state */
  let members: PublicMember[] = [];
  let otp = '';
  let otpExpiresAt = 0;
  let inviteToken = '';
  let serverSkew = 0;
  let firstSync = true;
  let ended = false;
  const peerState = new Map<string, PeerState>();
  const outbox: { to: string; type: string; data: unknown }[] = [];

  let myApp = localStorage.getItem('tether:app') ?? '';
  let myMusic: Music | null = null;
  let statusDirty = true;

  let syncing = true;
  let readMode: ReadMode = 'manual';
  let lastClip: string | null = null; // what we believe the OS clipboard holds
  let pending: Clip | null = null;     // received while unfocused, written on focus
  const seen = new Set<string>();
  let clips: Clip[] = [];
  try { clips = JSON.parse(sessionStorage.getItem(`tether:clips:${sid}`) ?? '[]'); } catch { /* fresh */ }
  clips.forEach((c) => seen.add(c.id));

  // render caches
  let positions = new Map<string, [number, number]>();
  let constellationKey = '';
  const renderedClips = new Set<string>();
  let clipsRenderQueued = false;
  /** Keyed like the member cards: an item is rebuilt only when what it shows changes. */
  const clipEls = new Map<string, { key: string; el: HTMLElement }>();
  /** Keyed cache so a card is only rebuilt when its own data changes (keeps clicks from landing on detached nodes). */
  const memberCards = new Map<string, { key: string; el: HTMLElement }>();

  const myStatus = (): MemberStatus => ({ app: myApp || undefined, music: myMusic, focused: document.visibilityState === 'visible' && document.hasFocus() });
  const nameOf = (id: string) => members.find((m) => m.id === id);

  /* ------------------------------------------------------------------ mesh */
  const mesh = new Mesh(myId, {
    signal(to, type, data) {
      outbox.push({ to, type, data });
      schedule(0);
    },
    message(from, msg) {
      if (files.message(from, msg)) return;
      if (msg?.t === 'clip') receive(from, msg, 'p2p');
      else if (msg?.t === 'status') {
        const m = nameOf(from);
        if (m) { m.status = msg.status; renderConstellation(); renderMembers(); }
      }
    },
    binary(from, data) {
      files.binary(from, data);
    },
    state(peerId, state) {
      peerState.set(peerId, state);
      if (state !== 'open') files.peerGone(peerId);
      if (state === 'open') mesh.send(peerId, { t: 'status', status: myStatus() });
      renderAll();
      schedule(state === 'open' ? 800 : 0);
    },
  });

  /* ----------------------------------------------------------------- files */
  const fileStatus = new Map<string, FileItem['status']>();
  const files = new FileTransfers(mesh, myId, (item) => {
    const prev = fileStatus.get(item.id);
    fileStatus.set(item.id, item.status);
    if (prev !== item.status && item.dir === 'in') {
      const who = nameOf(item.from)?.name ?? 'Someone';
      if (!prev) pulse(item.from, myId);
      if (item.status === 'done') toast(`${who} sent ${item.name}`, { icon: '↓' });
      if (item.status === 'failed') toast(`${item.name} from ${who} was interrupted`, { error: true });
    }
    if (prev !== item.status && item.dir === 'out' && item.status === 'partial') {
      toast(`${item.name} didn't reach ${item.missed!.map((id) => nameOf(id)?.name ?? 'someone').join(', ')}`, { error: true });
    }
    scheduleClipsRender();
  });

  /** Send to everyone online, or just `only`. Files need a direct link: they never go through the server. */
  function sendFiles(list: FileList | File[], only?: string) {
    const picked = [...list];
    if (!picked.length) return;
    const targets = members.filter((m) => m.id !== myId && m.online && (!only || m.id === only));
    if (!targets.length) { toast(only ? "They're offline right now." : 'Nobody else is online yet.', { error: true }); return; }
    const direct = targets.filter((m) => mesh.channel(m.id));
    const indirect = targets.filter((m) => !mesh.channel(m.id));
    if (!direct.length) {
      toast("Files only travel over a direct link, and there isn't one yet. Try again in a moment.", { error: true });
      return;
    }
    let queued = 0;
    for (const file of picked) {
      if (files.send(file, direct.map((m) => m.id))) {
        queued++;
        for (const m of direct) pulse(myId, m.id);
      } else toast(`${file.name} is over 500 MB, too big to send.`, { error: true });
    }
    if (!queued) return;
    const names = direct.length === 1 ? direct[0].name : `${direct.length} people`;
    toast(`Sending ${queued === 1 ? picked[0].name : `${queued} files`} to ${names}`, { icon: '↗' });
    if (indirect.length) toast(`${indirect.map((m) => m.name).join(', ')} has no direct link, so they won't get it.`, { error: true });
  }

  const fileInput = h('input', { type: 'file', multiple: true, hidden: true });
  document.body.append(fileInput);
  let fileTarget: string | undefined;
  function pickFiles(only?: string) {
    fileTarget = only;
    fileInput.value = '';
    fileInput.click();
  }
  fileInput.addEventListener('change', () => { if (fileInput.files) sendFiles(fileInput.files, fileTarget); });

  // Drag & drop: onto a person's card sends to them, anywhere else sends to everyone.
  const veil = document.querySelector<HTMLElement>('[data-drop-veil]')!;
  let dragDepth = 0;
  const clearDropTargets = (keep?: Element | null) =>
    document.querySelectorAll('.member.drop-target').forEach((el) => { if (el !== keep) el.classList.remove('drop-target'); });
  const hasFiles = (e: DragEvent) => !!e.dataTransfer?.types.includes('Files');
  document.addEventListener('dragenter', (e) => { if (!hasFiles(e) || ended) return; dragDepth++; veil.hidden = false; });
  document.addEventListener('dragleave', (e) => { if (!hasFiles(e)) return; if (--dragDepth <= 0) { dragDepth = 0; veil.hidden = true; clearDropTargets(); } });
  document.addEventListener('dragover', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    const card = (e.target as HTMLElement).closest<HTMLElement>('.member[data-id]');
    const target = card && card.dataset.id !== myId ? nameOf(card.dataset.id!) : undefined;
    clearDropTargets(target ? card : null);
    if (target) card!.classList.add('drop-target');
    veil.querySelector('[data-drop-label]')!.textContent = target ? `Drop to send to ${target.name}` : 'Drop to send to everyone';
  });
  document.addEventListener('drop', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth = 0;
    veil.hidden = true;
    clearDropTargets();
    if (ended || !e.dataTransfer) return;
    const card = (e.target as HTMLElement).closest<HTMLElement>('.member[data-id]');
    sendFiles(e.dataTransfer.files, card && card.dataset.id !== myId ? card.dataset.id : undefined);
  });

  /* ------------------------------------------------------------- live link */
  // One WebSocket to the session's Durable Object carries roster, status, WebRTC signaling
  // and the clip relay. No polling: background tabs get events as fast as foreground ones.
  let ws: WebSocket | null = null;
  let authed = false;
  let failures = 0;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let flushQueued = false;

  /** Flush queued signals and any status change. Name kept from the polling days; callers just mean "soon". */
  function schedule(_ms?: number) {
    if (flushQueued) return;
    flushQueued = true;
    queueMicrotask(() => { flushQueued = false; flush(); });
  }

  function flush() {
    if (!ws || ws.readyState !== WebSocket.OPEN || !authed) return;
    while (outbox.length) {
      const s = outbox.shift()!;
      ws.send(JSON.stringify({ t: 'signal', to: s.to, type: s.type, data: s.data }));
    }
    if (statusDirty) {
      statusDirty = false;
      ws.send(JSON.stringify({ t: 'status', status: myStatus() }));
    }
  }

  function connect() {
    if (ended) return;
    clearTimeout(retryTimer);
    const sock = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/session/${sid}/ws`);
    ws = sock;
    authed = false;
    // Keepalive; the server answers "pong" without waking the Durable Object.
    const ping = setInterval(() => { if (sock.readyState === WebSocket.OPEN) sock.send('ping'); }, 25_000);
    sock.onopen = () => {
      // Authenticate in the first message so the member token never appears in a URL.
      sock.send(JSON.stringify({ t: 'auth', id: seat.id, token: seat.token, status: myStatus() }));
      statusDirty = false;
    };
    sock.onmessage = (e) => {
      if (e.data === 'pong' || typeof e.data !== 'string') return;
      let msg: any;
      try { msg = JSON.parse(e.data); } catch { return; }
      void onServer(msg);
    };
    sock.onclose = (e) => {
      clearInterval(ping);
      if (ws !== sock) return;
      ws = null;
      authed = false;
      if (ended || e.code === 4003) return; // 4003: denied, handled in onServer
      if (e.code === 4002) { endSession("This session is open in another tab", 'Close the other tab, or reload here to take over.', false); return; }
      if (e.code === 4001) return; // we left
      failures++;
      setConn('warn', 'Reconnecting…');
      retryTimer = setTimeout(connect, Math.min(15_000, 400 * 2 ** failures));
    };
  }

  async function onServer(msg: any) {
    if (msg.t === 'roster') {
      authed = true;
      failures = 0;
      serverSkew = msg.now - Date.now();
      const prevIds = new Set(members.map((m) => m.id));
      members = msg.members;
      if (msg.otp !== otp) { otp = msg.otp; flapTo(otp); }
      otpExpiresAt = msg.otpExpiresAt;
      inviteToken = msg.invite;
      if (firstSync) {
        welcome();
      } else {
        for (const m of members) if (!prevIds.has(m.id) && m.id !== myId) {
          toast(`${m.name} joined`, { icon: '→' });
          bumpNode(m.id);
        }
        for (const id of prevIds) if (!members.some((m) => m.id === id)) toast('Someone left the session');
      }
      firstSync = false;
      mesh.reconcile(members.filter((m) => m.online).map((m) => m.id));
      for (const m of members) if (!m.online) files.peerGone(m.id);
      flush();
      show('room');
      renderAll();
    } else if (msg.t === 'signal') {
      if (msg.type === 'clip') void receive(msg.from, msg.data, 'relay');
      else await mesh.handleSignal(msg.from, msg.type, msg.data);
    } else if (msg.t === 'denied') {
      endSession(
        msg.reason === 'ended' ? 'This session has ended' : "You're no longer in this session",
        'Enter a fresh code to join again, or start a new session.',
        true,
      );
    }
  }

  /** First roster: tell a joiner whose session this is (the creator already knows). */
  function welcome() {
    const me = nameOf(myId);
    const host = members.find((m) => m.host);
    if (me && host && host.id !== myId && Date.now() - me.joinedAt < 60_000) {
      toast(`You joined ${host.name}'s session`, { icon: '✓', ms: 3600 });
    }
  }

  function endSession(title: string, sub: string, forget: boolean) {
    ended = true;
    mesh.close();
    ws?.close(1000);
    if (forget) membership.clear(sid);
    showJoin(title, sub);
  }

  // Come back fast when the tab or network returns instead of waiting out the backoff.
  const revive = () => { if (!ended && !ws) connect(); };
  window.addEventListener('online', revive);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') revive(); });

  /* ------------------------------------------------------------- clipboard */

  function persistClips() {
    try { sessionStorage.setItem(`tether:clips:${sid}`, JSON.stringify(clips.slice(0, MAX_HISTORY))); } catch { /* quota */ }
  }

  /**
   * `auto` / `clipboard`: the text came from the OS clipboard, so it becomes the new baseline.
   * `typed`: composer text never touched the clipboard; leave the baseline alone, or the next
   * auto-read sees the (unchanged) clipboard as "new" and sends it again.
   */
  function share(text: string, source: 'auto' | 'clipboard' | 'typed') {
    if (!text.trim()) return;
    if (source !== 'typed') lastClip = text;
    if (new Blob([text]).size > MAX_CLIP) { toast('That clip is over 64 KB — too big to send.', { error: true }); return; }
    if (!syncing && source === 'auto') return;
    const key = text.trim();
    if (clips.some((c) => c.text.trim() === key)) {
      if (source !== 'auto') toast('Already in the list. Use its copy button instead.');
      return;
    }
    const peers = members.filter((m) => m.id !== myId && m.online);
    const me = nameOf(myId);
    const clip: Clip = {
      id: crypto.randomUUID(), text, from: myId, fromName: me?.name ?? 'You', fromTag: me?.tag ?? '',
      at: Date.now(), dir: 'out', via: 'p2p',
    };
    seen.add(clip.id);
    let relayed = 0;
    for (const p of peers) {
      const payload = { t: 'clip', id: clip.id, text, at: clip.at };
      if (!mesh.send(p.id, payload)) { outbox.push({ to: p.id, type: 'clip', data: payload }); relayed++; }
      pulse(myId, p.id);
    }
    if (relayed) { clip.via = relayed === peers.length ? 'relay' : 'mixed'; schedule(0); }
    clips.unshift(clip);
    clips = clips.slice(0, MAX_HISTORY);
    persistClips();
    renderClips();
    if (!peers.length) toast('Saved here. Nobody else is online yet.');
    else if (source !== 'auto') toast(`Sent to ${peers.length === 1 ? peers[0].name : `${peers.length} devices`}`, { icon: '↗' });
  }

  async function receive(from: string, msg: any, via: 'p2p' | 'relay') {
    if (!msg || typeof msg.text !== 'string' || typeof msg.id !== 'string' || seen.has(msg.id)) return;
    seen.add(msg.id);
    const m = nameOf(from);
    const clip: Clip = {
      id: msg.id, text: msg.text.slice(0, MAX_CLIP), from, fromName: m?.name ?? 'Someone', fromTag: m?.tag ?? '',
      at: typeof msg.at === 'number' ? msg.at : Date.now(), dir: 'in', via,
    };
    clips.unshift(clip);
    clips = clips.slice(0, MAX_HISTORY);
    pulse(from, myId);
    if (syncing) {
      if (document.hasFocus() && (await writeClipboard(clip.text))) {
        clip.landed = true;
        lastClip = clip.text;
      } else {
        pending = clip;
        document.title = `● ${clip.fromName} sent a clip — Tether`;
      }
    }
    persistClips();
    renderClips();
  }

  async function onFocus() {
    if (ended) return;
    statusDirty = true;
    broadcastStatus();
    if (pending && syncing) {
      const clip = pending;
      pending = null;
      document.title = document.title.replace(/^● .* — Tether$/, `Session ${sid.slice(0, 4)}·${sid.slice(4)} — Tether`);
      // Chrome wants the document fully focused before writes; give it a frame.
      await new Promise((r) => setTimeout(r, 60));
      if (await writeClipboard(clip.text)) {
        clip.landed = true;
        lastClip = clip.text;
        toast(`Clip from ${clip.fromName} is on your clipboard`, { icon: '✓' });
        persistClips();
        renderClips();
        return; // don't bounce it straight back out
      }
      pending = clip; // still not allowed; try again next focus (or the user clicks copy)
      return;
    }
    await autoRead();
  }

  async function autoRead() {
    if (readMode !== 'auto' || !syncing || !document.hasFocus() || pending) return;
    const text = await readClipboard();
    if (text == null) return;
    if (lastClip === null) { lastClip = text; return; } // baseline: don't broadcast what was there before joining
    if (text && text !== lastClip) share(text, 'auto');
  }

  // Catch copies made inside the tab (and edge cases where focus didn't fire).
  setInterval(() => { if (document.visibilityState === 'visible') void autoRead(); }, 1500);
  window.addEventListener('focus', () => void onFocus());
  document.addEventListener('visibilitychange', () => {
    statusDirty = true;
    broadcastStatus();
    if (document.visibilityState === 'visible') void onFocus();
    schedule(300);
  });
  window.addEventListener('blur', () => { statusDirty = true; broadcastStatus(); });

  // Ctrl+V anywhere on the page (outside inputs) sends immediately. Works in every browser.
  document.addEventListener('paste', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('input, textarea, [contenteditable]') || document.querySelector('dialog[open]')) return;
    if (e.clipboardData?.files.length) { e.preventDefault(); sendFiles(e.clipboardData.files); return; }
    const text = e.clipboardData?.getData('text/plain');
    if (text) { e.preventDefault(); share(text, 'clipboard'); }
  });

  const composer = $<HTMLFormElement>('[data-composer]');
  const composerInput = $<HTMLTextAreaElement>('[data-composer-input]');
  composer.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = composerInput.value;
    if (!v.trim()) return composerInput.focus();
    share(v, 'typed');
    composerInput.value = '';
  });
  composerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); composer.requestSubmit(); }
  });
  $('[data-send-file]').addEventListener('click', () => pickFiles());
  $('[data-send-clipboard]').addEventListener('click', async () => {
    const text = await readClipboard();
    if (text == null) toast('Clipboard access was blocked. Press Ctrl+V on the page instead.', { error: true });
    else if (!text.trim()) toast('Your clipboard is empty (or holds an image, which isn\'t supported yet).');
    else share(text, 'clipboard');
  });

  const syncToggle = $<HTMLInputElement>('[data-sync-toggle]');
  syncToggle.addEventListener('change', () => {
    syncing = syncToggle.checked;
    $('[data-sync-label]').textContent = syncing ? 'Syncing' : 'Paused';
    if (syncing) lastClip = null; // re-baseline so we don't dump what was copied while paused
    renderMode();
  });

  detectReadMode((m) => { readMode = m; renderMode(); if (m === 'auto') void autoRead(); }).then((m) => {
    readMode = m;
    renderMode();
    void autoRead();
  });

  /* ---------------------------------------------------------------- status */

  function broadcastStatus() {
    const status = myStatus();
    for (const m of members) if (m.id !== myId) mesh.send(m.id, { t: 'status', status });
    const me = nameOf(myId);
    if (me) me.status = status;
    renderConstellation();
    renderMembers();
    schedule(400);
  }

  async function pollSpotify() {
    if (!spotifyConnected()) return;
    const music = await nowPlaying().catch(() => undefined);
    if (music === undefined && !spotifyConnected()) { myMusic = null; statusDirty = true; broadcastStatus(); return; }
    if (music === undefined) return;
    if (JSON.stringify(music) !== JSON.stringify(myMusic)) {
      myMusic = music;
      statusDirty = true;
      broadcastStatus();
    }
  }
  void pollSpotify();
  setInterval(pollSpotify, 20_000);

  const picker = document.getElementById('app-picker') as HTMLDialogElement;
  const presets = picker.querySelector<HTMLElement>('[data-presets]')!;
  const customApp = picker.querySelector<HTMLInputElement>('[data-custom-app]')!;
  function openPicker() {
    presets.replaceChildren(...APP_PRESETS.map((name) =>
      h('button', { class: 'btn btn-sm' + (name === myApp ? ' active' : ''), value: `preset:${name}` }, name)));
    customApp.value = APP_PRESETS.includes(myApp) ? '' : myApp;
    picker.showModal();
  }
  picker.addEventListener('close', () => {
    const v = picker.returnValue;
    picker.returnValue = '';
    if (!v || v === 'cancel') return;
    myApp = v === 'clear' ? '' : v === 'custom' ? customApp.value.trim().slice(0, 40) : v.startsWith('preset:') ? v.slice(7) : myApp;
    try { localStorage.setItem('tether:app', myApp); } catch { /* ignore */ }
    statusDirty = true;
    broadcastStatus();
  });

  /* ---------------------------------------------------------------- invite */

  const inviteUrl = () => `${location.origin}/s/${sid}#invite=${inviteToken}`;

  async function copyInvite() {
    if (!inviteToken) return;
    if (await writeClipboard(inviteUrl())) {
      lastClip = inviteUrl(); // don't sync our own invite link out
      toast('Invite link copied', { icon: '✓' });
    }
  }
  $('[data-copy-invite]').addEventListener('click', copyInvite);
  const shareBtn = $<HTMLButtonElement>('[data-share]');
  if (navigator.share) {
    shareBtn.hidden = false;
    shareBtn.addEventListener('click', () => navigator.share({ title: 'Join my Tether session', text: `Code: ${otp}`, url: inviteUrl() }).catch(() => {}));
  }
  $('[data-flap]').addEventListener('click', async () => {
    if (otp && Date.now() + serverSkew < otpExpiresAt && (await writeClipboard(otp))) {
      lastClip = otp;
      toast('Code copied', { icon: '✓' });
    }
  });
  $('[data-new-code]').addEventListener('click', async () => {
    try {
      const res = await api(`/api/session/${sid}/otp`, { member: seat });
      otp = res.otp;
      otpExpiresAt = res.otpExpiresAt;
      flapTo(otp);
      renderTimer();
    } catch (err: any) { toast(err.message, { error: true }); }
  });

  $('[data-leave]').addEventListener('click', async () => {
    ended = true;
    clearTimeout(retryTimer);
    mesh.close();
    ws?.close(1000);
    await api(`/api/session/${sid}/leave`, { member: seat }).catch(() => {});
    membership.clear(sid);
    try { sessionStorage.removeItem(`tether:clips:${sid}`); } catch { /* ignore */ }
    location.href = '/';
  });

  /* ============================================================ rendering */

  function renderAll() {
    renderConn();
    renderConstellation();
    renderMembers();
    renderTimer();
  }

  function renderConn() {
    const peers = members.filter((m) => m.id !== myId && m.online);
    if (!peers.length) return setConn('warn', 'Waiting for others');
    const open = peers.filter((p) => peerState.get(p.id) === 'open').length;
    if (open === peers.length) setConn('ok', `Direct link · ${peers.length + 1} devices`);
    else if (open) setConn('warn', `${open}/${peers.length} direct, rest relayed`);
    else setConn('warn', 'Linking…');
  }

  function linkClass(peerId: string) {
    const s = peerState.get(peerId);
    return s === 'open' ? 'open' : s === 'failed' ? 'relay' : 'connecting';
  }

  const LAYOUTS: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[22, 50], [78, 50]],
    3: [[50, 18], [20, 78], [80, 78]],
    4: [[22, 22], [78, 22], [22, 78], [78, 78]],
  };

  function renderConstellation() {
    const key = JSON.stringify([members.map((m) => [m.id, m.name, m.online, m.id === myId ? { ...m.status, focused: true } : m.status]), [...peerState]]);
    if (key === constellationKey) return;
    constellationKey = key;
    const host = $('[data-constellation]');
    const svg = $('[data-links]') as unknown as SVGSVGElement;
    // Keep "me" first so my node stays put as people come and go.
    const ordered = [...members].sort((a, b) => (a.id === myId ? -1 : b.id === myId ? 1 : a.joinedAt - b.joinedAt));
    const seats = Math.min(4, Math.max(2, ordered.length + (ordered.length < 4 ? 1 : 0)));
    const layout = LAYOUTS[seats];
    positions = new Map(ordered.map((m, i) => [m.id, layout[i]]));

    const lines: string[] = [];
    for (let i = 0; i < ordered.length; i++) for (let j = i + 1; j < ordered.length; j++) {
      const a = ordered[i], b = ordered[j];
      const [x1, y1] = positions.get(a.id)!, [x2, y2] = positions.get(b.id)!;
      const involvesMe = a.id === myId || b.id === myId;
      const other = a.id === myId ? b.id : a.id;
      const cls = !a.online || !b.online ? '' : involvesMe ? linkClass(other) : 'open';
      lines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" ${involvesMe ? '' : 'opacity=".45"'} />`);
    }
    svg.innerHTML = lines.join('');

    const keep = new Set<Element>([svg]);
    ordered.forEach((m) => {
      let node = host.querySelector<HTMLElement>(`.node[data-id="${m.id}"]`);
      if (!node) {
        node = h('div', { class: 'node', 'data-id': m.id });
        host.append(node);
      }
      const [x, y] = positions.get(m.id)!;
      node.style.left = `${x}%`;
      node.style.top = `${y}%`;
      node.classList.toggle('me', m.id === myId);
      node.classList.toggle('offline', !m.online);
      const presence = !m.online ? '' : m.id === myId || m.status.focused ? ' on' : ' away';
      const sub = m.status.music?.playing ? `♪ ${m.status.music.title}` : m.status.app ? m.status.app : m.id === myId ? 'You' : m.online ? (m.status.focused ? 'Here now' : 'Away') : 'Offline';
      node.innerHTML = '';
      node.append(
        h('span', { class: 'avatar', '--hue': hueFor(m.tag) }, initials(m.name), h('span', { class: 'dot' + presence })),
        h('span', { class: 'who' }, m.name, h('span', { class: 'tag' }, `#${m.tag}`)),
        h('span', { class: 'sub' }, sub),
      );
      keep.add(node);
    });
    // Empty seats double as invite buttons.
    for (let i = ordered.length; i < seats; i++) {
      const [x, y] = layout[i];
      const seatBtn = h('button', { class: 'node empty', type: 'button', title: 'Copy invite link', style: { left: `${x}%`, top: `${y}%` }, onclick: copyInvite },
        h('span', { class: 'avatar' }, '+'),
        h('span', { class: 'sub' }, 'Invite someone'),
      );
      keep.add(seatBtn);
      host.append(seatBtn);
    }
    [...host.children].forEach((c) => { if (!keep.has(c)) c.remove(); });
    $('[data-count]').textContent = String(members.filter((m) => m.online).length);
  }

  function bumpNode(id: string) {
    requestAnimationFrame(() => {
      const n = root.querySelector(`.node[data-id="${id}"]`);
      n?.classList.remove('bump'); void (n as HTMLElement | null)?.offsetWidth; n?.classList.add('bump');
    });
  }

  function pulse(fromId: string, toId: string) {
    const a = positions.get(fromId), b = positions.get(toId);
    if (!a || !b || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const host = $('[data-constellation]');
    const dot = h('span', { class: 'pulse' });
    host.append(dot);
    dot.animate(
      [
        { left: `${a[0]}%`, top: `${a[1]}%`, transform: 'scale(.4)', opacity: 0 },
        { opacity: 1, transform: 'scale(1)', offset: 0.15 },
        { left: `${b[0]}%`, top: `${b[1]}%`, transform: 'scale(.6)', opacity: 0.2 },
      ],
      { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)' },
    ).finished.then(() => { dot.remove(); bumpNode(toId); });
  }


  function renderMembers() {
    const host = $('[data-members]');
    const ordered = [...members].sort((a, b) => (a.id === myId ? -1 : b.id === myId ? 1 : a.joinedAt - b.joinedAt));
    const els = ordered.map((m) => {
      // My own focus flag is not shown on my card; it flips on the very click that focuses the window.
      const status = m.id === myId ? { ...m.status, focused: true } : m.status;
      const key = JSON.stringify([m, status, peerState.get(m.id), m.id === myId && [myApp, spotifyConnected()]]);
      const cached = memberCards.get(m.id);
      if (cached?.key === key) return cached.el;
      const el = memberCard(m, !cached);
      memberCards.set(m.id, { key, el });
      return el;
    });
    for (const id of memberCards.keys()) if (!members.some((m) => m.id === id)) memberCards.delete(id);
    const same = els.length === host.children.length && els.every((el, i) => host.children[i] === el);
    if (!same) host.replaceChildren(...els);
  }

  function memberCard(m: PublicMember, enter: boolean): HTMLElement {
    const isMe = m.id === myId;
    const presence = !m.online ? 'Offline' : m.status.focused ? 'Here now' : 'Away';
    const lines = h('div', { class: 'lines' });

    if (isMe) {
      lines.append(h('button', { class: 'editable', type: 'button', onclick: openPicker },
        iconEl(ICON.app), h('span', {}, myApp ? `Working in ${myApp}` : "Set what you're working in")));
      if (spotifyAvailable()) {
        if (!spotifyConnected()) {
          lines.append(h('button', { class: 'editable', type: 'button', onclick: () => connectSpotify() }, iconEl(ICON.spotify), h('span', {}, 'Connect Spotify')));
        } else if (!m.status.music) {
          lines.append(h('button', { class: 'editable', type: 'button', title: 'Disconnect Spotify', onclick: () => { disconnectSpotify(); myMusic = null; statusDirty = true; broadcastStatus(); } },
            iconEl(ICON.spotify), h('span', {}, 'Nothing playing')));
        }
      }
    } else if (m.status.app) {
      lines.append(h('span', { class: 'line-item' }, iconEl(ICON.app), h('span', {}, m.status.app)));
    }
    if (m.status.music) lines.append(musicEl(m.status.music));
    if (!isMe && !m.status.app && !m.status.music) lines.append(h('span', { class: 'line-item' }, h('span', {}, presence)));

    const s = peerState.get(m.id);
    const conn = isMe ? null
      : !m.online ? h('span', { class: 'pill' }, h('span', { class: 'dot' }), 'Offline')
      : s === 'open' ? h('span', { class: 'pill', title: 'Clips go directly between your browsers, end-to-end encrypted' }, h('span', { class: 'dot on' }), 'Direct')
      : s === 'failed' ? h('span', { class: 'pill', title: 'A direct link could not be made, so clips go through the server (deleted after 2 min)' }, h('span', { class: 'dot away' }), 'Relayed')
      : h('span', { class: 'pill' }, h('span', { class: 'dot away' }), 'Linking…');

    return h('article', { class: 'member' + (enter ? ' enter' : ''), 'data-id': m.id },
      h('span', { class: 'avatar', '--hue': hueFor(m.tag) }, initials(m.name)),
      h('div', { class: 'top' },
        h('span', { class: 'who' }, m.name, h('span', { class: 'tag' }, `#${m.tag}`)),
        isMe && h('span', { class: 'badge you' }, 'You'),
        m.host && h('span', { class: 'badge' }, 'Host'),
        isMe || !m.online ? null : h('span', { class: 'dot' + (m.status.focused ? ' on' : ' away'), title: presence }),
      ),
      h('div', { class: 'conn' }, conn,
        !isMe && m.online && s === 'open' && sendFileBtn(m)),
      lines,
    );
  }

  function sendFileBtn(m: PublicMember) {
    const b = h('button', {
      class: 'btn btn-sm btn-ghost icon-btn', type: 'button',
      title: `Send a file to ${m.name}`, 'aria-label': `Send a file to ${m.name}`,
      onclick: () => pickFiles(m.id),
    });
    b.innerHTML = ICON.clip;
    return b;
  }

  function musicEl(music: Music) {
    const label = `${music.title}${music.artist ? ' · ' + music.artist : ''}`;
    const text = music.url ? h('a', { href: music.url, target: '_blank', rel: 'noopener' }, label) : h('span', {}, label);
    return h('span', { class: 'line-item', title: music.playing ? 'Playing on Spotify' : 'Paused on Spotify' },
      h('span', { class: 'eq' + (music.playing ? '' : ' paused') }, h('i'), h('i'), h('i')), text);
  }

  function iconEl(svg: string) {
    const s = h('span', { class: 'ic' });
    s.innerHTML = svg;
    return s;
  }

  function renderMode() {
    const host = $('[data-mode]');
    host.replaceChildren();
    if (!syncing) {
      host.append(iconEl(ICON.hand), h('span', {}, h('b', {}, 'Paused.'), ' Nothing is sent or written to your clipboard.'));
      return;
    }
    if (readMode === 'auto') {
      host.append(iconEl(ICON.bolt), h('span', {}, h('b', {}, 'Auto-sync on.'), ' Copy anywhere, then come back to this tab and it sends.'));
    } else if (readMode === 'prompt') {
      host.append(iconEl(ICON.bolt), h('span', {}, h('b', {}, 'Turn on auto-sync.'), ' Let this tab read your clipboard when you switch to it.'),
        h('button', { class: 'btn btn-sm btn-accent', type: 'button', onclick: async () => {
          const text = await readClipboard();
          if (text != null) { lastClip = text; readMode = 'auto'; renderMode(); toast('Auto-sync on', { icon: '⚡' }); }
        } }, 'Allow'));
    } else if (readMode === 'denied') {
      host.append(iconEl(ICON.hand), h('span', {}, h('b', {}, 'Clipboard access blocked.'), touch ? ' Paste into the box below to send.' : ' Press Ctrl+V on this page to send, or allow access from the lock icon in the address bar.'));
    } else {
      host.append(iconEl(ICON.hand), touch
        ? h('span', {}, h('b', {}, 'Paste into the box below to send.'), ' Or tap Send my clipboard.')
        : h('span', {}, h('b', {}, 'Press Ctrl+V on this page to send.'), ' This browser only lets a page read the clipboard after a keypress.'));
    }
  }

  /** File progress fires per chunk; coalesce into one paint every ~120 ms. */
  function scheduleClipsRender() {
    if (clipsRenderQueued) return;
    clipsRenderQueued = true;
    setTimeout(() => { clipsRenderQueued = false; renderClips(); }, 120);
  }


  function renderClips() {
    const host = $('[data-clips]');
    if (!clips.length && !files.items.length) {
      clipEls.clear();
      host.replaceChildren(h('li', { class: 'clip-empty' },
        ...(touch
          ? ['Nothing shared yet. Paste text into the box above, or send a file.']
          : ['Nothing shared yet. Copy something and press ', h('kbd', {}, 'Ctrl'), h('kbd', {}, 'V'), ' here, or drop a file anywhere.'])));
      return;
    }
    const now = Date.now();
    const entries: (Clip | FileItem)[] = [...clips, ...files.items].sort((a, b) => b.at - a.at);
    const els = entries.map((c) => {
      const isFile = 'kind' in c;
      const key = isFile
        ? JSON.stringify([c.status, c.missed, !!c.url, timeAgo(c.at, now)])
        : JSON.stringify([c.landed, pending?.id === c.id, c.via, timeAgo(c.at, now)]);
      const cached = clipEls.get(c.id);
      if (cached?.key === key) return cached.el;
      const el = isFile ? fileEl(c, !cached && !renderedClips.has(c.id), now) : clipEl(c, !cached && !renderedClips.has(c.id), now);
      renderedClips.add(c.id);
      clipEls.set(c.id, { key, el });
      return el;
    });
    const live = new Set(entries.map((c) => c.id));
    for (const id of clipEls.keys()) if (!live.has(id)) clipEls.delete(id);
    const same = els.length === host.children.length && els.every((el, i) => host.children[i] === el);
    if (!same) host.replaceChildren(...els);
    // Progress changes every chunk: patch the bars in place instead of rebuilding.
    for (const f of files.items) {
      const el = clipEls.get(f.id)?.el;
      const bar = el?.querySelector<HTMLElement>('.file-bar > span');
      if (bar) bar.style.transform = `scaleX(${f.progress})`;
      const pct = el?.querySelector('[data-pct]');
      if (pct) pct.textContent = `${Math.floor(f.progress * 100)}%`;
    }
  }

  function clipEl(c: Clip, enter: boolean, now: number) {
    const copyBtn = h('button', { class: 'btn btn-sm btn-ghost icon-btn copy', type: 'button', 'aria-label': 'Copy' });
    copyBtn.innerHTML = ICON.copy;
    copyBtn.addEventListener('click', async () => {
      if (await writeClipboard(c.text)) {
        lastClip = c.text;
        copyBtn.innerHTML = ICON.check;
        setTimeout(() => (copyBtn.innerHTML = ICON.copy), 1400);
        if (pending?.id === c.id) pending = null;
        c.landed = true;
        persistClips();
      }
    });
    const state = c.dir === 'in'
      ? c.landed ? h('span', { class: 'landed' }, '✓ on clipboard') : pending?.id === c.id ? h('span', { class: 'waiting' }, 'waiting for focus') : null
      : null;
    return h('li', { class: `clip ${c.dir}${enter ? ' enter' : ''}` },
      h('div', { class: 'clip-meta' },
        h('span', {}, c.dir === 'in' ? '↘' : '↗'),
        h('span', { class: 'who' }, c.dir === 'out' ? 'You' : c.fromName),
        h('span', {}, timeAgo(c.at, now)),
        c.via !== 'p2p' && h('span', { class: 'via', title: 'Went through the server because a direct link was not available' }, 'relay'),
        state,
      ),
      h('div', { class: 'clip-text' }, c.text),
      copyBtn,
    );
  }

  function fileEl(f: FileItem, enter: boolean, now: number) {
    const peerNames = (ids: string[]) => ids.map((id) => nameOf(id)?.name ?? 'someone').join(', ');
    const who = f.dir === 'out'
      ? `You → ${f.peers.length === 1 ? peerNames(f.peers) : `${f.peers.length} people`}`
      : nameOf(f.from)?.name ?? 'Someone';
    const state =
      f.status === 'active' ? h('span', { class: 'waiting' }, f.dir === 'in' ? 'receiving ' : 'sending ', h('span', { 'data-pct': true }, '0%'))
      : f.status === 'done' ? h('span', { class: 'landed' }, f.dir === 'in' ? '✓ received' : '✓ delivered')
      : f.status === 'partial' ? h('span', { class: 'waiting' }, `missed ${peerNames(f.missed ?? [])}`)
      : h('span', { class: 'failed' }, f.dir === 'in' ? 'interrupted' : 'not delivered');
    const ext = (f.name.includes('.') ? f.name.split('.').pop()! : 'file').slice(0, 4).toUpperCase();
    let action: HTMLElement | null = null;
    if (f.dir === 'in' && f.status === 'done' && f.url) {
      action = h('a', { class: 'btn btn-sm btn-accent', href: f.url, download: f.name, title: `Save ${f.name}` });
      action.innerHTML = ICON.download;
      action.append('Save');
    }
    return h('li', { class: `clip file ${f.dir}${enter ? ' enter' : ''}` },
      h('div', { class: 'clip-meta' },
        h('span', {}, f.dir === 'in' ? '↘' : '↗'),
        h('span', { class: 'who' }, who),
        h('span', {}, timeAgo(f.at, now)),
        h('span', { class: 'via', title: 'Sent straight between browsers. The file never touched a server.' }, 'p2p'),
        state,
      ),
      h('div', { class: 'file-row' },
        h('span', { class: 'file-ext mono' }, ext),
        h('div', { class: 'file-info' },
          h('span', { class: 'file-name', title: f.name }, f.name),
          h('span', { class: 'file-size mono' }, formatBytes(f.size)),
        ),
      ),
      f.status === 'active' && h('div', { class: 'file-bar' }, h('span', { style: { transform: `scaleX(${f.progress})` } })),
      action,
    );
  }

  /* split-flap OTP */
  let flapGen = 0;
  function flapTo(code: string) {
    const gen = ++flapGen;
    const cells = [...root.querySelectorAll<HTMLElement>('.flap-digit')];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    cells.forEach((el, i) => {
      const target = code[i] ?? '·';
      if (reduce) { el.textContent = target; return; }
      let n = 6 + i * 2;
      const step = () => {
        if (gen !== flapGen) return;
        el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip');
        el.textContent = n-- > 0 ? String(Math.floor(Math.random() * 10)) : target;
        if (n >= 0) setTimeout(step, 55);
      };
      step();
    });
  }

  function renderTimer() {
    const left = otpExpiresAt - (Date.now() + serverSkew);
    const total = 10 * 60 * 1000;
    const expired = left <= 0;
    $('[data-flap]').classList.toggle('expired', expired);
    ($('[data-timer-bar]')).style.transform = `scaleX(${Math.max(0, Math.min(1, left / total))})`;
    const mm = Math.floor(Math.max(0, left) / 60000);
    const ss = Math.floor((Math.max(0, left) % 60000) / 1000).toString().padStart(2, '0');
    $('[data-timer-label]').textContent = !otp ? ' ' : expired ? 'Expired. Get a new code, or use the invite link.' : `Expires in ${mm}:${ss} · click the code to copy`;
    const newBtn = $<HTMLButtonElement>('[data-new-code]');
    newBtn.classList.toggle('btn-accent', expired);
    newBtn.classList.toggle('btn-ghost', !expired);
  }
  setInterval(renderTimer, 1000);
  setInterval(renderClips, 30_000);

  renderClips();
  renderMode();
  connect();
}
