# Tether

Share one clipboard, and send files, across 2–4 computers. Start a session, share the 6-digit code (or an invite link that skips the code), and whatever gets copied lands on everyone else's clipboard.

**Stack:** Astro 7 (SSR) · Cloudflare Workers (via `@astrojs/cloudflare`) · MongoDB Atlas · WebRTC data channels.

## How it works

| Piece | Where |
|---|---|
| Session, OTP (6 digits, 10 min), invite token, member seats (max 4) | MongoDB `sessions` (TTL: 12 h idle) |
| WebRTC offer/answer + relay fallback for clips | MongoDB `signals` (TTL: 2 min) |
| Rate limits (create / join / new code) | MongoDB `ratelimits` |
| Clips + live status between peers | WebRTC data channels, encrypted, browser to browser |
| Files (up to 500 MB) | Same data channels, 64 KB chunks with backpressure. Never touch the server, so they need a direct link |
| Name | `tether_name` cookie (400 days, the browser maximum) + `tether_tag` 4-char device tag → `Name#TAG` |

Each client polls `POST /api/session/:id/sync`. That one call is the heartbeat, carries outgoing signals and status, and returns the member list plus incoming signals. Polling runs fast (1.5 s) while a handshake is in progress and slows to 6–25 s once everyone has a direct link.

### What a website can't do (by design)

- **Background clipboard reads.** Browsers only let a focused page read the clipboard. Chromium: auto-sync runs when you switch to the tab, after a one-time "Allow". Firefox/Safari: press Ctrl+V on the page (or use the box / "Send my clipboard").
- **Background clipboard writes.** Incoming clips are queued and written when you next focus the tab. Every clip also stays in the list with a copy button.
- **Detecting the active app.** Status ("Working in Figma") is picked by the user.
- **Spotify** works via PKCE, but since Feb 2026 Spotify apps in development mode are limited to **5 allow-listed users**, and the app owner needs Premium. Wider use needs Spotify's extended quota.

## Local dev

```bash
npm install
cp .env.example .env   # PUBLIC_* build-time keys
# server secrets for local workerd: MONGODB_URI and TETHER_PEPPER in .dev.vars
# (without MONGODB_URI an in-memory store is used, dev only)
npm run dev            # http://127.0.0.1:4327
```

To test two people on one machine, open `http://127.0.0.1:4327` and `http://localhost:4327`. They're different origins, so they get separate cookies and storage.

## Deploy (Cloudflare Workers)

```bash
npx wrangler login
npx wrangler secret put MONGODB_URI
npx wrangler secret put TETHER_PEPPER
npm run build && npx wrangler deploy
```

`MONGODB_DB` is set in `wrangler.jsonc`. `PUBLIC_SPOTIFY_CLIENT_ID` and `PUBLIC_TURN_*` are baked in at build time from `.env`. For Spotify, add `https://<your-site>/spotify/callback` as a redirect URI in the Spotify dashboard.

Workers can't reuse a database connection across requests, so each API request opens a short-lived MongoDB client (see `withStore` in `src/lib/store.ts`).

### Free-tier budget

The Workers free plan allows 100k requests a day. A 2-person session with direct links polls about every 6 s (visible tab) → ~1,200 requests/hour. That's fine for personal use; for heavier use, move signaling to a WebSocket service (e.g. PartyKit / Cloudflare Durable Objects) and keep the rest.

About 10–20% of networks (strict NAT or corporate) can't form a direct WebRTC link. Clips then go through the server relay automatically; add a TURN server (`PUBLIC_TURN_*`) to avoid that.
