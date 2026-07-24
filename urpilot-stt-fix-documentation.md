# UrPilot — STT Accuracy & Command-Matching Fix
### Fix plan: hybrid speech recognition + wider fast-path command coverage
*Companion to `urpilot-technical-documentation.md`. Last verified: July 24, 2026.*
*Scope: this document changes only the speech-input layer (§5.1) and the
command-matching step inside the Command Router (§5.2/§5.3). Nothing else in
the existing architecture is touched — see §7 "Do Not Touch" for the explicit
guardrail list.*

---

## 0. Two separate problems, currently reading as one

What you're describing is actually **two different bugs** wearing the same
symptom ("it says it didn't catch the command"). Fixing them the same way
would be the wrong move, so they're split out below and both are covered, but
as two independent fixes:

| # | Problem | Where it actually lives | Symptom |
|---|---|---|---|
| A | **STT mishearing/mis-transcribing** — the words themselves come out wrong or garbled | `SpeechRecognition` in the offscreen doc (§5.1 of the tech doc) | Chrome's built-in engine transcribes "chrome web store" as something slightly off (e.g. "crow web store"), so *nothing* downstream can match it, even if a template existed |
| B | **Command Router coverage** — the words are transcribed correctly, but there's no matching entry to route to | `commandRouter.ts`, the site-template lookup (§5.3) | "open chrome web store" is transcribed perfectly, but it's simply not in your `siteTemplates` table, so it falls through to the fallback message |

Both get fixed here: §1–§5 fix (A) with a hybrid STT engine, §6 fixes (B) with
a wider, tiered matching strategy that still keeps hardcoded lookups
API-free. Fixing only (A) would still leave "chrome web store" failing if it's
genuinely not in your list; fixing only (B) would still leave it failing on a
noisy mic even if you added it. You need both.

---

## 1. Current STT setup (recap, unchanged)

Per tech doc §5.1: `webkitSpeechRecognition` (Chrome's built-in Web Speech
API) runs inside the offscreen document, `continuous: true`,
`interimResults: true`. This stays as the **default, primary** engine — it's
free, zero-latency, needs no model download, and works fine for clearly-spoken
common commands. The fix is not to replace it; it's to give it a safety net.

**Why it currently misses things like "chrome web store":**
1. Web Speech API has no way to bias recognition toward your app's specific
   vocabulary (brand names, multi-word product names) — it's a general-purpose
   dictation engine, not tuned for command phrases.
2. No confidence-based fallback exists today — if the engine returns a
   low-confidence or garbled result, the Command Router just fails to match it
   and gives up, instead of trying again a different way.
3. No offline "second opinion" model exists to re-check an utterance the
   Command Router couldn't resolve.

---

## 2. The fix: hybrid dual-engine STT (Web Speech + local offline model)

**Both engines run — not either/or.** Web Speech stays the default, real-time
engine for the live transcript. A local, fully offline model acts as a
**fallback re-transcriber**, triggered only when needed, never replacing the
primary flow.

```
User speaks
     │
     ▼
Web Speech API (existing, unchanged)
  → interim + final transcript, streamed live to UI (unchanged)
     │
     ▼
Command Router attempts match (§6)
     │
     ├─ Matched  ─────────────────────────────► execute action (unchanged)
     │
     └─ No match OR Web Speech confidence < threshold
              │
              ▼
     Local offline STT re-transcribes the SAME buffered audio
     (no network call — runs entirely in the offscreen doc)
              │
              ▼
     Command Router attempts match again on the corrected transcript
              │
              ├─ Matched  ─► execute action
              └─ Still no match ─► "Sorry, I didn't catch that" (existing message, unchanged)
```

This means: commands that already work today keep working exactly as they do
today (Web Speech alone resolves them, fast path never even triggers the local
model — zero added latency for the happy path). Only the currently-failing
cases get a second, offline attempt before giving up.

---

## 3. Local offline STT package — recommendation

**No Groq, no Tavily, no network call of any kind for this layer** — confirmed
requirement, and also the right call: STT should never depend on an API
being up, rate limits, or a key.

| Package | What it is | Model size | Maintenance | Verdict |
|---|---|---|---|---|
| **`@huggingface/transformers`** (formerly `@xenova/transformers`) running `onnx-community/whisper-tiny.en` | Whisper, ONNX-converted, runs via WASM or WebGPU entirely client-side | ~40MB quantized (tiny.en) | **Actively maintained**, v3.x has WebGPU support (5–10× faster than WASM where available), auto-falls-back to WASM | **Recommended primary choice** |
| `vosk-browser` | Kaldi speech engine compiled to WASM | ~50MB per language model | Last published years ago — functional but effectively unmaintained | Backup option only if bundle size or licensing rules out Whisper |

**Recommendation: `@huggingface/transformers` with `onnx-community/whisper-tiny.en`.**
It's actively maintained, npm-installable, has no server component, and the
English-only tiny model is small enough for an extension bundle/cache without
being wasteful — you don't need multilingual support or a bigger model just to
catch "chrome web store"-style misses.

```bash
npm install @huggingface/transformers
```

```ts
// offscreen/localStt.ts
import { pipeline } from '@huggingface/transformers';

let transcriber: any = null;

export async function getLocalTranscriber() {
  if (!transcriber) {
    transcriber = await pipeline(
      'automatic-speech-recognition',
      'onnx-community/whisper-tiny.en',
      { device: 'webgpu' }   // auto-detects; falls back to 'wasm' if WebGPU unavailable
    );
  }
  return transcriber;
}

export async function reTranscribe(audioBuffer: Float32Array): Promise<string> {
  const model = await getLocalTranscriber();
  const result = await model(audioBuffer);
  return result.text.trim();
}
```

**Model download & caching:** the model downloads once (from Hugging Face's
CDN, not your backend) on first use and is cached in the browser's Cache
Storage / IndexedDB by `transformers.js` itself — subsequent runs load from
cache, fully offline. This first-download step is the only network dependency
in this entire fallback path, and it's a one-time model fetch, not a per-query
API call — fundamentally different from calling Groq/Tavily per command.

If you want **zero network dependency even on first run** (e.g. for a fully
offline demo), the model files can be bundled into the extension package
itself at build time instead of fetched from the HF CDN — flagged as an open
decision in §9.

---

## 4. Capturing audio for the fallback

Web Speech API doesn't expose raw audio, so the offscreen doc needs to record
the same utterance in parallel via `MediaRecorder` / `AudioContext`, discard it
immediately if Web Speech resolves successfully (the common case — no wasted
work), and only decode it for the local model when a fallback is actually
triggered.

```ts
// offscreen/offscreen.ts — additive, alongside existing SpeechRecognition setup
let audioChunks: Float32Array[] = [];
let audioContext: AudioContext | null = null;

async function startAudioCapture(stream: MediaStream) {
  audioContext = new AudioContext({ sampleRate: 16000 }); // Whisper expects 16kHz
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  source.connect(processor);
  processor.connect(audioContext.destination);
  processor.onaudioprocess = (e) => {
    audioChunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };
}

function getBufferedAudio(): Float32Array {
  const total = audioChunks.reduce((n, c) => n + c.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  for (const chunk of audioChunks) { merged.set(chunk, offset); offset += chunk.length; }
  return merged;
}

function clearAudioBuffer() { audioChunks = []; }
```

Clear the buffer on every `onresult` final event that successfully matches a
command (the common path), so it never grows unbounded and never gets reused
for the local model unless it's actually needed.

**Manifest note:** running WASM inside an MV3 extension requires
`'wasm-unsafe-eval'` in the extension's CSP, or the WebAssembly module will be
blocked at load time:
```json
// manifest.json
"content_security_policy": {
  "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
}
```

---

## 5. Confidence-based trigger logic

Web Speech API returns a per-result confidence score
(`event.results[i][0].confidence`, 0–1). Use it as a second trigger for the
fallback, not just "no match at all":

```ts
recognition.onresult = (event) => {
  const result = event.results[event.results.length - 1];
  const transcript = result[0].transcript.trim();
  const confidence = result[0].confidence;

  if (result.isFinal) {
    const routed = commandRouter.tryMatch(transcript);
    if (!routed && (confidence < 0.55 || confidence === 0)) {
      // 0 confidence is common on some Chrome builds — don't skip the fallback
      // just because confidence is unreported; treat unknown as "try anyway"
      triggerLocalFallback();
    } else if (!routed) {
      // decent confidence but genuinely no matching command — see §6, this
      // is where "not hardcoded" cases get a second chance before failing
      triggerLocalFallback();
    }
  }
};
```

Note: any unresolved final transcript triggers the fallback, regardless of
confidence score, since Chrome's confidence reporting is inconsistent across
versions/platforms and shouldn't be trusted as the sole gate — it's an
additional signal, not a hard requirement.

---

## 6. Command Router: wider fast path, unchanged hardcoded behavior

This is the fix for problem (B) — "chrome web store" being genuinely absent
from your list. The goal: keep exact hardcoded lookups exactly as fast and
API-free as they are today, but make more real-world phrasing land in that
fast path before anything falls back to a network call.

**Tiered matching, in order:**

```
1. Exact match         → existing siteTemplates lookup (unchanged, no API)
2. Normalized match     → lowercase, strip punctuation/filler words
                          ("open the chrome web store" → "chrome web store")
3. Fuzzy match          → Levenshtein/edit-distance against known site names,
                          catches near-misses from STT ("get hub" ~ "github")
4. Alias/synonym match  → small bundled alias table (no API), e.g.
                          "webstore" / "extensions store" → "chrome web store"
5. Common-sites lookup  → a larger *bundled, static* dictionary of well-known
                          site name → URL, shipped with the extension, separate
                          from the user's editable siteTemplates (no API)
6. Fallback: web search → existing Tavily-backed /api/search (unchanged,
                          only reached if 1–5 all miss)
```

Steps 2–5 are all still **local, static, zero-API** — they just widen what
counts as a "hardcoded" match instead of requiring an exact string. This
directly answers your question: it's fine for the fast path to be
hardcoded/API-free and the fallback to need an API — the fix is making the
hardcoded tier smarter, not replacing the tiered design.

```ts
// lib/siteTemplates.ts — additive
export const COMMON_SITES: Record<string, string> = {
  'chrome web store': 'https://chromewebstore.google.com',
  'google drive': 'https://drive.google.com',
  'gmail': 'https://mail.google.com',
  'chatgpt': 'https://chat.openai.com',
  // ...expand as needed, community-maintainable, no API cost to add entries
};

const ALIASES: Record<string, string> = {
  'webstore': 'chrome web store',
  'extension store': 'chrome web store',
  'extensions page': 'chrome web store',
};

export function resolveSite(spoken: string): string | null {
  const normalized = spoken.toLowerCase().trim().replace(/^(the|a|an)\s+/, '');
  if (COMMON_SITES[normalized]) return COMMON_SITES[normalized];
  if (ALIASES[normalized]) return COMMON_SITES[ALIASES[normalized]] ?? null;

  // fuzzy fallback
  const candidates = Object.keys(COMMON_SITES);
  const best = candidates.reduce((closest, name) => {
    const dist = levenshtein(normalized, name);
    return dist < closest.dist ? { name, dist } : closest;
  }, { name: '', dist: Infinity });

  return best.dist <= 2 ? COMMON_SITES[best.name] : null;
}
```

This `COMMON_SITES` table is the actual fix for "chrome web store won't
open" — it was never an STT problem for that specific phrase once STT is
accurate; it was a coverage gap. Ship it pre-populated with the top 30–40
sites people actually ask for (extend anytime, zero cost, zero API).

---

## 7. Do Not Touch — explicit guardrails

Per your instruction, everything below stays exactly as it is:

- [ ] Existing `siteTemplates` (user-editable, `chrome.storage.sync`) — untouched, `COMMON_SITES` is additive and checked separately
- [ ] `/api/search` (Tavily) — untouched, still the final fallback, same contract
- [ ] `/api/summarize` (Groq) — completely untouched, this document does not touch summarization at all
- [ ] `chrome.tts` playback — untouched
- [ ] "Open my stuff" saved-links flow — untouched
- [ ] Existing auto-restart-on-`onend` silence handling (tech doc §5.1 point 6) — kept as-is, local STT fallback is additive to this, not a replacement
- [ ] Existing chained "search X and summarize" flow — untouched

---

## 8. Testing plan (STT-specific)

- **Confidence-threshold sweep:** log real confidence values across ~20 test
  utterances on your own mic/environment before hardcoding `0.55` — Chrome's
  confidence scoring varies by platform (Windows/Mac/ChromeOS report
  differently), so calibrate the threshold to what you actually observe rather
  than trusting the number above as final.
- **Fallback-trigger matrix:** clear commands (should never trigger local
  model), deliberately mumbled commands (should trigger and correctly
  resolve), background-noise commands (should trigger; verify local model
  isn't equally thrown off by the same noise).
- **Coverage matrix:** run every entry in `COMMON_SITES` through both engines
  to confirm tier 1–5 resolves it without ever reaching the Tavily fallback.
- **Latency check:** confirm the happy path (Web Speech resolves directly) has
  zero added delay — the local model must only load/run when the fallback
  actually triggers, not preemptively on every utterance.
- **First-run model download:** test on a clean profile to confirm the
  one-time Whisper model fetch doesn't block or freeze the UI — show a
  one-time "setting up offline recognition…" indicator if it's slow on a
  given connection.

---

## 9. Open Decisions for You

1. **Bundle the Whisper model at build time vs. fetch from HF CDN on first
   use** — fetching is simpler and keeps the extension package small;
   bundling gives you a fully offline first run at the cost of a larger
   package size (~40MB). Defaulted to CDN-fetch-on-first-use above.
2. **Confidence threshold (`0.55` above)** — a starting guess, not measured
   against your actual mic/environment; calibrate per §8 before shipping.
3. **`vosk-browser` as a lighter alternative** — only worth revisiting if the
   Whisper model's ~40MB footprint or WASM/WebGPU performance turns out to be
   a problem on lower-end machines; flagged in §3 but not the default
   recommendation given its maintenance status.
4. **Size of the `COMMON_SITES` bundled dictionary** — how many sites to
   pre-ship vs. leave for users to add via the existing options-page CRUD;
   30–40 covers most common requests without bloating the bundle.
