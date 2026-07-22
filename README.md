# UrPilot

UrPilot is a voice-controlled Chrome browsing assistant with two deployable parts:

- `extension/`: Manifest V3 Chrome extension built with React, TypeScript, Vite, and CRXJS.
- `backend/`: Next.js API service that keeps Tavily and Groq API keys server-side.

## Setup

```bash
npm install
```

Create local env files:

```bash
copy backend\.env.example backend\.env.local
copy extension\.env.example extension\.env
```

Fill `TAVILY_API_KEY`, `GROQ_API_KEY`, and `ALLOWED_EXTENSION_ORIGIN` in `backend/.env.local`.

## Development

```bash
npm run dev:backend
npm run dev:extension
```

For a demo extension install, build it and load `extension/dist` from `chrome://extensions`.

```bash
npm --workspace extension run build
```

## Verification

```bash
npm run typecheck
npm run test
npm run build
```
