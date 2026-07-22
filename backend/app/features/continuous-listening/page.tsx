'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mic, MicOff, ArrowLeft, Volume2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

function UrPilotLogo({ className = "h-6 w-6 text-[#17160F]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20L12 4L20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6.5" y1="14" x2="17.5" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function ContinuousListeningPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commandHistory, setCommandHistory] = useState<Array<{ text: string; action: string; time: string }>>([
    { text: 'open my dev tabs', action: 'Opened GitHub, Linear, Claude', time: '10:42 AM' },
    { text: 'summarize active page', action: 'Generated 3 key points', time: '10:44 AM' },
  ]);
  const [volumeLevel, setVolumeLevel] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setVolumeLevel(Math.floor(Math.random() * 85) + 15);
      }, 150);
    } else {
      setVolumeLevel(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const handleSimulateSpeech = (phrase: string, action: string) => {
    setTranscript(phrase);
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setCommandHistory((prev) => [
        { text: phrase, action, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev,
      ]);
    }, 1500);
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

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-block border border-[#17160F] bg-white px-3 py-1 text-xs font-mono font-bold uppercase shadow-sm">
            FEATURE 01
          </div>
          <h1 className="font-sans text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-[#17160F]">
            Continuous Voice Listening
          </h1>
          <p className="text-base sm:text-lg text-[#5C594C] max-w-2xl leading-relaxed">
            One continuous listening surface. No wake words, no setup resets. Click once to activate, speak naturally at any point during your workflow.
          </p>
        </div>

        {/* Live Interactive Microphone Visualizer Box */}
        <div className="border-2 border-[#17160F] bg-white rounded-3xl p-8 shadow-[6px_6px_0_0_#17160F] space-y-6">
          <div className="flex items-center justify-between border-b border-[#17160F]/15 pb-4">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
              <span className="font-mono text-xs font-extrabold uppercase">
                {isListening ? '● LIVE LISTENING ACTIVE' : 'READY TO LISTEN'}
              </span>
            </div>
            <div className="font-mono text-xs text-slate-500">Web Speech Engine v2</div>
          </div>

          <div className="flex flex-col items-center justify-center py-10 space-y-6">
            <div className="relative flex items-center justify-center">
              {isListening && (
                <div
                  className="absolute rounded-full bg-[#EFB92E]/40 transition-all duration-150"
                  style={{ width: `${100 + volumeLevel}px`, height: `${100 + volumeLevel}px` }}
                />
              )}
              <button
                onClick={() => setIsListening(!isListening)}
                className={`relative h-24 w-24 rounded-full border-2 border-[#17160F] flex items-center justify-center transition-all shadow-md ${
                  isListening ? 'bg-red-500 text-white' : 'bg-[#EFB92E] text-[#17160F] hover:scale-105'
                }`}
              >
                {isListening ? <MicOff size={36} /> : <Mic size={36} />}
              </button>
            </div>

            <div className="text-center space-y-2 max-w-md">
              <div className="font-mono text-xs uppercase font-bold text-slate-500">
                {isListening ? 'Listening for speech...' : 'Click mic to start continuous mode'}
              </div>
              {transcript && (
                <div className="border border-[#17160F]/20 bg-[#F5F0E6] px-4 py-2 rounded-xl font-mono text-sm font-semibold text-[#17160F]">
                  "{transcript}"
                </div>
              )}
            </div>
          </div>

          {/* Quick Voice Command Triggers */}
          <div className="border-t border-[#17160F]/15 pt-6 space-y-3">
            <div className="font-mono text-xs font-bold uppercase text-slate-500">Try these sample voice triggers:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSimulateSpeech('open my dev stack', 'Opened GitHub, Linear, Claude')}
                className="rounded-full border border-[#17160F] bg-[#F5F0E6] px-4 py-2 text-xs font-bold hover:bg-[#EFB92E] transition-colors"
              >
                "Open my dev stack" ↗
              </button>
              <button
                onClick={() => handleSimulateSpeech('summarize this page', 'Generated 3 key points')}
                className="rounded-full border border-[#17160F] bg-[#F5F0E6] px-4 py-2 text-xs font-bold hover:bg-[#EFB92E] transition-colors"
              >
                "Summarize this page" ↗
              </button>
              <button
                onClick={() => handleSimulateSpeech('search React 19 features', 'Searched & Opened top result')}
                className="rounded-full border border-[#17160F] bg-[#F5F0E6] px-4 py-2 text-xs font-bold hover:bg-[#EFB92E] transition-colors"
              >
                "Search React 19 features" ↗
              </button>
            </div>
          </div>
        </div>

        {/* Recognized Command Log */}
        <div className="border border-[#17160F]/20 bg-[#E8E3DA] rounded-2xl p-6 space-y-4">
          <div className="font-mono text-xs font-extrabold uppercase text-[#17160F]">Executed Command Feed</div>
          <div className="divide-y divide-[#17160F]/15">
            {commandHistory.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between font-mono text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#17160F]">"{item.text}"</div>
                  <div className="text-[#5C594C]">{item.action}</div>
                </div>
                <div className="text-slate-400 text-[10px]">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
