# 🚀 UrPilot

> **The ultimate hands-free, voice-controlled Chrome browsing assistant.**  
> *Speak natural commands, auto-navigate the web, summarize pages instantly, and listen to results—zero clicks required.*

---

[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Groq Powered](https://img.shields.io/badge/AI-Groq_LPU-FF4500?style=flat-square)](https://groq.com/)
[![Tavily Search](https://img.shields.io/badge/Search-Tavily_AI-4A154B?style=flat-square)](https://tavily.com/)

---

## 🌟 Why UrPilot?

Browsing the web while multitasking, taking notes, or researching can be tedious. **UrPilot** transforms your browser into an intelligent, voice-driven assistant that executes complex web tasks through natural speech.

| The Problem ❌ | The UrPilot Solution ⚡ |
| :--- | :--- |
| Typing searches & opening dozens of tabs manually | **Speak a query** → search web via Tavily → automatically jump straight to the best page |
| Skimming wall-of-text articles & docs | **Instant AI Summarization** powered by Groq's sub-second LPU inference |
| Eye-strain & context switching | **Native Voice Output (TTS)** reads key insights directly to you |
| Exposed API keys in extension client bundles | **Decoupled Architecture**: API secrets stay 100% server-side on Next.js backend |

---

## ✨ Key Features

- 🎙️ **Always-On / Push-to-Talk Voice Engine**: Continuous speech recognition operating reliably inside an isolated Chrome **Offscreen Document** using Web Speech API.
- 🔍 **Smart Voice Search & Auto-Navigation**: Say *"Search how to deploy a smart contract on Stellar"* — UrPilot queries Tavily AI search and navigates automatically to the top relevant result.
- 📑 **One-Click & Voice Page Summarization**: Extracts main readable content using `@mozilla/readability` and generates concise, step-by-step summaries via Groq LLMs.
- 🔊 **Voice Answers (Text-to-Speech)**: Integrated native `chrome.tts` reads summaries and answers aloud with customizable speed and pitch.
- 📂 **"Open My Stuff" Tab Workflows**: Custom voice macros to launch sets of favorite URLs and workspace tabs instantly.
- 🛡️ **Secure MV3 Architecture**: Manifest V3 compliant with background Service Worker message hub, React Side Panel, and Next.js backend proxy.

---

## 🏗️ Architecture

```
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                        CHROME EXTENSION (Client side)                           │
 │                                                                                 │
 │   ┌───────────────────┐       ┌───────────────────────┐       ┌──────────────┐  │
 │   │   Side Panel UI   │◄─────►│   Background Worker   │◄─────►│ Offscreen    │  │
 │   │ (React 18 + Vite) │ msgs  │ (background/hub.ts)   │ msgs  │ Document     │  │
 │   │  - Mic Controls   │       │  - Command Routing    │       │ (Speech Rec) │  │
 │   │  - Transcript & UI│       │  - Tab Automation     │       └──────────────┘  │
 │   └───────────────────┘       └───────────┬───────────┘                         │
 │                                           │ chrome.scripting                    │
 │                                           ▼                                     │
 │                               ┌───────────────────────┐                         │
 │                               │    Content Script     │                         │
 │                               │ (DOM / Readability)   │                         │
 │                               └───────────┬───────────┘                         │
 └───────────────────────────────────────────┼─────────────────────────────────────┘
                                             │ fetch() requests
                                             ▼
                         ┌───────────────────────────────────────┐
                         │       NEXT.JS BACKEND (Vercel)        │
                         │  /api/search     ➔ Tavily AI Search   │
                         │  /api/summarize  ➔ Groq LPU Inference │
                         └───────────────────┬───────────────────┘
                                             │
                                   ┌─────────┴─────────┐
                                   ▼                   ▼
                           Tavily Search API       Groq Cloud
```

---

## 🛠️ Tech Stack

### Chrome Extension (`/extension`)
- **Framework**: React 18, TypeScript (Strict Mode), Vite, `@crxjs/vite-plugin`
- **Styling & UI**: Tailwind CSS, Lucide Icons
- **Speech & Extraction**: Web Speech API (`SpeechRecognition`), Mozilla Readability, Chrome Native TTS API

### Backend Service (`/backend`)
- **Framework**: Next.js 15 (App Router), TypeScript, Zod Schema Validation
- **AI & Search Engines**: Groq LPU API (OpenAI Compatible SDK), Tavily Web Search API

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `>= 22.0.0`
- **npm**: `>= 10.0.0`

### 1. Installation

Clone the repository and install dependencies across all workspaces:

```bash
npm install
```

### 2. Environment Setup

Copy example environment configuration files:

```bash
# Windows PowerShell / CMD
copy backend\.env.example backend\.env.local
copy extension\.env.example extension\.env

# macOS / Linux
cp backend/.env.example backend/.env.local
cp extension/.env.example extension/.env
```

Edit `backend/.env.local` with your API keys:

```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
ALLOWED_EXTENSION_ORIGIN=chrome-extension://YOUR_EXTENSION_ID
```

---

## 💻 Development Workflow

Start both backend API and extension dev servers concurrently:

```bash
# Terminal 1: Next.js Backend (http://localhost:3001)
npm run dev:backend

# Terminal 2: Extension Vite HMR
npm run dev:extension
```

### Load Extension in Chrome

1. Build or run dev mode for the extension (`npm run dev:extension`).
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (top right toggle).
4. Click **Load unpacked** and select the `extension/dist` directory.

---

## 🧪 Verification & Testing

Run full project checks prior to committing:

```bash
# Type check all workspaces
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
├── extension/             # Manifest V3 Chrome Extension (React + Vite + CRXJS)
│   ├── src/
│   │   ├── background/    # Service worker & Message Hub
│   │   ├── content/       # Page DOM text extractor (Mozilla Readability)
│   │   ├── offscreen/     # Background Web Speech recognition runner
│   │   ├── sidepanel/     # Main Voice Assistant React UI
│   │   └── shared/        # Message types, schemas, and helpers
│   ├── manifest.config.ts # Dynamic Chrome Manifest V3 configuration
│   └── vite.config.ts
├── backend/               # Next.js 15 API Backend (Serverless deployment)
│   ├── src/app/api/       # /search & /summarize endpoints
│   └── src/lib/           # Groq & Tavily API wrappers
└── package.json           # npm workspaces configuration
```

---

## 📄 License

MIT © [Anurag Dubey](https://github.com/anuraggdubey)
