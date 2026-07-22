# UrPilot Setup Checklist

## Local

- Run `npm install` from the workspace root.
- Copy `backend/.env.example` to `backend/.env.local`.
- Copy `extension/.env.example` to `extension/.env`.
- Set `TAVILY_API_KEY` and `GROQ_API_KEY` in `backend/.env.local`.
- Set `ALLOWED_EXTENSION_ORIGIN` after Chrome assigns the unpacked extension ID.
- Start the API with `npm run dev:backend`; it serves on `http://localhost:3001`.
- Build the extension with `npm --workspace extension run build`.
- Load `extension/dist` in `chrome://extensions` with Developer Mode enabled.

## Phase 1 Scope

- Extension secrets stay out of the bundle.
- Saved links and site templates live in `chrome.storage.sync`.
- Search and summarization call the backend only.
- Speech recognition runs in an offscreen document.
- TTS runs through `chrome.tts` from the background service worker.

## Phase 2 Placeholders

- `/api/settings` and `/api/history` currently return `501` until Supabase auth/storage is added.
- `/api/parse-intent` exists as the Groq fallback route, but the extension uses deterministic regex first.
- Supabase and Upstash env vars are documented but unused until product hardening.

## Verification

```bash
npm run typecheck
npm run test
npm run build
```
