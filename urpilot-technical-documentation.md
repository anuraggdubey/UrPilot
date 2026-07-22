# UrPilot — Voice-Controlled Browsing Assistant
### Full Technical Documentation & Build Plan
*(codename "UrPilot" — rename freely, used throughout this doc for clarity)*

Last verified: July 22, 2026

---

## 0. Read This First — Corrections & Key Architectural Decisions

Before the full spec, three things need to be said plainly so nothing downstream is built on a wrong assumption:

**1. Next.js cannot run *inside* the extension.**
Next.js is a server-rendered web framework — it needs a server runtime (Node/Edge on Vercel or similar). A Chrome extension has no server; it runs in fixed browser contexts (background service worker, content scripts, popup/side panel, offscreen document). So the split is:
- **Extension client** = React + TypeScript, built with a bundler made for extensions (Vite + `@crxjs/vite-plugin`, or the Plasmo framework). This is the voice UI, tab automation, content scripts.
- **Next.js + TypeScript** = your **backend API**, deployed separately (Vercel). It holds your LLM/search API keys server-side and exposes REST endpoints the extension calls over `fetch`.

This is the correct and only way to satisfy "tech stack: Next.js + TypeScript" for this kind of project — Next.js is the backend, not the extension shell.

**2. Two search APIs I mentioned last time are no longer viable, and I want to correct that now rather than let you build on stale info:**
- **Bing Search API** — fully retired by Microsoft on August 11, 2025. Does not exist anymore, no new keys issued.
- **Google Custom Search JSON API** — closed to new customers since 2025. If you don't already have an existing account, you cannot sign up for it. (Existing accounts are grandfathered until Jan 1, 2027.)
- **Brave Search API** — killed its genuine free tier in February 2026. New signups now require a card and get $5/month in credit (~1,000 queries), then metered billing.

**Recommended replacement: Tavily.** It's purpose-built for exactly this use case (LLM agents doing web search), has a real free tier — **1,000 API credits/month, no credit card required** — and returns clean structured results instead of raw SERP HTML. This is used throughout the rest of this doc.

**3. "Free for demo" is achievable, but not with zero decisions.** The plan below is split into **Phase 1 (Demo, $0)** and **Phase 2 (Product, ~$0–30/mo)** so you know exactly where the free line sits.

**4. LLM provider: Groq, not Anthropic.** Updated throughout this doc — summarization and (Phase 2) intent parsing now run on **Groq (GroqCloud)** instead of Claude. Groq only serves open-weight models (Llama, GPT-OSS, Gemma, Qwen — no Claude/GPT/Gemini), but it's a genuinely free tier (no card) with an OpenAI-compatible API, and its LPU hardware is materially faster than typical hosted inference — which matters here specifically, since a voice assistant's felt responsiveness depends on how long the user waits between finishing a sentence and hearing a spoken answer.

---

## 1. Project Overview

A voice-controlled Chrome extension (Manifest V3) that lets you browse hands-free:

| # | Feature | One-line description |
|---|---|---|
| 1 | Continuous voice listening | Always-on (or push-to-talk) speech recognition that parses spoken commands |
| 2 | "Open My Stuff" | Voice-triggered launch of a saved list of URLs into new tabs |
| 3 | Voice search & auto-navigate | Speak a query, get routed to a search engine or the best web result, and land there automatically |
| 4 | Page summarization | Extract the active page's content and get an LLM-generated summary/step-by-step guide |
| 5 | Voice answers (TTS) | The summary (or any assistant response) is read back aloud |

The flagship end-to-end flow is features 3 → 4 → 5 chained: *"search how to deploy a smart contract on Stellar, take me there, summarize it, and read it to me"* — one spoken sentence, zero clicks.

---

## 2. High-Level Architecture

```
┌─────────────────────────── CHROME EXTENSION (Manifest V3) ───────────────────────────┐
│                                                                                        │
│  ┌────────────────┐        ┌──────────────────────┐        ┌─────────────────────┐   │
│  │  Side Panel UI  │◄──────►│  Background Service   │◄──────►│  Offscreen Document │   │
│  │  (React + TS)   │  msgs  │  Worker (background.ts)│  msgs  │  (speech recognition│   │
│  │  - mic button   │        │  - command router     │        │   only; has a DOM)  │   │
│  │  - transcript   │        │  - tab automation      │        └─────────────────────┘   │
│  │  - summary view │        │  - message hub         │                                  │
│  └────────────────┘        └───────────┬────────────┘                                  │
│                                          │ chrome.scripting / chrome.tabs               │
│                                          ▼                                              │
│                              ┌─────────────────────┐                                    │
│                              │   Content Script     │                                    │
│                              │  (injected per tab)   │                                    │
│                              │  - Readability.js     │                                    │
│                              │  - DOM text extraction│                                    │
│                              └───────────┬───────────┘                                    │
└──────────────────────────────────────────┼────────────────────────────────────────────┘
                                            │ fetch() over HTTPS
                                            ▼
                         ┌──────────────────────────────────────┐
                         │      NEXT.JS BACKEND (Vercel)          │
                         │  /api/search      → Tavily             │
                         │  /api/summarize   → Groq (LPU inference)│
                         │  /api/settings*   → Supabase (Phase 2)  │
                         │  /api/history*    → Supabase (Phase 2)  │
                         └───────────────────┬──────────────────┘
                                             │
                     ┌───────────────────────┼───────────────────────┐
                     ▼                       ▼                       ▼
              Tavily Search API         Groq API           Supabase Postgres (Phase 2)
```

Why this shape:
- Speech recognition needs a live DOM → must run in the **offscreen document**, not the service worker (which has no DOM and can be killed/restarted at any time) and not the popup (which dies on blur).
- All secret API keys (Tavily, Groq) live **only** in Vercel environment variables, never inside the extension bundle — anything shipped to the extension is fully readable by anyone who unzips it or opens `chrome://extensions` → Inspect views.
- `chrome.tts` (native TTS) is callable directly from the service worker — no offscreen document needed for output, only for speech **input**.

---

## 3. Tech Stack

### Extension (client)
| Layer | Choice | Notes |
|---|---|---|
| Language | TypeScript | strict mode on |
| UI framework | React 18 | side panel + options page |
| Bundler | Vite + `@crxjs/vite-plugin` | purpose-built for MV3 HMR; alternative: Plasmo |
| Styling | Tailwind CSS | fast to iterate solo |
| State | React Context + `chrome.storage.onChanged` listener | no Redux needed at this scope |
| Speech input | Web Speech API (`webkitSpeechRecognition`) inside offscreen doc | free, built into Chrome |
| Speech output | `chrome.tts` | free, native, callable from service worker |
| Content extraction | `@mozilla/readability` + `linkedom`/native DOM | MIT licensed, battle-tested |

### Backend
| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Route Handlers under `app/api/**/route.ts` |
| Hosting | Vercel (Hobby tier) | $0 for a personal/demo project |
| Search | Tavily API | 1,000 free credits/month, no card |
| Summarization + intent-parsing LLM | Groq (GroqCloud) — `llama-3.3-70b-versatile` primary, `openai/gpt-oss-120b` alternative | Free tier, no card, OpenAI-compatible SDK (just swap the base URL + key). See §10 for exact rate limits |
| DB (Phase 2) | Supabase (Postgres + Auth) | free tier: 500MB DB, 50k MAU, 1GB storage |
| Rate limiting (Phase 2) | Upstash Redis + `@upstash/ratelimit` | free tier: 500k commands/mo |

---

## 4. Repository Structure

```
urpilot/
├── extension/
│   ├── manifest.json
│   ├── src/
│   │   ├── background/
│   │   │   ├── background.ts          # service worker entry
│   │   │   ├── commandRouter.ts        # intent parsing (regex → Phase 2: LLM)
│   │   │   └── messageHub.ts
│   │   ├── offscreen/
│   │   │   ├── offscreen.html
│   │   │   └── offscreen.ts            # SpeechRecognition lives here
│   │   ├── content/
│   │   │   └── extractContent.ts       # Readability-based extraction
│   │   ├── sidepanel/
│   │   │   ├── SidePanel.tsx
│   │   │   └── components/
│   │   ├── options/
│   │   │   └── OptionsPage.tsx         # saved links + site-search templates
│   │   └── lib/
│   │       ├── types.ts                # shared message contracts
│   │       └── siteTemplates.ts
│   └── vite.config.ts
├── backend/
│   ├── app/api/
│   │   ├── search/route.ts
│   │   ├── summarize/route.ts
│   │   ├── parse-intent/route.ts       # Phase 2
│   │   ├── settings/route.ts           # Phase 2
│   │   └── history/route.ts            # Phase 2
│   ├── lib/
│   │   ├── tavily.ts
│   │   ├── llm.ts
│   │   ├── supabase.ts                 # Phase 2
│   │   └── ratelimit.ts                # Phase 2
│   └── next.config.ts
└── docs/
    └── (this file)
```

---

## 5. Feature Specifications

### 5.1 Feature — Continuous Voice Listening

**Goal:** capture speech hands-free and turn it into text the command router can act on.

**Where it runs:** `chrome.offscreen` document (`reasons: ['USER_MEDIA']`). This is the only context in MV3 that has both a persistent lifetime independent of the active tab/popup *and* DOM access for `webkitSpeechRecognition`.

**Flow:**
1. User toggles listening via a `chrome.commands` keyboard shortcut (e.g. `Ctrl+Shift+L`) or a mic button in the side panel.
2. Side panel/background sends `{type: 'START_LISTENING'}` to the service worker.
3. Service worker calls `chrome.offscreen.createDocument()` if one doesn't already exist, then forwards `START_RECOGNITION` to it.
4. Offscreen doc starts `SpeechRecognition` with `continuous: true`, `interimResults: true`.
5. On `onresult`, it posts `TRANSCRIPT_INTERIM` (for live UI feedback) and, on a final result, `TRANSCRIPT_FINAL` back to the service worker.
6. **Known Chrome quirk to design around:** `SpeechRecognition` frequently fires `onend` after ~60 seconds of silence even with `continuous: true`. The offscreen script must auto-restart recognition on `onend` unless the user explicitly stopped it — otherwise "continuous" listening silently dies mid-session.
7. Service worker passes the final transcript to the **Command Router** (§5.6).

**Mic permission:** must be granted from a page context (not the service worker). Requesting it once from the offscreen document (or a one-time options-page prompt) is the standard pattern; Chrome persists the grant per-origin (`chrome-extension://<id>`).

**Push-to-talk vs. wake-word:** true always-on wake-word detection ("hey UrPilot") needs either a lightweight on-device wake-word model or constantly restarting `SpeechRecognition`, both add cost/complexity/battery drain. **Recommendation: ship push-to-talk (keyboard shortcut) for MVP**, layer wake-word in later only if you still want it after using the toggle version.

---

### 5.2 Feature — "Open My Stuff" (Tab Automation)

**Goal:** say a keyword, open all saved URLs as new tabs simultaneously.

**Storage:** `chrome.storage.sync` (free, syncs across the user's signed-in Chrome instances automatically, no backend needed even in Phase 2 for this specific feature — though Phase 2 can *additionally* mirror it to Supabase for cross-browser / non-Chrome-account access).

**Settings schema (stored under key `savedLinks`):**
```ts
type SavedLink = {
  id: string;        // uuid
  label: string;      // "GitHub"
  url: string;
  order: number;
};
```

**Trigger phrases → action:**
| Phrase examples | Action |
|---|---|
| "open my stuff" / "open my requirements" / "open my links" | Read `savedLinks` from storage, loop `chrome.tabs.create({url, active: false})` for each — `active: false` on all but the first keeps focus sane instead of stealing it N times |

**Options page:** a simple CRUD list (add/remove/reorder saved links) in the extension's options page or side panel — plain React + `chrome.storage.sync.set`.

---

### 5.3 Feature — Voice Search & Direct Navigation

This has **two distinct sub-patterns** the user's phrasing implies — worth separating because one needs an API and one doesn't:

**A. Site-specific search** (e.g. *"open YouTube and search Stellar smart contracts"*, *"search this on GitHub"*)
→ No API call needed at all. Just URL-template the query into the target site's own search URL.

**Site Search Template table (stored in `chrome.storage.sync` under key `siteTemplates`, user-editable, ship sensible defaults):**
| Site | URL template |
|---|---|
| YouTube | `https://www.youtube.com/results?search_query={q}` |
| GitHub | `https://github.com/search?q={q}` |
| Google | `https://www.google.com/search?q={q}` |
| Stack Overflow | `https://stackoverflow.com/search?q={q}` |
| X / Twitter | `https://x.com/search?q={q}` |
| npm | `https://www.npmjs.com/search?q={q}` |

Command router detects "on \{site\}" / "open \{site\} and search" and does `chrome.tabs.create({url: template.replace('{q}', encodeURIComponent(query))})`. Zero cost, zero external dependency.

**B. Open-ended web search** (e.g. *"search how to deploy a smart contract on the Stellar ecosystem"* with no named site)
→ This is where you need a real search API, because you're asking for **the best result on the open web**, not a specific site's own search. This calls the backend:

```
POST /api/search
Body:    { "query": "how to deploy a smart contract on Stellar" }
Response:{
  "top": { "title": "...", "url": "...", "snippet": "..." },
  "alternates": [ /* up to 4 more, for a "did you mean" fallback in the UI */ ]
}
```

Backend calls Tavily server-side (key never touches the extension), returns the top result URL, extension does `chrome.tabs.update(tabId, {url: top.url})` (or `.create` if opening a new tab was requested).

**Chained command:** *"search X and summarize it"* → run (B), wait for `chrome.tabs.onUpdated` to fire `status: 'complete'` on the target tab, then automatically trigger Feature 5.4 against that tab. This chaining is the single most valuable flow in the whole product — document it, test it explicitly, don't leave it as an emergent side effect.

---

### 5.4 Feature — Page Content Summarization

**Goal:** once on a target page, extract the readable content and get a concise summary or step-by-step guide.

**Flow:**
1. Background sends `{type: 'EXTRACT_CONTENT'}` to the content script in the active tab (injected via `chrome.scripting.executeScript` on `activeTab`, not a persistent `content_scripts` entry — keeps the permissions footprint smaller for Chrome Web Store review later).
2. Content script clones the DOM, runs it through **Readability.js** (`@mozilla/readability`), extracts `{title, textContent, excerpt}`.
   - **Fallback path:** Readability is built for article-style pages; it can return thin/empty output on SPA dashboards, docs sites with heavy client-side rendering, or PDF viewer pages (`chrome-extension://.../pdf/index.html`). Detect a too-short result (< ~200 words) and fall back to `document.body.innerText` with basic boilerplate stripping (nav/footer/script tags removed) rather than failing silently.
3. Content script posts `{type: 'PAGE_CONTENT', payload: {title, text, url}}` back to the background.
4. Background POSTs to the backend:
```
POST /api/summarize
Body: {
  "url": "https://...",
  "title": "...",
  "text": "<extracted text, truncated server-side to fit model context>",
  "mode": "summary" | "steps"          // "steps" for how-to/doc pages
}
Response: {
  "summary": "...",                    // for the side panel (can be longer)
  "spokenSummary": "...",              // shorter, TTS-friendly version (~30-60s of speech)
  "keyPoints": ["...", "...", "..."]
}
```
5. Side panel renders `summary` + `keyPoints`; background calls `chrome.tts.speak(spokenSummary, {...})` for Feature 5.5.

**Why two separate summary fields:** a good *reading* summary and a good *listening* summary are not the same text — TTS needs shorter sentences, no markdown/bullets, no inline citations. Ask the LLM for both in one call rather than trying to reuse one for both surfaces.

---

### 5.5 Feature — Voice Answers (Text-to-Speech)

**Implementation:** `chrome.tts.speak(text, options)` — free, native, available directly from the service worker (no offscreen doc required for output).

```ts
chrome.tts.speak(spokenSummary, {
  rate: 1.0,
  onEvent: (event) => {
    if (event.type === 'end') { /* notify side panel playback finished */ }
  }
});
```

**"Stop" command:** map "stop" / "stop talking" / "cancel" to `chrome.tts.stop()` **and** abort any in-flight `fetch` to `/api/summarize` (use an `AbortController` stored against the current request) so a stray backend call doesn't speak *after* the user asked it to stop.

**Phase 2 upgrade path:** if `chrome.tts`'s native voice quality feels robotic once this is a real product, swap in a hosted TTS provider (e.g. ElevenLabs) behind a `/api/tts` endpoint — same pattern as `/api/summarize`, key stays server-side. Not needed for the demo.

---

### 5.6 Command Router (the glue every feature above depends on)

**Phase 1 (MVP): deterministic regex/keyword matching.** Fast, free, predictable, easy to unit test.

| Pattern (illustrative) | Intent | Params captured |
|---|---|---|
| `^(open my stuff\|open my requirements\|open my links)` | `OPEN_SAVED_LINKS` | — |
| `open {site} and search (.+)` / `search (.+) on {site}` | `SITE_SEARCH` | `site`, `query` |
| `^(search\|find\|look up\|google) (.+)` | `WEB_SEARCH` | `query` |
| `(search\|find) (.+) and (summarize\|explain\|read) it` | `WEB_SEARCH_THEN_SUMMARIZE` | `query` |
| `^(summarize\|summarise\|read\|explain)( this page\| this)?$` | `SUMMARIZE_PAGE` | — |
| `^(stop\|stop talking\|cancel)$` | `STOP` | — |

**Phase 2: LLM-based intent parsing** for natural phrasing regex can't anticipate — a small `/api/parse-intent` call (Groq's `llama-3.1-8b-instant`, fastest/cheapest model on their free tier) that returns `{intent, params}` as structured JSON, used only as a fallback when regex matching fails, so the common cases stay instant and free, and only ambiguous phrasing pays the LLM round-trip cost — and even that round trip is quick, given Groq's inference speed.

---

## 6. Chrome Extension Manifest (Manifest V3)

```json
{
  "manifest_version": 3,
  "name": "UrPilot",
  "version": "0.1.0",
  "description": "Hands-free voice assistant for browsing, tabs, and research.",
  "action": {},
  "side_panel": { "default_path": "sidepanel.html" },
  "options_page": "options.html",
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "permissions": [
    "storage",
    "tabs",
    "activeTab",
    "scripting",
    "offscreen",
    "sidePanel",
    "commands",
    "tts"
  ],
  "host_permissions": [
    "https://your-backend.vercel.app/*"
  ],
  "commands": {
    "toggle-listening": {
      "suggested_key": { "default": "Ctrl+Shift+L", "mac": "Command+Shift+L" },
      "description": "Toggle UrPilot voice listening"
    }
  }
}
```

**Permission justifications (you'll need these verbatim-ish for Chrome Web Store review later):**
| Permission | Why |
|---|---|
| `storage` | save the user's link list, site-search templates, preferences |
| `tabs` / `activeTab` | open saved links, navigate to search results, know which tab to extract content from |
| `scripting` | inject the content-extraction script into the active tab on demand (avoids a broad, always-on `content_scripts` entry) |
| `offscreen` | run continuous speech recognition outside the service worker/popup lifecycle |
| `sidePanel` | persistent UI across tab switches (better than a popup, which closes on blur) |
| `commands` | keyboard shortcut for push-to-talk |
| `tts` | speak summaries back to the user |

Deliberately **not** requesting `<all_urls>` host permissions for the extension's own use — content extraction uses `activeTab` + `scripting`, which only grants access to the tab the user is currently interacting with, and only for the moment a command is issued. This keeps the Chrome Web Store install-prompt permission list shorter and less alarming, which matters once this stops being a personal demo.

---

## 7. Message-Passing Reference

All cross-context messages share one discriminated-union type so nothing gets out of sync:

```ts
type ExtensionMessage =
  | { type: 'START_LISTENING' }
  | { type: 'STOP_LISTENING' }
  | { type: 'TRANSCRIPT_INTERIM'; text: string }
  | { type: 'TRANSCRIPT_FINAL'; text: string }
  | { type: 'EXTRACT_CONTENT' }
  | { type: 'PAGE_CONTENT'; title: string; text: string; url: string }
  | { type: 'ROUTE_COMMAND'; transcript: string }
  | { type: 'PANEL_UPDATE'; payload: { summary?: string; keyPoints?: string[]; status: string } }
  | { type: 'SPEAK'; text: string }
  | { type: 'STOP_SPEAKING' };
```

**End-to-end sequence for the flagship chained command** ("search X and summarize it"):

1. Offscreen → Background: `TRANSCRIPT_FINAL "search stellar soroban docs and summarize it"`
2. Background → Command Router → intent `WEB_SEARCH_THEN_SUMMARIZE`, `query = "stellar soroban docs"`
3. Background → Backend: `POST /api/search {query}`
4. Backend → Background: `{top: {url: "https://developers.stellar.org/..."}}`
5. Background: `chrome.tabs.update(tabId, {url})`
6. Background listens for `chrome.tabs.onUpdated` → `status: 'complete'`
7. Background → Content script (that tab): `EXTRACT_CONTENT`
8. Content script → Background: `PAGE_CONTENT {title, text, url}`
9. Background → Backend: `POST /api/summarize {title, text, url, mode: 'steps'}`
10. Backend → Background: `{summary, spokenSummary, keyPoints}`
11. Background → Side Panel: `PANEL_UPDATE {summary, keyPoints}`
12. Background: `chrome.tts.speak(spokenSummary)`

---

## 8. Backend (Next.js) — API Reference

Base URL (example): `https://urpilot-api.vercel.app`

| Method | Path | Auth | Body → Response | Purpose |
|---|---|---|---|---|
| `POST` | `/api/search` | Phase 1: none (IP rate-limited) · Phase 2: bearer token | `{query}` → `{top, alternates}` | Tavily-backed open web search |
| `POST` | `/api/summarize` | same | `{url, title, text, mode}` → `{summary, spokenSummary, keyPoints}` | LLM summarization of extracted page text |
| `POST` | `/api/parse-intent` | same | `{transcript}` → `{intent, params}` | Phase 2 fallback intent classification |
| `GET` | `/api/settings` | Phase 2, required | — → `{savedLinks, siteTemplates, preferences}` | cross-device settings sync |
| `PUT` | `/api/settings` | Phase 2, required | `{savedLinks?, siteTemplates?, preferences?}` → `{ok: true}` | update synced settings |
| `GET` | `/api/history` | Phase 2, required | `?limit=&cursor=` → `{items: [...]}` | past searches/summaries |

**Sample route handler shape (`/api/summarize`), using Groq's OpenAI-compatible SDK:**
```ts
// backend/lib/llm.ts
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function callLLM({ system, user }: { system: string; user: string }) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: { type: 'json_object' }, // ask for structured {summary, spokenSummary, keyPoints}
  });
  return JSON.parse(completion.choices[0].message.content!);
}
```
```ts
// app/api/summarize/route.ts
export async function POST(req: Request) {
  const { url, title, text, mode } = await req.json();
  const truncated = text.slice(0, 10000); // stay well under Groq's 12k TPM ceiling per call
  const result = await callLLM({
    system: SUMMARIZE_SYSTEM_PROMPT(mode),
    user: `Title: ${title}\nURL: ${url}\n\n${truncated}`,
  });
  return Response.json(result);
}
```
No new SDK to install beyond the standard `openai` package — Groq is a drop-in base-URL swap, which is the main practical reason it's such a low-friction choice here.

**CORS note:** restrict `Access-Control-Allow-Origin` to your specific extension origin (`chrome-extension://<your-extension-id>`), not `*` — otherwise any website could call your paid/free-tier-limited LLM and search endpoints and burn your quota.

---

## 9. Database Schema (Phase 2 only — not needed for the free demo)

Supabase Postgres. Auth handled by Supabase's built-in `auth.users`; everything else references it.

```sql
create table profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at  timestamptz default now()
);

create table saved_links (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  label       text not null,
  url         text not null,
  position    int not null default 0,
  created_at  timestamptz default now()
);

create table site_templates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  site_name   text not null,
  url_template text not null
);

create table search_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  query       text not null,
  result_url  text,
  created_at  timestamptz default now()
);

create table summary_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  page_url    text not null,
  page_title  text,
  summary     text,
  created_at  timestamptz default now()
);

create table usage_counters (
  user_id     uuid references auth.users(id) on delete cascade,
  month       date not null,
  search_count int default 0,
  summarize_count int default 0,
  primary key (user_id, month)
);

-- Row Level Security: every table, same pattern
alter table saved_links enable row level security;
create policy "own rows only" on saved_links
  for all using (auth.uid() = user_id);
-- repeat the enable/policy pair for each table above
```

---

## 10. Free-Tier Resource Plan (verified July 22, 2026)

| Service | Free tier | Card required? | Notes |
|---|---|---|---|
| Web Speech API (Chrome) | Unlimited, built into browser | No | Zero cost, always |
| `chrome.storage`, `chrome.tabs`, `chrome.tts` | Unlimited (browser API) | No | Zero cost, always |
| Readability.js | MIT license, self-hosted | No | Zero cost, always |
| **Tavily Search API** | **1,000 credits/month** | **No** | Recommended search backend |
| **Groq — `llama-3.3-70b-versatile`** | 30 RPM / 1,000 requests-per-day / 12k TPM / 100k tokens-per-day | **No** | Primary summarization + intent-parsing model. Quality roughly GPT-4o-class at several times the inference speed |
| Groq — `openai/gpt-oss-120b` | 30 RPM / 1,000 RPD / 8k TPM / 200k TPD | No | Alternative if you want a bigger model for harder pages; higher daily token ceiling than the Llama model |
| Groq — `llama-3.1-8b-instant` | ~14,400 RPD, smaller TPM window | No | Fastest/cheapest option for simple intent-classification calls once Phase 2 adds LLM-based routing |
| Vercel Hobby | Free for personal/non-commercial projects | No | Hosts the Next.js backend |
| Supabase (Phase 2) | 500MB DB, 50k MAU, 1GB storage, 5GB egress, 2 active projects | No | **Free projects auto-pause after 7 days of no DB activity** — set up a cheap keep-alive ping (GitHub Actions cron) if you want it always warm during a demo period |
| Upstash Redis (Phase 2, rate limiting) | 500k commands/month, 256MB | No | Optional, only needed once you have real traffic to protect against |
| Chrome Web Store listing | **$5 one-time** (only if/when you publish publicly) | Yes | "Load unpacked" in Developer Mode is free forever for personal/demo use — you don't need this at all for a demo |

**Bottom line for a pure $0 demo:** Groq (`llama-3.3-70b-versatile`) for summarization + Tavily for search + Vercel Hobby + Load Unpacked. The only unavoidable cost in this entire plan, ever, is the one-time $5 Chrome Web Store fee, and only once you decide to publish publicly.

**One data-privacy caveat worth knowing before you pick a default:** I don't have a verified, current answer on whether Groq's free tier uses prompts/responses for training — check Groq's own data policy (console.groq.com) before you're routinely summarizing other people's private pages through it, rather than assuming either way.

**Bonus, since you're already on Groq:** GroqCloud's free tier also serves Whisper (`whisper-large-v3` / `whisper-large-v3-turbo`) for speech-to-text. Not needed for MVP — the Web Speech API in §5.1 is free and requires zero backend calls — but worth knowing about as a Phase 2 upgrade if Chrome's built-in recognition proves less accurate than you'd like for technical/domain-specific vocabulary (e.g. "Soroban", "Anchor", "Freighter").

---

## 11. Security & Privacy Checklist

- [ ] No API key (Tavily, Groq) ever appears in extension source, bundled JS, or `manifest.json` — they live only in Vercel environment variables, read only inside Route Handlers.
- [ ] Backend CORS restricted to your specific `chrome-extension://<id>` origin, not `*`.
- [ ] `/api/search` and `/api/summarize` are rate-limited per IP (Phase 1) or per user (Phase 2) so a leaked extension ID can't run up your bill.
- [ ] Extracted page text is truncated server-side before hitting the LLM (protects both token cost and against pathological huge pages).
- [ ] `activeTab` + `scripting` used instead of broad `<all_urls>` content-script injection wherever possible.
- [ ] Mic permission requested with a clear one-time explanation in the UI (helps both user trust and Chrome Web Store review).
- [ ] If/when you add page-content summarization for arbitrary user browsing in production, a short privacy policy is required for Chrome Web Store listing — state what's sent to which LLM provider and that Chrome sync (if used) travels through Google's storage layer.

---

## 12. Development Roadmap

| Phase | Scope | Rough effort |
|---|---|---|
| **0 — Setup** | Repo scaffold, manifest boots, Next.js "hello world" deployed to Vercel | ~1 day |
| **1 — Tab automation** | Settings UI (saved links + site templates), "open my stuff" working end-to-end, no backend needed | ~1–2 days |
| **2 — Summarization (manual trigger)** | Content script + Readability, `/api/summarize` + Groq (`llama-3.3-70b-versatile`), side panel render, `chrome.tts` playback — triggered by a button, no voice yet | ~2–3 days |
| **3 — Search & navigate (manual trigger)** | `/api/search` via Tavily, site-template search, `chrome.tabs` navigation — still button-triggered | ~2 days |
| **4 — Voice layer** | Offscreen doc + `SpeechRecognition`, Command Router, wire voice input to Phases 1–3's already-working actions | ~2–3 days |
| **5 — Polish** | Interim-transcript UI, auto-restart-on-silence handling, error/empty states, first-run onboarding | ~2 days |
| **6 — Product (optional, paid)** | Supabase auth + DB, cross-device sync, usage history, per-user rate limiting, Chrome Web Store listing + privacy policy | ongoing |

**Why voice goes last:** debugging speech recognition against features that already work independently is far easier than debugging both the voice layer and the underlying actions simultaneously.

---

## 13. Testing Plan

- **Command Router unit tests** (Vitest/Jest): a table of ~30 sample transcripts → expected `{intent, params}`, covering the phrasing variants in §5.6.
- **Manual QA checklist per feature:**
  - Mic permission grant flow (first run, and after a user revokes it)
  - Saved-link count matches tabs opened, in the right order
  - Site-search templates produce a valid URL for each configured site
  - Web search returns and navigates to a real result (test against a few different query types)
  - Summarization renders in the panel *and* is spoken, and "stop" actually stops both
  - The chained "search X and summarize" flow end-to-end, including the wait-for-page-load step
- **Page-type test matrix for content extraction:** a plain article/blog, a docs site (e.g. Stellar/Soroban docs — relevant to your own use case), a JS-heavy SPA, and a page where Readability is expected to return thin content (confirm the fallback kicks in rather than silently returning nothing).
- **Free-tier headroom check:** Groq's 1,000 requests/day comfortably covers solo demo/dev usage, but watch the **12,000 tokens-per-minute** cap more than the daily one — a few long docs pages summarized back-to-back can hit the per-minute ceiling well before the daily one, since TPM (not RPD) is usually what bites first in practice. Tavily's 1,000 credits/month is the tighter budget if you're testing search-heavy flows repeatedly in a single day.

---

## 14. Deployment Plan

**Backend:** push `backend/` to GitHub → import into Vercel → set environment variables (`TAVILY_API_KEY`, `GROQ_API_KEY`) in the Vercel dashboard, never in committed files → auto-deploys on push.

**Extension (demo stage):** `chrome://extensions` → Developer Mode → "Load unpacked" → select `extension/dist`. Completely free, no store submission needed, reload after each build.

**Extension (public stage, later):** one-time $5 Chrome Web Store developer registration → package the built extension → submit for review, including the permission justifications from §6 and a hosted privacy policy URL (a GitHub Pages or Notion page is fine to start).

---

## 15. Environment Variables Reference

```bash
# backend/.env.local — never commit this file
TAVILY_API_KEY=
GROQ_API_KEY=
SUPABASE_URL=                 # Phase 2
SUPABASE_SERVICE_ROLE_KEY=    # Phase 2 — server-side only, never the anon key here
UPSTASH_REDIS_REST_URL=       # Phase 2
UPSTASH_REDIS_REST_TOKEN=     # Phase 2
ALLOWED_EXTENSION_ORIGIN=chrome-extension://<your-extension-id>
```

---

## 16. Open Decisions for You

A few things I made a reasonable default call on — flag if you want a different direction:
1. **Push-to-talk vs. wake-word** for v1 — defaulted to push-to-talk (§5.1).
2. **`llama-3.3-70b-versatile` vs. `openai/gpt-oss-120b` as the default Groq model** — defaulted to the Llama model above for its higher tokens-per-day ceiling; GPT-OSS-120B is a one-line model-name swap in `lib/llm.ts` if you want to compare quality on harder pages.
3. **Vite+CRXJS vs. Plasmo** for the extension bundler — either works; CRXJS is the leaner/more "just Vite" option, Plasmo gives you more scaffolding out of the box. Not specified above beyond the recommendation.

Want me to scaffold the actual `manifest.json`, `background.ts`, and `offscreen.ts` files next so you have a running Phase 0/1 skeleton to build on?
