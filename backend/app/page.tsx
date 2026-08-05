'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mic,
  Search,
  Play,
  Github,
  Twitter,
} from 'lucide-react';

/* UrPilot Stylized 'A' Logo Icon with Dot */
function UrPilotLogo({ className = "h-6 w-6 text-[#17160F]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 20L12 4L20 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="6.5"
        y1="14"
        x2="17.5"
        y2="14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function UrPilotWebLanding() {
  // Simulator state
  const [simulatorStatus, setSimulatorStatus] = React.useState('Ready when you are.');
  const [isListening, setIsListening] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [summaryResult, setSummaryResult] = React.useState<{
    title: string;
    url: string;
    text: string;
    keyPoints: string[];
  } | null>(null);

  const runSimulatedCommand = (cmd: string) => {
    setTranscript(cmd);
    setIsListening(false);
    setIsProcessing(true);
    setSummaryResult(null);

    const lower = cmd.toLowerCase();
    if (lower.includes('open my stuff') || lower.includes('links')) {
      setSimulatorStatus('Opening saved tab stack...');
      setTimeout(() => {
        setIsProcessing(false);
        setSimulatorStatus('Opened GitHub, Linear, Claude & ChatGPT!');
      }, 1000);
    } else if (lower.includes('search') || lower.includes('soroban')) {
      setSimulatorStatus('Navigating to soroban.dev/docs...');
      setTimeout(() => {
        setIsProcessing(false);
        setSimulatorStatus("Here's what I found.");
        setSummaryResult({
          title: 'Soroban Smart Contracts Quickstart',
          url: 'https://soroban.dev/docs/quickstart',
          text: 'Soroban is Stellar Wasm smart contract platform designed for developer ergonomics. Install CLI via `cargo install soroban-cli` and deploy to testnet.',
          keyPoints: [
            'Wasm-based smart contract execution engine',
            'Low transaction fees with state archival',
            'SDK support for Rust and TypeScript',
          ],
        });
      }, 1200);
    } else {
      setSimulatorStatus('Summarizing page...');
      setTimeout(() => {
        setIsProcessing(false);
        setSimulatorStatus("Here's what I found.");
        setSummaryResult({
          title: 'UrPilot — Voice Controlled Browsing',
          url: 'https://urpilot.dev',
          text: 'UrPilot lives in your side panel. Zero wake word, continuous speech recognition, and instant Groq LLM summarization.',
          keyPoints: ['Hands-free tab opening', 'Tavily web search integration', 'Chrome MV3 side panel architecture'],
        });
      }, 1000);
    }
  };

  return (
    /* OUTER PAGE BACKDROP */
    <div className="min-h-screen bg-[#EBE7DF] py-3 sm:py-6 lg:py-8 px-2 sm:px-3 lg:px-4 font-sans antialiased text-[#17160F] selection:bg-[#EFB92E]">
      {/* FRAMED CONTAINER */}
      <div className="mx-auto max-w-[1560px] bg-[#F5F0E6] flex flex-col overflow-hidden border border-[#17160F]/20">
        
        {/* ================= 1. HERO SECTION ================= */}
        <div className="flex flex-col lg:flex-row">
          {/* LEFT YELLOW SIDEBAR */}
          <aside className="w-full lg:w-80 bg-[#E8BA35] border-r border-[#17160F] p-6 sm:p-8 flex flex-col justify-between flex-shrink-0">
            <div className="space-y-7">
              {/* Header Logo */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <UrPilotLogo className="h-7 w-7 text-[#17160F]" />
                  <span className="font-sans text-xl font-black tracking-wide text-[#17160F]">
                    URPILOT
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-[#17160F]/80">EN ▾</span>
              </div>

              {/* Menu links with dynamic routes */}
              <nav className="space-y-1.5 font-mono text-sm font-bold uppercase tracking-wider text-[#17160F] pt-2">
                <a href="#features" className="flex items-center justify-between border-b border-[#17160F]/20 py-3.5 hover:pl-1 transition-all">
                  <span>FEATURES</span>
                  <span>→</span>
                </a>
                <Link href="/docs" className="flex items-center justify-between border-b border-[#17160F]/20 py-3.5 hover:pl-1 transition-all">
                  <span>DOCS</span>
                  <span>→</span>
                </Link>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center justify-between border-b border-[#17160F]/20 py-3.5 hover:pl-1 transition-all">
                  <span>GITHUB</span>
                  <span>→</span>
                </a>
                <a href="#pricing" className="flex items-center justify-between border-b border-[#17160F]/20 py-3.5 hover:pl-1 transition-all">
                  <span>PRICING — FREE</span>
                  <span>→</span>
                </a>
              </nav>

              {/* Waveform graphic */}
              <div className="py-2 text-[#17160F]">
                <div className="font-mono text-[20px] font-black tracking-widest select-none">
                  ~\/\|/\|/\|/\|/|
                </div>
              </div>

              {/* Support & Source */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-[#17160F]">
                <div>
                  <div className="font-bold uppercase tracking-wider text-[10px] text-[#17160F]/70">SUPPORT</div>
                  <div className="font-mono text-xs font-semibold truncate">hello@urpilot.dev</div>
                </div>
                <div>
                  <div className="font-bold uppercase tracking-wider text-[10px] text-[#17160F]/70">SOURCE</div>
                  <div className="font-mono text-xs font-semibold truncate">github.com/urpilot</div>
                </div>
              </div>
            </div>

            {/* Try a Command bottom box */}
            <div className="border border-[#17160F] bg-[#F5F0E6] p-3 flex items-center justify-between mt-8 text-[#17160F]">
              <span className="font-mono text-xs sm:text-sm font-bold uppercase">TRY A COMMAND</span>
              <Search size={16} />
            </div>
          </aside>

          {/* RIGHT HERO CONTENT */}
          <div className="flex-1 flex flex-col justify-between">
            {/* TOP SHIPPING BAR */}
            <div className="bg-[#17160F] py-2.5 px-6 text-center text-xs sm:text-sm font-semibold text-[#F5F0E6]">
              Now shipping — hands-free browsing, free forever on Chrome Web Store & Microsoft Edge Add-ons.
            </div>

            {/* HERO CONTENT CONTAINER */}
            <main className="p-6 sm:p-10 lg:p-12 flex-1 flex flex-col justify-between space-y-10">
              <div className="grid gap-10 lg:grid-cols-12 items-center py-4">
                {/* Left Browser Mockup Frame */}
                <div className="lg:col-span-6 border-2 border-[#17160F] bg-white rounded-2xl p-5 space-y-3.5">
                  {/* Address Bar */}
                  <div className="flex items-center gap-2 border-b border-[#17160F]/15 pb-3">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-red-400 border border-black/20" />
                      <span className="h-3 w-3 rounded-full bg-yellow-400 border border-black/20" />
                      <span className="h-3 w-3 rounded-full bg-green-400 border border-black/20" />
                    </div>
                    <div className="flex-1 rounded-full border border-black/15 bg-slate-50 px-3 py-1 font-mono text-xs text-slate-500 text-center truncate">
                      soroban.dev/docs/quickstart
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-3.5 pt-1">
                    <div className="col-span-6 space-y-2.5 p-1">
                      <div className="h-4 w-3/4 rounded bg-slate-200" />
                      <div className="h-3 w-full rounded bg-slate-100" />
                      <div className="h-3 w-5/6 rounded bg-slate-100" />
                      <div className="h-3 w-4/5 rounded bg-slate-100" />
                      <div className="h-20 w-full rounded bg-slate-100 border border-slate-200 mt-2" />
                    </div>

                    {/* UrPilot Side Panel Mockup */}
                    <div className="col-span-6 border border-[#17160F] bg-[#F5F0E6] p-3.5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-[#17160F]/10 pb-2">
                        <span className="font-sans text-xs sm:text-sm font-bold">UrPilot</span>
                        <span className="font-mono text-xs">⚙</span>
                      </div>

                      <div className="flex flex-col items-center justify-center py-1.5">
                        <div className="relative flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full bg-[#EFB92E] opacity-30 animate-ping" />
                          <button
                            onClick={() => runSimulatedCommand('summarize this page')}
                            className="h-12 w-12 rounded-full border border-[#17160F] bg-[#EFB92E] flex items-center justify-center"
                          >
                            <Mic size={20} className="text-[#17160F]" />
                          </button>
                        </div>
                        <span className="text-[10px] sm:text-xs font-sans italic text-slate-500 mt-2">"summarize this page..."</span>
                      </div>

                      <div className="space-y-1.5">
                        <Link
                          href="/features/open-my-stuff"
                          className="w-full rounded-lg border border-[#17160F]/20 bg-white px-2.5 py-1.5 text-[10px] sm:text-xs font-medium text-[#17160F] hover:bg-[#EFB92E] transition-colors flex items-center justify-between"
                        >
                          <span>Open my stuff</span>
                          <span>↗</span>
                        </Link>
                        <Link
                          href="/features/voice-search"
                          className="w-full rounded-lg border border-[#17160F]/20 bg-white px-2.5 py-1.5 text-[10px] sm:text-xs font-medium text-[#17160F] hover:bg-[#EFB92E] transition-colors flex items-center justify-between"
                        >
                          <span>Search Soroban docs</span>
                          <span>↗</span>
                        </Link>
                        <Link
                          href="/features/summarize-listen"
                          className="w-full rounded-lg border border-[#17160F]/20 bg-white px-2.5 py-1.5 text-[10px] sm:text-xs font-medium text-[#17160F] hover:bg-[#EFB92E] transition-colors flex items-center justify-between"
                        >
                          <span>Summarize this page</span>
                          <span>↗</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Hero Content */}
                <div className="lg:col-span-6 space-y-5">
                  {/* Sticker Overlay */}
                  <div className="inline-block border border-[#17160F] bg-white p-2.5 rotate-2">
                    <div className="font-mono text-[10px] font-extrabold uppercase text-[#17160F]/70">URPILOT</div>
                    <div className="font-sans text-xs sm:text-sm font-extrabold uppercase text-[#17160F]">ON CHROME & EDGE STORES</div>
                    <div className="font-serif italic text-xs sm:text-sm text-red-600">just shipped!</div>
                  </div>

                  {/* Headline */}
                  <h1 className="font-sans text-[44px] sm:text-[54px] lg:text-[64px] font-extrabold tracking-tight leading-[1.01] text-[#17160F]">
                    For<br />
                    Builders Who<br />
                    Never Touch<br />
                    The Keyboard.
                  </h1>

                  {/* Paragraph */}
                  <p className="font-sans text-base sm:text-lg text-[#5C594C] leading-relaxed max-w-md">
                    Browse, search and summarize the web with your voice. UrPilot lives in your side panel — always ready, never in the way.
                  </p>
                </div>
              </div>

              {/* DIVIDER & CONTROLS ROW */}
              <div className="border-t border-[#17160F]/20 pt-6 my-4 flex flex-wrap items-center justify-between gap-4">
                {/* Left: Circular Arrow Buttons + Slider Line */}
                <div className="flex items-center gap-3.5">
                  <button className="h-10 w-10 rounded-full border border-[#17160F] flex items-center justify-center font-mono text-sm font-bold hover:bg-[#17160F] hover:text-white transition-colors">
                    ←
                  </button>
                  <button className="h-10 w-10 rounded-full border border-[#17160F] flex items-center justify-center font-mono text-sm font-bold hover:bg-[#17160F] hover:text-white transition-colors">
                    →
                  </button>
                  <div className="h-[1px] w-32 bg-[#17160F]/30" />
                </div>

                {/* Right: CTA Pill Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="https://chrome.google.com/webstore"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#17160F] bg-[#17160F] px-7 py-3.5 text-xs sm:text-sm font-bold text-[#F5F0E6] hover:bg-[#EFB92E] hover:text-[#17160F] transition-all"
                  >
                    <span>Add to Chrome — Free</span>
                    <span>↗</span>
                  </a>
                  <a
                    href="https://microsoftedge.microsoft.com/addons/detail/urpilot/dckoojfpocofcagpgeppkkmgbkjielaa"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#17160F] bg-white px-7 py-3.5 text-xs sm:text-sm font-bold text-[#17160F] hover:bg-[#EFB92E] transition-all"
                  >
                    <span>Add to Edge — Free</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* MARQUEE MOVING TICKER BAR */}
        <div className="border-y-2 border-[#17160F] bg-[#17160F] py-3 text-[#F5F0E6] overflow-hidden">
          <div className="animate-marquee whitespace-nowrap font-mono text-xs sm:text-sm font-bold uppercase tracking-widest">
            <span className="mx-6">FREE TIER</span>
            <span className="mx-6">• BUILT FOR DEVELOPERS</span>
            <span className="mx-6">• HANDS-FREE BROWSING</span>
            <span className="mx-6">• VOICE-CONTROLLED TABS</span>
            <span className="mx-6">• OPEN SOURCE</span>
            <span className="mx-6">• NOW ON MICROSOFT EDGE</span>
            <span className="mx-6">• FREE TIER</span>
            <span className="mx-6">• BUILT FOR DEVELOPERS</span>
            <span className="mx-6">• HANDS-FREE BROWSING</span>
            <span className="mx-6">• VOICE-CONTROLLED TABS</span>
            <span className="mx-6">• OPEN SOURCE</span>
            <span className="mx-6">• NOW ON MICROSOFT EDGE</span>
          </div>
        </div>

        {/* ================= 2. SPOTLIGHT SECTION ================= */}
        <section id="spotlight" className="border-b border-[#17160F] py-16 px-6 sm:px-10 lg:px-12 bg-[#F5F0E6] w-full">
          <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-12 items-center">
            {/* Black Container Box Mockup */}
            <div className="lg:col-span-6 bg-[#17160F] p-6 sm:p-8 rounded-2xl text-[#F5F0E6] space-y-4">
              <div className="bg-[#F5F0E6] text-[#17160F] p-5 rounded-xl space-y-4 max-w-sm mx-auto">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold border-b border-[#17160F]/10 pb-2">
                  <span>UrPilot</span>
                  <span>⚙</span>
                </div>
                <div className="flex flex-col items-center py-4 space-y-2">
                  <div className="h-16 w-16 rounded-full bg-[#EFB92E] border border-[#17160F] flex items-center justify-center animate-pulse">
                    <Mic size={24} className="text-[#17160F]" />
                  </div>
                  <div className="text-xs sm:text-sm font-mono italic text-slate-600">Listening...</div>
                </div>
              </div>

              <div className="bg-white text-[#17160F] p-3.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 max-w-sm mx-auto">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-ping" />
                <span>Picks up every command, mid-scroll or mid-meeting.</span>
              </div>
            </div>

            {/* Right Spotlight Specs */}
            <div className="lg:col-span-6 space-y-6">
              <span className="font-mono text-xs sm:text-sm font-bold uppercase text-[#5C594C]">§ 01 — SPOTLIGHT</span>
              <h2 className="font-sans text-3xl sm:text-5xl font-extrabold tracking-tight uppercase text-[#17160F] leading-tight">
                Built For Hands-Free Browsing.
              </h2>
              <p className="font-sans text-base sm:text-lg text-[#5C594C] leading-relaxed max-w-md">
                One continuous listening surface. No wake word, no menus. Speak naturally — UrPilot handles the tabs, the search, the reading.
              </p>

              <div className="font-mono text-xl font-black select-none text-[#17160F]">
                ~\/\|/\|/\|/\|/|
              </div>

              <Link
                href="/features/continuous-listening"
                className="inline-flex items-center gap-2 rounded-full border border-[#17160F] bg-white px-6 py-3 text-xs sm:text-sm font-bold uppercase hover:bg-[#17160F] hover:text-white transition-colors"
              >
                <span>See it in action</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ================= 3. LATEST RELEASES FROM THE LAB (DYNAMIC CARDS) ================= */}
        <section id="features" className="py-16 px-6 sm:px-10 lg:px-12 max-w-7xl mx-auto space-y-12 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="font-sans text-3xl sm:text-5xl font-extrabold tracking-tight uppercase text-[#17160F] leading-none">
              Latest Releases From The Lab
            </h2>
            <p className="text-xs sm:text-sm text-[#5C594C] max-w-xs leading-relaxed">
              Four features that make browsing feel like conversation. Click any card to launch its live interactive demo.
            </p>
          </div>

          {/* 4 Pastel Cards Grid with Dynamic Next.js Navigation */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Continuous Voice Listening */}
            <Link
              href="/features/continuous-listening"
              className="rounded-2xl border border-[#17160F]/15 bg-[#FDE8E8] p-6 flex flex-col justify-between space-y-6 hover:-translate-y-1.5 transition-all group"
            >
              <div className="space-y-4">
                <div className="h-36 rounded-xl bg-white border border-[#17160F]/10 p-3 flex flex-col items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-[#17160F] flex items-center justify-center text-[#EFB92E]">
                    <Mic size={20} />
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 mt-2 font-bold">continuous speech</div>
                </div>
                <h3 className="font-sans text-lg font-extrabold text-[#17160F] group-hover:underline">Continuous Voice Listening</h3>
                <p className="text-xs sm:text-sm text-[#5C594C] leading-relaxed">
                  Always ready, push-to-talk toggle. No wake word, no reset — just say what you need.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[#17160F]/10 pt-3.5 text-xs font-bold font-mono">
                <span>&gt; Try Live Demo</span>
                <span className="h-7 w-7 rounded-full border border-[#17160F] flex items-center justify-center group-hover:bg-[#17160F] group-hover:text-white transition-colors">↗</span>
              </div>
            </Link>

            {/* Card 2: Open My Stuff */}
            <Link
              href="/features/open-my-stuff"
              className="rounded-2xl border border-[#17160F]/15 bg-[#E6F0FA] p-6 flex flex-col justify-between space-y-6 hover:-translate-y-1.5 transition-all group"
            >
              <div className="space-y-4">
                <div className="h-36 rounded-xl bg-white border border-[#17160F]/10 p-3 space-y-2">
                  <div className="rounded border border-slate-200 px-2.5 py-1 text-xs font-mono flex justify-between"><span>Git-hub</span><span>&gt;</span></div>
                  <div className="rounded border border-slate-200 px-2.5 py-1 text-xs font-mono flex justify-between"><span>Linear</span><span>&gt;</span></div>
                  <div className="rounded border border-slate-200 px-2.5 py-1 text-xs font-mono flex justify-between"><span>Claude</span><span>&gt;</span></div>
                </div>
                <h3 className="font-sans text-lg font-extrabold text-[#17160F] group-hover:underline">Open My Stuff</h3>
                <p className="text-xs sm:text-sm text-[#5C594C] leading-relaxed">
                  Your saved tabs, launched in one phrase. Group by workflow, launch by voice.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[#17160F]/10 pt-3.5 text-xs font-bold font-mono">
                <span>&gt; Try Live Demo</span>
                <span className="h-7 w-7 rounded-full border border-[#17160F] flex items-center justify-center group-hover:bg-[#17160F] group-hover:text-white transition-colors">↗</span>
              </div>
            </Link>

            {/* Card 3: Voice Search */}
            <Link
              href="/features/voice-search"
              className="rounded-2xl border border-[#17160F]/15 bg-[#EFEFEF] p-6 flex flex-col justify-between space-y-6 hover:-translate-y-1.5 transition-all group"
            >
              <div className="space-y-4">
                <div className="h-36 rounded-xl bg-white border border-[#17160F]/10 p-3 flex items-center justify-center">
                  <div className="rounded-full border border-slate-300 px-3.5 py-1.5 font-mono text-xs text-slate-600 truncate max-w-full">
                    "react hydration mismatch..."
                  </div>
                </div>
                <h3 className="font-sans text-lg font-extrabold text-[#17160F] group-hover:underline">Voice Search & Auto-Navigate</h3>
                <p className="text-xs sm:text-sm text-[#5C594C] leading-relaxed">
                  Say it, land there. UrPilot searches, disambiguates, and opens the page for you.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[#17160F]/10 pt-3.5 text-xs font-bold font-mono">
                <span>&gt; Try Live Demo</span>
                <span className="h-7 w-7 rounded-full border border-[#17160F] flex items-center justify-center group-hover:bg-[#17160F] group-hover:text-white transition-colors">↗</span>
              </div>
            </Link>

            {/* Card 4: Summarize & Listen */}
            <Link
              href="/features/summarize-listen"
              className="rounded-2xl border border-[#17160F]/15 bg-[#FCE8F0] p-6 flex flex-col justify-between space-y-6 hover:-translate-y-1.5 transition-all group"
            >
              <div className="space-y-4">
                <div className="h-36 rounded-xl bg-white border border-[#17160F]/10 p-3 space-y-2">
                  <div className="text-xs font-bold font-mono">SUMMARY</div>
                  <div className="text-[10px] text-slate-500">3 key points, 42s read.</div>
                  <div className="rounded bg-slate-100 p-1.5 flex items-center gap-2">
                    <Play size={12} />
                    <div className="h-1 flex-1 bg-slate-300 rounded" />
                  </div>
                </div>
                <h3 className="font-sans text-lg font-extrabold text-[#17160F] group-hover:underline">Summarize & Listen</h3>
                <p className="text-xs sm:text-sm text-[#5C594C] leading-relaxed">
                  The page, read back to you. Key points, TTS playback, in the side panel.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[#17160F]/10 pt-3.5 text-xs font-bold font-mono">
                <span>&gt; Try Live Demo</span>
                <span className="h-7 w-7 rounded-full border border-[#17160F] flex items-center justify-center group-hover:bg-[#17160F] group-hover:text-white transition-colors">↗</span>
              </div>
            </Link>
          </div>

          <div className="pt-2">
            <Link
              href="/docs"
              className="inline-block rounded-full border border-[#17160F] bg-white px-7 py-3 text-xs sm:text-sm font-bold uppercase hover:bg-[#17160F] hover:text-white transition-colors"
            >
              View all features ↗
            </Link>
          </div>
        </section>

        {/* ================= 4. LOVED BY BUILDERS & BLACK CTA BANNER ================= */}
        <section className="py-16 px-6 sm:px-10 lg:px-12 max-w-7xl mx-auto space-y-10 w-full border-t border-[#17160F]/20">
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* LOVED BY BUILDERS HEADLINE */}
            <div className="lg:col-span-5 pt-2">
              <h2 className="font-sans text-5xl sm:text-6xl lg:text-[72px] font-extrabold tracking-tight uppercase text-[#17160F] leading-[0.92]">
                LOVED<br />
                BY<br />
                BUILDERS
              </h2>
            </div>

            {/* QUOTE CARD WITH PASTEL GRADIENT SQUARE & HANDWRITTEN COMING SOON */}
            <div className="lg:col-span-7 flex flex-col items-end space-y-4">
              <div className="w-full bg-[#E8E3DA] rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-7">
                {/* Gradient Box */}
                <div className="h-44 w-44 sm:h-48 sm:w-48 rounded-2xl bg-gradient-to-br from-[#F6D58D] via-[#E6A498] to-[#C86F68] flex-shrink-0" />
                
                {/* Text Content */}
                <div className="space-y-4 flex-1">
                  <p className="text-base sm:text-lg lg:text-xl text-[#17160F] font-medium leading-snug">
                    "Early access, real quotes coming soon — this space is reserved for actual users, not invented reviewers."
                  </p>
                  <span className="font-serif italic text-sm sm:text-base text-[#C1452B] block">
                    — coming soon
                  </span>
                </div>
              </div>

              {/* Navigation Arrows Directly Under Card */}
              <div className="flex gap-2.5 pr-2">
                <button className="h-10 w-10 rounded-full border border-[#17160F] flex items-center justify-center font-mono text-sm font-light hover:bg-[#17160F] hover:text-white transition-colors">
                  ←
                </button>
                <button className="h-10 w-10 rounded-full border border-[#17160F] flex items-center justify-center font-mono text-sm font-light hover:bg-[#17160F] hover:text-white transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Black CTA Banner Box */}
          <div className="bg-[#17160F] rounded-3xl p-8 sm:p-12 lg:p-14 text-[#F5F0E6] flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-lg">
              <div className="font-mono text-xs font-bold uppercase text-[#EFB92E] tracking-wider">GO HANDS-FREE TODAY</div>
              <h3 className="font-sans text-2xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-white leading-[1.05]">
                Install UrPilot, then never<br />
                touch<br />
                the tab bar again.
              </h3>
            </div>

            <div className="flex flex-col items-start md:items-end space-y-4">
              <div className="border border-white/20 bg-white text-[#17160F] p-3.5 rounded-xl rotate-2">
                <div className="font-mono text-[10px] font-bold uppercase">LAUNCH</div>
                <div className="font-sans text-xs sm:text-sm font-black">FREE FOREVER</div>
                <div className="font-serif italic text-xs text-red-600">new & live!</div>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#EFB92E] px-7 py-3.5 text-xs sm:text-sm font-extrabold uppercase text-[#17160F] hover:bg-white transition-colors"
                >
                  <span>Add to Chrome — Free</span>
                  <span>↗</span>
                </a>
                <a
                  href="https://microsoftedge.microsoft.com/addons/detail/urpilot/dckoojfpocofcagpgeppkkmgbkjielaa"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-xs sm:text-sm font-extrabold uppercase text-[#17160F] hover:bg-[#EFB92E] transition-colors"
                >
                  <span>Add to Edge — Free</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 5. DESIGNED AROUND THE COMMAND ================= */}
        <section className="py-16 px-6 sm:px-10 lg:px-12 max-w-7xl mx-auto space-y-14 w-full">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            {/* Left Column Text & Button */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-sans text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight text-[#17160F] leading-[1.02]">
                Designed Around<br />
                The Command.
              </h2>
              <p className="font-sans text-base sm:text-lg text-[#5C594C] leading-relaxed max-w-md">
                Every surface — hero, side panel, options — shares one flat visual system so context switches feel free.
              </p>

              <div className="font-mono text-2xl font-black select-none text-[#17160F]">
                ~\/\|/\|/\|/\|/|
              </div>

              <div className="pt-2">
                <Link
                  href="/docs"
                  className="inline-block rounded-full border border-[#17160F] bg-white px-7 py-3 text-xs sm:text-sm font-bold uppercase hover:bg-[#17160F] hover:text-white transition-colors"
                >
                  Read the docs ↗
                </Link>
              </div>
            </div>

            {/* Right Column: 3-Panel Split Frame */}
            <div className="lg:col-span-7 border border-[#17160F] rounded-2xl bg-[#EBE7DF] p-2.5 shadow-sm">
              <div className="grid grid-cols-3 divide-x divide-[#17160F]/30 bg-[#EBE7DF] rounded-xl overflow-hidden">
                {/* Panel 1 */}
                <div className="p-3 flex flex-col justify-between space-y-3">
                  <div className="h-14 bg-[#DCE6ED] rounded-xl w-full" />
                  <div className="bg-[#3D472A] text-white p-4 rounded-xl flex flex-col justify-between h-52 space-y-2">
                    <div>
                      <div className="font-serif italic text-xs text-[#F5D590]">Come try it with us</div>
                      <div className="font-sans text-sm font-bold text-white mt-1">Available Now</div>
                      <div className="text-[10px] text-white/80 mt-1 leading-snug">
                        Chrome & Edge Stores<br />1-click install · Free
                      </div>
                    </div>
                    <div className="h-7 w-7 rounded-full border border-white/40 flex items-center justify-center text-xs text-white">
                      ↗
                    </div>
                  </div>
                </div>

                {/* Panel 2 */}
                <div className="p-3 flex flex-col justify-between space-y-3">
                  <div className="h-14 bg-[#DCE6ED] rounded-xl w-full" />
                  <div className="h-52 flex flex-col justify-end p-2">
                    <div className="h-2 w-full rounded-full bg-slate-300/80" />
                  </div>
                </div>

                {/* Panel 3 */}
                <div className="p-3 flex flex-col justify-between space-y-3">
                  <div className="h-14 bg-[#DCE6ED] rounded-xl w-full" />
                  <div className="h-52 flex flex-col justify-end p-2">
                    <div className="h-2 w-full rounded-full bg-slate-300/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK LINKS TABLE */}
          <div className="grid gap-8 lg:grid-cols-12 pt-10 border-t border-[#17160F]/20">
            <div className="lg:col-span-4 space-y-3">
              <h2 className="font-sans text-4xl sm:text-5xl font-extrabold tracking-tight uppercase text-[#17160F] leading-[0.98]">
                QUICK<br />LINKS
              </h2>
              <div className="inline-block font-mono text-xs font-bold text-red-600">
                URPILOT LATEST <span className="italic">v0.9</span>
              </div>
            </div>

            <div className="lg:col-span-8 divide-y divide-[#17160F]/20">
              {[
                { label: 'DOCS', href: '/docs' },
                { label: 'EDGE ADD-ONS', href: 'https://microsoftedge.microsoft.com/addons/detail/urpilot/dckoojfpocofcagpgeppkkmgbkjielaa' },
                { label: 'GITHUB', href: 'https://github.com' },
                { label: 'CHANGELOG', href: '/docs' },
                { label: 'PRIVACY', href: '/docs' },
                { label: 'SUPPORT', href: '/docs' },
                { label: 'ROADMAP', href: '/docs' },
              ].map((link, idx) => {
                const isExternal = link.href.startsWith('http');
                return (
                  <Link
                    key={idx}
                    href={link.href}
                    {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className="py-4 flex items-center justify-between font-mono text-sm sm:text-base font-extrabold tracking-wider uppercase hover:pl-2 transition-all"
                  >
                    <span>{link.label}</span>
                    <span className="h-7 w-7 rounded-full border border-[#17160F] flex items-center justify-center text-xs">
                      ↗
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= 6. DARK EDITORIAL FOOTER ================= */}
        <footer className="border-t-2 border-[#17160F] bg-[#17160F] p-8 sm:p-12 lg:p-14 text-[#F5F0E6] space-y-12 w-full">
          <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-12">
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3 font-sans text-xl font-black tracking-wide text-white">
                <UrPilotLogo className="h-7 w-7 text-white" />
                <span>URPILOT</span>
              </div>
              <p className="text-xs sm:text-sm text-[#F5F0E6]/70 leading-relaxed max-w-sm">
                Voice-controlled browsing for people who never touch the keyboard. Free. Open source. Built solo, shipped everywhere.
              </p>
              <div className="flex gap-2.5 pt-2">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-[#17160F] transition-colors">
                  <Github size={16} />
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-[#17160F] transition-colors">
                  <Twitter size={16} />
                </a>
              </div>
            </div>

            <div className="md:col-span-3 space-y-3 text-xs sm:text-sm">
              <div className="font-mono text-xs font-bold tracking-widest text-[#EFB92E] uppercase">PRODUCT</div>
              <ul className="space-y-2 text-[#F5F0E6]/80 font-medium">
                <li><Link href="#features" className="hover:underline">Features</Link></li>
                <li><Link href="/docs" className="hover:underline">Docs</Link></li>
                <li><Link href="/docs" className="hover:underline">Changelog</Link></li>
                <li><Link href="/docs" className="hover:underline">Roadmap</Link></li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3 text-xs sm:text-sm">
              <div className="font-mono text-xs font-bold tracking-widest text-[#EFB92E] uppercase">CONTACT</div>
              <ul className="space-y-2 text-[#F5F0E6]/80 font-medium">
                <li className="font-mono">hello@urpilot.dev</li>
                <li><Link href="/docs" className="hover:underline">Privacy</Link></li>
                <li><Link href="/docs" className="hover:underline">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm font-mono text-[#F5F0E6]/60">
            <div>© 2026 UrPilot. Made solo. Shipped everywhere.</div>
            <div className="text-[#EFB92E] font-semibold">v0.1 • hello@urpilot.dev</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
