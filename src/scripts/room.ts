import type { MemberStatus, Music, PublicMember } from '../lib/types';
import { detectReadMode, readClipboard, writeClipboard, type ReadMode } from './clipboard';
import { ensureName, hueFor, initials } from './identity';
import { FileTransfers, formatBytes, type FileItem } from './files';
import type { Verdict } from './filecheck';
import { Mesh, type PeerState } from './mesh';
import { connectSpotify, disconnectSpotify, nowPlaying, spotifyAvailable, spotifyConnected } from './spotify';
import { renderSVG } from 'uqr';
import { T } from '../i18n/client';
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
  undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg>',
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
    setConn('off', T('Not joined'));
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
      const me = await ensureName({ reason: T("You've been invited. Pick the name others will see.") });
      const res = await api('/api/session/join', { body: { sessionId: sid, invite, name: me.name, tag: me.tag } });
      membership.set(sid, res.member);
      seat = res.member;
    } catch (err: any) {
      if (err.message === 'cancelled') return showJoin(T('Join this session?'), T('You need a name to join. Open the invite link again, or enter the code.'));
      return showJoin(T('Invite not valid'), err.message);
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
  const baseTitle = document.title;
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
      if (state === 'open') { mesh.send(peerId, { t: 'status', status: myStatus() }); files.peerOpen(peerId); }
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
      const who = nameOf(item.from)?.name ?? T('Someone');
      if (!prev) pulse(item.from, myId);
      if (item.status === 'done') {
        toast(T('{who} sent {file}', { who, file: item.name }), { icon: '↓' });
        notify(T('{who} sent a file', { who }), T('{file} · tap to open Tether and save it', { file: item.name }));
      }
      if (item.status === 'failed') toast(T('{file} from {who} was interrupted', { file: item.name, who }), { error: true });
      if (item.status === 'recalled') toast(item.saved
        ? T('{who} pulled back {file}. You had already saved it, so your copy stays on your device.', { who, file: item.name })
        : T('{who} pulled back {file}', { who, file: item.name }), { icon: '↩' });
      if (item.status === 'blocked') toast(T('Blocked {file} from {who}: programs and scripts are not allowed.', { file: item.name, who }), { error: true });
    }
    if (prev !== item.status && item.dir === 'out' && item.status === 'partial') {
      toast(T("{file} didn't reach {who}", { file: item.name, who: item.missed!.map((id) => nameOf(id)?.name ?? T('someone')).join(', ') }), { error: true });
    }
    scheduleClipsRender();
  }, (item, peerId, saved) => {
    if (saved) toast(T('{who} had already saved {file}, so their copy stays on their device.', { who: nameOf(peerId)?.name ?? T('Someone'), file: item.name }), { error: true });
  });

  /** Send to everyone online, or just `only`. Files need a direct link: they never go through the server. */
  function blockedText(name: string, v: Verdict): string {
    if (v.reason === 'content') return T("{file} is a program in disguise, so it can't be sent.", { file: name });
    if (v.reason === 'archive') return T("{file} contains a program ({inner}), so it can't be sent.", { file: name, inner: v.detail ?? '' });
    return T("Programs and scripts (.{ext}) can't be sent through Tether, to keep everyone safe.", { ext: v.detail ?? '' });
  }

  async function sendFiles(list: FileList | File[], only?: string) {
    const picked = [...list];
    if (!picked.length) return;
    const targets = members.filter((m) => m.id !== myId && m.online && (!only || m.id === only));
    if (!targets.length) { toast(only ? T("They're offline right now.") : T('Nobody else is online yet.'), { error: true }); return; }
    const direct = targets.filter((m) => mesh.channel(m.id));
    const indirect = targets.filter((m) => !mesh.channel(m.id));
    if (!direct.length) {
      toast(T("Files only travel over a direct link, and there isn't one yet. Try again in a moment."), { error: true });
      return;
    }
    const sent: string[] = [];
    for (const file of picked) {
      const r = await files.send(file, direct.map((m) => m.id));
      if ('tooBig' in r) toast(T('{file} is over 500 MB, too big to send.', { file: file.name }), { error: true });
      else if ('blocked' in r) toast(blockedText(file.name, r.blocked), { error: true });
      else {
        sent.push(file.name);
        for (const m of direct) pulse(myId, m.id);
      }
    }
    if (!sent.length) return;
    const names = direct.length === 1 ? direct[0].name : T('{n} people', { n: direct.length });
    toast(T('Sending {what} to {who}', { what: sent.length === 1 ? sent[0] : T('{n} files', { n: sent.length }), who: names }), { icon: '↗' });
    if (indirect.length) toast(T("{who} has no direct link, so they won't get it.", { who: indirect.map((m) => m.name).join(', ') }), { error: true });
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
    veil.querySelector('[data-drop-label]')!.textContent = target ? T('Drop to send to {name}', { name: target.name }) : T('Drop to send to everyone');
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
      if (e.code === 4002) { endSession(T('This session is open in another tab'), T('Close the other tab, or reload here to take over.'), false); return; }
      if (e.code === 4001) return; // we left
      failures++;
      setConn('warn', T('Reconnecting…'));
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
        try { localStorage.setItem('tether:last', JSON.stringify({ sid, at: Date.now() })); } catch { /* private mode */ }
        void loadShared();
      } else {
        for (const m of members) if (!prevIds.has(m.id) && m.id !== myId) {
          toast(T('{name} joined', { name: m.name }), { icon: '→' });
          bumpNode(m.id);
        }
        for (const id of prevIds) if (!members.some((m) => m.id === id)) toast(T('Someone left the session'));
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
        msg.reason === 'ended' ? T('This session has ended') : T("You're no longer in this session"),
        T('Enter a fresh code to join again, or start a new session.'),
        true,
      );
    }
  }

  /** First roster: tell a joiner whose session this is (the creator already knows). */
  function welcome() {
    const me = nameOf(myId);
    const host = members.find((m) => m.host);
    if (me && host && host.id !== myId && Date.now() - me.joinedAt < 60_000) {
      toast(T("You joined {host}'s session", { host: host.name }), { icon: '✓', ms: 3600 });
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
    if (new Blob([text]).size > MAX_CLIP) { toast(T('That clip is over 64 KB — too big to send.'), { error: true }); return; }
    if (!syncing && source === 'auto') return;
    const key = text.trim();
    if (clips.some((c) => c.text.trim() === key)) {
      if (source !== 'auto') toast(T('Already in the list. Use its copy button instead.'));
      return;
    }
    const peers = members.filter((m) => m.id !== myId && m.online);
    const me = nameOf(myId);
    const clip: Clip = {
      id: crypto.randomUUID(), text, from: myId, fromName: me?.name ?? T('You'), fromTag: me?.tag ?? '',
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
    if (!peers.length) toast(T('Saved here. Nobody else is online yet.'));
    else if (source !== 'auto') toast(T('Sent to {who}', { who: peers.length === 1 ? peers[0].name : T('{n} devices', { n: peers.length }) }), { icon: '↗' });
  }

  async function receive(from: string, msg: any, via: 'p2p' | 'relay') {
    if (!msg || typeof msg.text !== 'string' || typeof msg.id !== 'string' || seen.has(msg.id)) return;
    seen.add(msg.id);
    const m = nameOf(from);
    const clip: Clip = {
      id: msg.id, text: msg.text.slice(0, MAX_CLIP), from, fromName: m?.name ?? T('Someone'), fromTag: m?.tag ?? '',
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
        document.title = T('● {who} sent a clip — Tether', { who: clip.fromName });
      }
    }
    notify(`${clip.fromName} sent a clip`, clip.text.slice(0, 120));
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
      document.title = baseTitle;
      // Chrome wants the document fully focused before writes; give it a frame.
      await new Promise((r) => setTimeout(r, 60));
      if (await writeClipboard(clip.text)) {
        clip.landed = true;
        lastClip = clip.text;
        toast(T('Clip from {who} is on your clipboard', { who: clip.fromName }), { icon: '✓' });
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
    if (text == null) toast(T('Clipboard access was blocked. Press Ctrl+V on the page instead.'), { error: true });
    else if (!text.trim()) toast(T("Your clipboard is empty (or holds an image, which isn't supported yet)."));
    else share(text, 'clipboard');
  });

  const syncToggle = $<HTMLInputElement>('[data-sync-toggle]');
  syncToggle.addEventListener('change', () => {
    syncing = syncToggle.checked;
    $('[data-sync-label]').textContent = syncing ? T('Syncing') : T('Paused');
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

  const qrToggle = $<HTMLButtonElement>('[data-qr-toggle]');
  qrToggle.addEventListener('click', () => {
    const pop = $('[data-qr-pop]');
    pop.hidden = !pop.hidden;
    qrToggle.setAttribute('aria-expanded', String(!pop.hidden));
    renderQr();
  });

  /* ------------------------------------------- shared from another app */
  // The service worker parks "Share → Tether" payloads in Cache Storage; we offer them here and
  // only send when the user says so (a share sheet tap shouldn't broadcast on its own).
  interface SharedIndex { text: string; files: { key: string; name: string; type: string; size: number }[] }
  let shared: SharedIndex | null = null;
  const tray = $('[data-share-tray]');

  async function sharedCache() {
    try { return await caches.open('tether-share'); } catch { return null; }
  }
  async function loadShared() {
    const cache = await sharedCache();
    const res = await cache?.match('/share-index');
    if (!res) return;
    shared = await res.json();
    const parts: string[] = [];
    if (shared!.files.length) parts.push(shared!.files.length === 1 ? `${shared!.files[0].name} (${formatBytes(shared!.files[0].size)})` : T('{n} files', { n: shared!.files.length }));
    if (shared!.text) parts.push(shared!.text.length > 80 ? shared!.text.slice(0, 80) + '…' : shared!.text);
    $('[data-share-what]').textContent = parts.join(' · ');
    tray.hidden = false;
  }
  async function clearShared() {
    shared = null;
    tray.hidden = true;
    const cache = await sharedCache();
    if (cache) await Promise.all((await cache.keys()).map((k) => cache.delete(k)));
  }
  $('[data-share-discard]').addEventListener('click', () => void clearShared());
  $('[data-share-send]').addEventListener('click', async () => {
    if (!shared) return;
    if (!members.some((m) => m.id !== myId && m.online)) { toast(T("Nobody else is here yet. It'll wait until someone joins.")); return; }
    const cache = await sharedCache();
    const list: File[] = [];
    for (const f of shared.files) {
      const r = await cache?.match(f.key);
      if (r) list.push(new File([await r.blob()], f.name, { type: f.type }));
    }
    if (shared.text) share(shared.text, 'typed');
    if (list.length) sendFiles(list);
    await clearShared();
  });

  /* --------------------------------------------------------- housekeeping */
  let leaving = false;
  const unsavedFiles = () => files.items.some((f) => f.dir === 'in' && f.status === 'done' && !f.saved);
  // Received files only live in this tab: warn before a reload or close throws them away.
  window.addEventListener('beforeunload', (e) => {
    if (leaving || !unsavedFiles()) return;
    e.preventDefault();
    e.returnValue = '';
  });

  $('[data-clear-clips]').addEventListener('click', () => {
    clips = [];
    pending = null;
    files.items = files.items.filter((f) => f.status === 'active');
    persistClips();
    renderClips();
  });

  // Optional system notifications for things that arrive while you're in another app.
  const notifyBtn = $<HTMLButtonElement>('[data-notify]');
  const canNotify = 'Notification' in window;
  let notifyOn = canNotify && Notification.permission === 'granted' && localStorage.getItem('tether:notify') === '1';
  const paintNotify = () => {
    notifyBtn.setAttribute('aria-pressed', String(notifyOn));
    notifyBtn.title = notifyOn ? T('Notifications on: tap to turn off') : T("Notify me when something arrives while I'm in another app");
  };
  notifyBtn.hidden = !canNotify;
  paintNotify();
  notifyBtn.addEventListener('click', async () => {
    if (notifyOn) notifyOn = false;
    else {
      const p = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
      notifyOn = p === 'granted';
      if (p === 'denied') toast(T('Notifications are blocked for this site. Allow them from the lock icon in the address bar.'), { error: true });
    }
    try { localStorage.setItem('tether:notify', notifyOn ? '1' : '0'); } catch { /* private mode */ }
    paintNotify();
    if (notifyOn) toast(T("You'll get a notification when something arrives"), { icon: '🔔' });
  });

  function notify(title: string, body: string) {
    if (!notifyOn || (document.visibilityState === 'visible' && document.hasFocus())) return;
    const opts = { body, tag: `tether-${sid}`, icon: '/icon-192.png' };
    // Android only shows notifications through a service worker; desktop works either way.
    navigator.serviceWorker?.getRegistration().then((reg) => {
      if (reg) return reg.showNotification(title, opts);
      new Notification(title, opts);
    }).catch(() => { try { new Notification(title, opts); } catch { /* unsupported */ } });
  }

  async function copyInvite() {
    if (!inviteToken) return;
    if (await writeClipboard(inviteUrl())) {
      lastClip = inviteUrl(); // don't sync our own invite link out
      toast(T('Invite link copied'), { icon: '✓' });
    }
  }
  $('[data-copy-invite]').addEventListener('click', copyInvite);
  const shareBtn = $<HTMLButtonElement>('[data-share]');
  if (navigator.share) {
    shareBtn.hidden = false;
    shareBtn.addEventListener('click', () => navigator.share({ title: T('Join my Tether session'), text: T('Code: {otp}', { otp }), url: inviteUrl() }).catch(() => {}));
  }
  $('[data-flap]').addEventListener('click', async () => {
    if (otp && Date.now() + serverSkew < otpExpiresAt && (await writeClipboard(otp))) {
      lastClip = otp;
      toast(T('Code copied'), { icon: '✓' });
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

  // Leave is two-step: one tap arms it for 3 s, a second tap leaves. No accidental exits.
  let leaveArmed: ReturnType<typeof setTimeout> | undefined;
  const leaveBtn = $<HTMLButtonElement>('[data-leave]');
  const leaveLabel = $('[data-leave-label]');
  function disarmLeave() {
    clearTimeout(leaveArmed);
    leaveArmed = undefined;
    leaveBtn.classList.remove('confirm');
    leaveLabel.textContent = T('Leave');
  }
  leaveBtn.addEventListener('click', async () => {
    if (!leaveArmed) {
      leaveBtn.classList.add('confirm');
      leaveLabel.textContent = unsavedFiles() ? T('Unsaved files will be lost. Tap again') : T('Tap again to leave');
      leaveArmed = setTimeout(disarmLeave, 3000);
      return;
    }
    disarmLeave();
    leaving = true;
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
    renderAlone();
    renderConn();
    renderConstellation();
    renderMembers();
    renderTimer();
  }

  /** While nobody else is here, swap the empty diagram for a big QR, and (on phones) lift the invite to the top. */
  function renderAlone() {
    const alone = !members.some((m) => m.id !== myId);
    root.querySelector('.room-grid')!.classList.toggle('is-alone', alone);
    $('[data-alone]').hidden = !alone;
    $('[data-constellation]').hidden = alone;
    renderQr();
  }

  let qrFor = '';
  function renderQr() {
    if (!inviteToken) return;
    const url = inviteUrl();
    if (url === qrFor) return;
    qrFor = url;
    const svg = renderSVG(url, { border: 1, whiteColor: '#fff', blackColor: '#0a0b0c' });
    root.querySelectorAll('[data-qr], [data-qr-big]').forEach((el) => (el.innerHTML = svg));
  }

  function renderConn() {
    const peers = members.filter((m) => m.id !== myId && m.online);
    if (!peers.length) return setConn('warn', T('Waiting for others'));
    const open = peers.filter((p) => peerState.get(p.id) === 'open').length;
    if (open === peers.length) setConn('ok', T('Direct link · {n} devices', { n: peers.length + 1 }));
    else if (open) setConn('warn', T('{open}/{total} direct, rest relayed', { open, total: peers.length }));
    else setConn('warn', T('Linking…'));
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
      const sub = m.status.music?.playing ? `♪ ${m.status.music.title}` : m.status.app ? m.status.app : m.id === myId ? T('You') : m.online ? (m.status.focused ? T('Here now') : T('Away')) : T('Offline');
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
      const seatBtn = h('button', { class: 'node empty', type: 'button', title: T('Copy invite link'), style: { left: `${x}%`, top: `${y}%` }, onclick: copyInvite },
        h('span', { class: 'avatar' }, '+'),
        h('span', { class: 'sub' }, T('Invite someone')),
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
    const presence = !m.online ? T('Offline') : m.status.focused ? T('Here now') : T('Away');
    const lines = h('div', { class: 'lines' });

    if (isMe) {
      lines.append(h('button', { class: 'editable', type: 'button', onclick: openPicker },
        iconEl(ICON.app), h('span', {}, myApp ? T('Working in {app}', { app: myApp }) : T("Set what you're working in"))));
      if (spotifyAvailable()) {
        if (!spotifyConnected()) {
          lines.append(h('button', { class: 'editable', type: 'button', onclick: () => connectSpotify() }, iconEl(ICON.spotify), h('span', {}, T('Connect Spotify'))));
        } else if (!m.status.music) {
          lines.append(h('button', { class: 'editable', type: 'button', title: T('Disconnect Spotify'), onclick: () => { disconnectSpotify(); myMusic = null; statusDirty = true; broadcastStatus(); } },
            iconEl(ICON.spotify), h('span', {}, T('Nothing playing'))));
        }
      }
    } else if (m.status.app) {
      lines.append(h('span', { class: 'line-item' }, iconEl(ICON.app), h('span', {}, m.status.app)));
    }
    if (m.status.music) lines.append(musicEl(m.status.music));
    if (!isMe && !m.status.app && !m.status.music) lines.append(h('span', { class: 'line-item' }, h('span', {}, presence)));

    const s = peerState.get(m.id);
    const conn = isMe ? null
      : !m.online ? h('span', { class: 'pill' }, h('span', { class: 'dot' }), T('Offline'))
      : s === 'open' ? h('span', { class: 'pill', title: T('Clips go directly between your browsers, end-to-end encrypted') }, h('span', { class: 'dot on' }), T('Direct'))
      : s === 'failed' ? h('span', { class: 'pill', title: T('A direct link could not be made, so clips go through the server (deleted after 2 min)') }, h('span', { class: 'dot away' }), T('Relayed'))
      : h('span', { class: 'pill' }, h('span', { class: 'dot away' }), T('Linking…'));

    return h('article', { class: 'member' + (enter ? ' enter' : ''), 'data-id': m.id },
      h('span', { class: 'avatar', '--hue': hueFor(m.tag) }, initials(m.name)),
      h('div', { class: 'top' },
        h('span', { class: 'who' }, m.name, h('span', { class: 'tag' }, `#${m.tag}`)),
        isMe && h('span', { class: 'badge you' }, T('You')),
        isMe || !m.online ? null : h('span', { class: 'dot' + (m.status.focused ? ' on' : ' away'), title: presence }),
      ),
      h('div', { class: 'conn' }, conn,
        !isMe && m.online && s === 'open' && sendFileBtn(m)),
      lines,
    );
  }

  function sendFileBtn(m: PublicMember) {
    const b = h('button', {
      class: 'btn btn-sm btn-ghost send-to', type: 'button',
      title: T('Send a file to {name}', { name: m.name }),
      onclick: () => pickFiles(m.id),
    });
    b.innerHTML = ICON.clip;
    b.append(T('Send file'));
    return b;
  }

  function musicEl(music: Music) {
    const label = `${music.title}${music.artist ? ' · ' + music.artist : ''}`;
    const text = music.url ? h('a', { href: music.url, target: '_blank', rel: 'noopener' }, label) : h('span', {}, label);
    return h('span', { class: 'line-item', title: music.playing ? T('Playing on Spotify') : T('Paused on Spotify') },
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
      host.append(iconEl(ICON.hand), h('span', {}, h('b', {}, T("Paused.")), ' ', T("Nothing is sent or written to your clipboard.")));
      return;
    }
    if (readMode === 'auto') {
      host.append(iconEl(ICON.bolt), h('span', {}, h('b', {}, T("Auto-sync on.")), ' ', T("Copy anywhere, then come back to this tab and it sends.")));
    } else if (readMode === 'prompt') {
      host.append(iconEl(ICON.bolt), h('span', {}, h('b', {}, T("Turn on auto-sync.")), ' ', T("Let this tab read your clipboard when you switch to it.")),
        h('button', { class: 'btn btn-sm btn-accent', type: 'button', onclick: async () => {
          const text = await readClipboard();
          if (text != null) { lastClip = text; readMode = 'auto'; renderMode(); toast(T('Auto-sync on'), { icon: '⚡' }); }
        } }, T('Allow')));
    } else if (readMode === 'denied') {
      host.append(iconEl(ICON.hand), h('span', {}, h('b', {}, T('Clipboard access blocked.')), ' ', touch ? T('Paste into the box below to send.') : T('Press Ctrl+V on this page to send, or allow access from the lock icon in the address bar.')));
    } else {
      host.append(iconEl(ICON.hand), touch
        ? h('span', {}, h('b', {}, T("Paste into the box below to send.")), ' ', T("Or tap Send my clipboard."))
        : h('span', {}, h('b', {}, T("Press Ctrl+V on this page to send.")), ' ', T("This browser only lets a page read the clipboard after a keypress.")));
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
    $('[data-clear-clips]').hidden = !clips.length && !files.items.some((f) => f.status !== 'active');
    if (!clips.length && !files.items.length) {
      clipEls.clear();
      const empty = h('li', { class: 'clip-empty' });
      empty.innerHTML = touch
        ? T('Nothing shared yet. Paste text into the box above, or send a file.')
        : T('Nothing shared yet. Copy something and press <kbd>Ctrl</kbd><kbd>V</kbd> here, or drop a file anywhere.');
      host.replaceChildren(empty);
      return;
    }
    const now = Date.now();
    const entries: (Clip | FileItem)[] = [...clips, ...files.items].sort((a, b) => b.at - a.at);
    const els = entries.map((c) => {
      const isFile = 'kind' in c;
      const key = isFile
        ? JSON.stringify([c.status, c.missed, c.keptBy, !!c.url, timeAgo(c.at, now)])
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
    const copyBtn = h('button', { class: 'btn btn-sm btn-ghost icon-btn copy', type: 'button', 'aria-label': T('Copy') });
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
      ? c.landed ? h('span', { class: 'landed' }, T('✓ on clipboard')) : pending?.id === c.id ? h('span', { class: 'waiting' }, T('waiting for focus')) : null
      : null;
    return h('li', { class: `clip ${c.dir}${enter ? ' enter' : ''}` },
      h('div', { class: 'clip-meta' },
        h('span', {}, c.dir === 'in' ? '↘' : '↗'),
        h('span', { class: 'who' }, c.dir === 'out' ? T('You') : c.fromName),
        h('span', {}, timeAgo(c.at, now)),
        c.via !== 'p2p' && h('span', { class: 'via', title: T('Went through the server because a direct link was not available') }, T('relay')),
        state,
      ),
      h('div', { class: 'clip-text' }, c.text),
      copyBtn,
    );
  }

  function fileEl(f: FileItem, enter: boolean, now: number) {
    const peerNames = (ids: string[]) => ids.map((id) => nameOf(id)?.name ?? T('someone')).join(', ');
    const who = f.dir === 'out'
      ? T('You → {who}', { who: f.peers.length === 1 ? peerNames(f.peers) : T('{n} people', { n: f.peers.length }) })
      : nameOf(f.from)?.name ?? T('Someone');
    const state =
      f.status === 'active' ? h('span', { class: 'waiting' }, f.dir === 'in' ? T('receiving') + ' ' : T('sending') + ' ', h('span', { 'data-pct': true }, '0%'))
      : f.status === 'done' ? h('span', { class: 'landed' }, f.dir === 'in' ? T('✓ received') : T('✓ delivered'))
      : f.status === 'partial' ? h('span', { class: 'waiting' }, T('missed {who}', { who: peerNames(f.missed ?? []) }))
      : f.status === 'recalled' ? h('span', { class: 'failed' }, f.dir === 'in' ? T('pulled back by sender') : f.keptBy?.length ? T('pulled back · {who} had saved it', { who: peerNames(f.keptBy) }) : T('pulled back'))
      : f.status === 'blocked' ? h('span', { class: 'failed', title: T('Programs and scripts are blocked to keep everyone safe') }, T('blocked'))
      : h('span', { class: 'failed' }, f.dir === 'in' ? T('interrupted') : T('not delivered'));
    const ext = (f.name.includes('.') ? f.name.split('.').pop()! : 'file').slice(0, 4).toUpperCase();
    let action: HTMLElement | null = null;
    if (f.dir === 'in' && f.status === 'done' && f.url) {
      action = h('a', { class: 'btn btn-sm btn-accent', href: f.url, download: f.name, title: T('Save {file}', { file: f.name }) });
      action.innerHTML = ICON.download;
      action.append(T('Save'));
      action.addEventListener('click', () => files.markSaved(f));
    } else if (f.dir === 'out' && (f.status === 'active' || f.status === 'done' || f.status === 'partial')) {
      action = h('button', { class: 'btn btn-sm btn-ghost', type: 'button', title: T('Remove {file} from the other devices. Copies already saved stay where they are.', { file: f.name }) });
      action.innerHTML = ICON.undo;
      action.append(T('Pull back'));
      action.addEventListener('click', () => files.recall(f.id));
    }
    return h('li', { class: `clip file ${f.dir}${enter ? ' enter' : ''}` },
      h('div', { class: 'clip-meta' },
        h('span', {}, f.dir === 'in' ? '↘' : '↗'),
        h('span', { class: 'who' }, who),
        h('span', {}, timeAgo(f.at, now)),
        h('span', { class: 'via', title: T('Sent straight between browsers. The file never touched a server.') }, 'p2p'),
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
    $('[data-timer-label]').textContent = !otp ? ' ' : expired ? T('Expired. Get a new code, or use the invite link.') : T('Expires in {time} · click the code to copy', { time: `${mm}:${ss}` });
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
