'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Terminal, Shield, Zap, ExternalLink, Code } from 'lucide-react';

function UrPilotLogo({ className = "h-6 w-6 text-[#17160F]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20L12 4L20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6.5" y1="14" x2="17.5" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E6] text-[#17160F] font-sans antialiased selection:bg-[#EFB92E] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Navigation Header */}
        <div className="flex items-center justify-between border-b border-[#17160F]/20 pb-4">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase hover:underline">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <UrPilotLogo className="h-6 w-6 text-[#17160F]" />
            <span className="font-sans font-black text-lg">URPILOT</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-block border border-[#17160F] bg-white px-3 py-1 text-xs font-mono font-bold uppercase shadow-sm">
            DOCUMENTATION & DEVELOPER GUIDE
          </div>
          <h1 className="font-sans text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-[#17160F]">
            UrPilot Technical Specs
          </h1>
          <p className="text-base sm:text-lg text-[#5C594C] max-w-2xl leading-relaxed">
            Everything you need to install, configure, and customize UrPilot in Chrome or run the web console locally.
          </p>
        </div>

        {/* Quick Setup Step-by-Step */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="border-2 border-[#17160F] bg-white rounded-2xl p-5 shadow-[4px_4px_0_0_#17160F] space-y-3">
            <div className="font-mono text-xs font-bold text-[#EFB92E] bg-[#17160F] px-2 py-0.5 rounded w-max">STEP 01</div>
            <h3 className="font-sans text-lg font-bold text-[#17160F]">Install Chrome Extension</h3>
            <p className="text-xs text-[#5C594C] leading-relaxed">
              Download from Chrome Web Store or build locally via <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">npm run build</code> in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">extension/</code>.
            </p>
          </div>

          <div className="border-2 border-[#17160F] bg-white rounded-2xl p-5 shadow-[4px_4px_0_0_#17160F] space-y-3">
            <div className="font-mono text-xs font-bold text-[#EFB92E] bg-[#17160F] px-2 py-0.5 rounded w-max">STEP 02</div>
            <h3 className="font-sans text-lg font-bold text-[#17160F]">Configure API Keys</h3>
            <p className="text-xs text-[#5C594C] leading-relaxed">
              Open UrPilot Options, input your Groq API key for LPU speech summarization & Tavily key for web search.
            </p>
          </div>

          <div className="border-2 border-[#17160F] bg-white rounded-2xl p-5 shadow-[4px_4px_0_0_#17160F] space-y-3">
            <div className="font-mono text-xs font-bold text-[#EFB92E] bg-[#17160F] px-2 py-0.5 rounded w-max">STEP 03</div>
            <h3 className="font-sans text-lg font-bold text-[#17160F]">Open Side Panel</h3>
            <p className="text-xs text-[#5C594C] leading-relaxed">
              Click the UrPilot icon in Chrome toolbar or press <kbd className="bg-slate-100 border px-1 rounded font-mono text-[10px]">Alt + Shift + U</kbd> to activate.
            </p>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="border-2 border-[#17160F] bg-[#17160F] text-[#F5F0E6] rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-white/15 pb-3 font-mono text-xs text-[#EFB92E] font-bold">
            <div className="flex items-center gap-2">
              <Terminal size={16} />
              <span>Local Development Command</span>
            </div>
            <span>v0.9</span>
          </div>

          <pre className="font-mono text-xs text-slate-200 overflow-x-auto p-4 bg-black/50 rounded-xl leading-relaxed">
{`# 1. Clone Repository & Install Dependencies
git clone https://github.com/urpilot/urpilot.git
cd urpilot
npm install

# 2. Run Next.js Backend App & Dev Server
npm run dev:backend

# 3. Build Chrome Extension Unpacked Manifest V3
cd extension
npm run build`}
          </pre>
        </div>
      </div>
    </div>
  );
}
