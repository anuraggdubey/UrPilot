# 🚀 UrPilot

> **The ultimate hands-free, voice-controlled browser assistant — now on Chrome & Microsoft Edge.**  
> *Speak natural commands, auto-navigate the web, summarize pages instantly, and listen to results — zero clicks required.*

---

[![CI](https://github.com/anuraggdubey/UrPilot/actions/workflows/ci.yml/badge.svg)](https://github.com/anuraggdubey/UrPilot/actions/workflows/ci.yml)
[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Edge Add-ons](https://img.shields.io/badge/Edge-Add--ons-0078D7?style=flat-square&logo=microsoftedge&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/urpilot/dckoojfpocofcagpgeppkkmgbkjielaa)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Groq Powered](https://img.shields.io/badge/AI-Groq_LPU-FF4500?style=flat-square)](https://groq.com/)
[![Tavily Search](https://img.shields.io/badge/Search-Tavily_AI-4A154B?style=flat-square)](https://tavily.com/)

---

## 📥 Install the Extension

| Browser | Link |
| :--- | :--- |
| **Microsoft Edge** | [**Get UrPilot on Edge Add-ons →**](https://microsoftedge.microsoft.com/addons/detail/urpilot/dckoojfpocofcagpgeppkkmgbkjielaa) |
| **Google Chrome** | *Coming soon on Chrome Web Store* |

---

## ⚡ Quick Start & Keyboard Shortcuts

Once installed, trigger UrPilot hands-free from any tab:

| Action | Windows / Linux | macOS | Description |
| :--- | :---: | :---: | :--- |
| 🎛️ **Open Extension** | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Y</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>Y</kbd> | Opens the UrPilot Side Panel UI |
| 🎙️ **Toggle Voice** | <kbd>Ctrl</kbd> + <kbd>U</kbd> | <kbd>Cmd</kbd> + <kbd>U</kbd> | Press once to start listening / Press again to stop |

> 💡 *Pro Tip: Rebind shortcuts anytime at `chrome://extensions/shortcuts` (Chrome) or `edge://extensions/shortcuts` (Edge).*

---

## 🌟 Why UrPilot?

| The Problem ❌ | The UrPilot Solution ⚡ |
| :--- | :--- |
| Typing searches & opening dozens of tabs manually | **Speak a query** → search web via Tavily → auto-navigate to the best page |
| Skimming wall-of-text articles & docs | **Instant AI Summarization** powered by Groq's sub-second LPU inference |
| Eye-strain & context switching | **Native Voice Output (TTS)** reads key insights directly to you |
| Exposed API keys in extension client bundles | **Decoupled Architecture**: API secrets stay 100% server-side on Next.js backend |

---

## ✨ Key Features

- 🎙️ **Always-On / Push-to-Talk Voice Engine** — Continuous speech recognition in an isolated Offscreen Document using Web Speech API + local Whisper fallback.
- 🔍 **Smart Voice Search & Auto-Navigation** — Say *"Search how to deploy a smart contract on Stellar"* — UrPilot queries Tavily AI and navigates to the top result.
- 📑 **One-Click Page Summarization** — Extracts readable content via `@mozilla/readability` and generates concise summaries via Groq LLMs.
- 🔊 **Voice Answers (TTS)** — Integrated `chrome.tts` reads summaries aloud with customizable speed and pitch.
- 📂 **"Open My Stuff" Tab Workflows** — Custom voice macros to launch sets of favorite URLs instantly.
- 🤖 **AI Intent Parsing** — When voice commands are ambiguous, Groq LLM resolves intent server-side.
- 💬 **Ask Page & Suggest Reply** — Ask questions about the current page or generate contextual replies.
- 🛡️ **Secure MV3 Architecture** — Manifest V3 compliant with background Service Worker, React Side Panel, and Next.js backend proxy.

---

## 🏗️ Architecture

```
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                  BROWSER EXTENSION (Chrome / Edge — Manifest V3)               │
 │                                                                                │
 │   ┌───────────────────┐       ┌───────────────────────┐       ┌──────────────┐ │
 │   │   Side Panel UI   │◄─────►│   Background Worker   │◄─────►│ Offscreen    │ │
 │   │ (React 18 + Vite) │ msgs  │  (Service Worker)     │ msgs  │ Document     │ │
 │   │  - Mic Controls   │       │  - Command Routing    │       │ (Speech Rec) │ │
 │   │  - Transcript UI  │       │  - Tab Automation     │       │ (Whisper FB) │ │
 │   │  - Options Page   │       │  - TTS Engine         │       └──────────────┘ │
 │   └───────────────────┘       └───────────┬───────────┘                        │
 │                                           │ chrome.scripting                   │
 │                                           ▼                                    │
 │                               ┌───────────────────────┐                        │
 │                               │    Content Script      │                       │
 │                               │ (DOM / Readability)    │                       │
 │                               └───────────┬───────────┘                        │
 └───────────────────────────────────────────┼────────────────────────────────────┘
                                             │ fetch() requests
                                             ▼
                         ┌───────────────────────────────────────┐
                         │       NEXT.JS BACKEND (Vercel)        │
                         │  /api/search       → Tavily AI Search │
                         │  /api/summarize    → Groq LPU         │
                         │  /api/parse-intent → Groq LLM         │
                         │  /api/ask-page     → Groq LLM         │
                         │  /api/suggest-reply→ Groq LLM         │
                         │  /api/health       → Health Check      │
                         └───────────────────┬───────────────────┘
                                             │
                                   ┌─────────┴─────────┐
                                   ▼                   ▼
                           Tavily Search API       Groq Cloud
```

---

## 🛠️ Tech Stack

### Browser Extension (`/extension`)

| Category | Technologies |
| :--- | :--- |
| **Framework** | React 18, TypeScript 5.8 (Strict), Vite 5, `@crxjs/vite-plugin` |
| **Styling** | Tailwind CSS 3, Lucide Icons |
| **Speech** | Web Speech API (`SpeechRecognition`), Whisper.js fallback (`@huggingface/transformers`) |
| **Extraction** | Mozilla Readability |
| **TTS** | Chrome Native TTS API (`chrome.tts`) |

### Backend API (`/backend`)

| Category | Technologies |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router), TypeScript, Zod Validation |
| **AI** | Groq LPU API (OpenAI-compatible SDK) |
| **Search** | Tavily Web Search API |
| **Hosting** | Vercel (serverless) |

---

## 🚀 Local Development

### Prerequisites

- **Node.js** `>= 22.0.0`
- **npm** `>= 10.0.0`
- **Groq API Key** — [Get one free at groq.com](https://console.groq.com/)
- **Tavily API Key** — [Get one free at tavily.com](https://app.tavily.com/)

### 1. Clone & Install

```bash
git clone https://github.com/anuraggdubey/UrPilot.git
cd UrPilot
npm install
```

### 2. Environment Setup

```bash
# Windows PowerShell
copy backend\.env.example backend\.env.local
copy extension\.env.example extension\.env

# macOS / Linux
cp backend/.env.example backend/.env.local
cp extension/.env.example extension/.env
```

Edit **`backend/.env.local`** with your API keys:

```env
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
ALLOWED_EXTENSION_ORIGIN=chrome-extension://YOUR_EXTENSION_ID
```

### 3. Run Development Servers

```bash
# Terminal 1 — Next.js Backend (http://localhost:3001)
npm run dev:backend

# Terminal 2 — Extension Vite HMR
npm run dev:extension
```

### 4. Load Extension in Browser

1. Build or run dev mode (`npm run dev:extension`).
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge).
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** → select the `extension/dist` directory.
5. Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Y</kbd> to open the panel!

---

## 🧪 Testing & Verification

```bash
# Type-check all workspaces
npm run typecheck

# Run test suites
npm run test

# Build production bundles
npm run build
```

---

## 📂 Project Structure

```
UrPilot/
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI pipeline
├── extension/                    # Manifest V3 Browser Extension
│   ├── src/
│   │   ├── background/           # Service worker, command router, message hub
│   │   ├── offscreen/            # Offscreen document for speech recognition + Whisper fallback
│   │   ├── sidepanel/            # Main React side panel UI
│   │   ├── options/              # Extension options page
│   │   └── lib/                  # Shared types, storage helpers, site templates
│   ├── manifest.config.ts        # Chrome/Edge Manifest V3 config
│   └── vite.config.ts
├── backend/                      # Next.js 15 API Backend
│   ├── app/
│   │   ├── api/                  # API routes: search, summarize, parse-intent, ask-page, etc.
│   │   ├── docs/                 # Documentation page
│   │   ├── features/             # Feature detail pages
│   │   ├── page.tsx              # Landing page
│   │   └── layout.tsx            # Root layout
│   └── lib/                      # Server-side utilities
├── package.json                  # npm workspaces root
└── README.md
```

---

## 🔄 CI/CD Pipeline

This project uses **GitHub Actions** for continuous integration:

| Trigger | Jobs |
| :--- | :--- |
| Push to `main` | Typecheck → Test → Build (extension + backend) |
| Pull requests to `main` | Typecheck → Test → Build (extension + backend) |

The CI pipeline validates both workspaces in parallel. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for details.

---

## 🌐 Deployment

### Backend (Vercel)

The Next.js backend deploys automatically to **Vercel** on push to `main`. See the [deployment guide](#-deployment-steps) below.

### Extension (Edge Add-ons / Chrome Web Store)

The built extension (`extension/dist/`) is packaged and submitted to browser stores manually.

| Store | Status | Link |
| :--- | :---: | :--- |
| Microsoft Edge Add-ons | ✅ Live | [Install UrPilot](https://microsoftedge.microsoft.com/addons/detail/urpilot/dckoojfpocofcagpgeppkkmgbkjielaa) |
| Chrome Web Store | 🔜 Coming Soon | — |

---

## 📄 License

MIT © [Anurag Dubey](https://github.com/anuraggdubey)
