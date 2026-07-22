'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, Square, Volume2, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

function UrPilotLogo({ className = "h-6 w-6 text-[#17160F]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20L12 4L20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6.5" y1="14" x2="17.5" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function SummarizeListenPage() {
  const [targetUrl, setTargetUrl] = useState('https://soroban.dev/docs/quickstart');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [summaryData, setSummaryData] = useState<{
    title: string;
    readTime: string;
    overview: string;
    bulletPoints: string[];
  }>({
    title: 'Soroban Smart Contracts Quickstart',
    readTime: '42s audio read',
    overview: 'Soroban is a Rust-based, WebAssembly (Wasm) smart contract platform built for Stellar. It features low transaction costs, built-in battery packs for state archival, and local testnet simulation tools.',
    bulletPoints: [
      'Install CLI tool via cargo install soroban-cli',
      'Deploy smart contracts directly to Stellar Testnet in < 2 seconds',
      'SDK supports Rust contract logic with auto-generated TypeScript bindings',
    ],
  });

  const handleSpeakSummary = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const textToRead = `${summaryData.title}. ${summaryData.overview}. ${summaryData.bulletPoints.join('. ')}`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = speechRate;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } else {
      alert('Speech synthesis is simulated in your browser.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] text-[#17160F] font-sans antialiased selection:bg-[#EFB92E] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
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

        {/* Page Hero */}
        <div className="space-y-4">
          <div className="inline-block border border-[#17160F] bg-white px-3 py-1 text-xs font-mono font-bold uppercase shadow-sm">
            FEATURE 04
          </div>
          <h1 className="font-sans text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-[#17160F]">
            Summarize & Listen
          </h1>
          <p className="text-base sm:text-lg text-[#5C594C] max-w-2xl leading-relaxed">
            Extract executive summaries from long articles, documentation pages, or pull requests — then listen back with text-to-speech audio playback.
          </p>
        </div>

        {/* Live Audio Reader Console */}
        <div className="border-2 border-[#17160F] bg-white rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0_0_#17160F] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#17160F]/15 pb-4 gap-4">
            <div className="space-y-1">
              <span className="font-mono text-xs text-slate-500 uppercase font-bold">Target Web Page</span>
              <div className="font-mono text-sm font-bold text-[#17160F] truncate">{targetUrl}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-mono text-xs font-bold bg-[#F5F0E6] border border-[#17160F]/20 px-3 py-1.5 rounded-full">
                {summaryData.readTime}
              </div>
              <button
                onClick={handleSpeakSummary}
                className="inline-flex items-center gap-2 rounded-full border border-[#17160F] bg-[#EFB92E] px-5 py-2 text-xs font-extrabold text-[#17160F] hover:bg-[#17160F] hover:text-white transition-colors"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause Audio' : 'Listen Now'}</span>
              </button>
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center justify-between bg-[#F5F0E6] p-3 rounded-2xl border border-[#17160F]/15">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#17160F]">
              <Volume2 size={16} />
              <span>TTS Playback Speed:</span>
            </div>
            <div className="flex gap-1.5 font-mono text-xs">
              {[1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setSpeechRate(rate)}
                  className={`px-3 py-1 rounded-lg border border-[#17160F]/20 transition-colors ${
                    speechRate === rate ? 'bg-[#17160F] text-white font-bold' : 'bg-white text-[#17160F] hover:bg-slate-100'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* AI Executive Summary Card */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#17160F]">
              <Sparkles size={14} className="text-[#EFB92E]" />
              Executive AI Summary
            </div>
            <div className="bg-[#F5F0E6] p-4 rounded-2xl border border-[#17160F]/15 text-sm leading-relaxed text-[#17160F] font-sans">
              {summaryData.overview}
            </div>

            <div className="space-y-2 pt-2">
              <div className="font-mono text-xs font-bold uppercase text-slate-500">Key Takeaways:</div>
              {summaryData.bulletPoints.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#17160F]/10 text-xs font-sans font-medium text-[#17160F]">
                  <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
