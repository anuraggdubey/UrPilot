'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Mic, ExternalLink, Sparkles, Navigation } from 'lucide-react';

function UrPilotLogo({ className = "h-6 w-6 text-[#17160F]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20L12 4L20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6.5" y1="14" x2="17.5" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function VoiceSearchPage() {
  const [query, setQuery] = useState('React 19 Server Actions quickstart');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    query: string;
    summary: string;
    links: Array<{ title: string; snippet: string; url: string }>;
  } | null>({
    query: 'React 19 Server Actions quickstart',
    summary: 'React 19 introduces async Server Actions natively. Use "use server" at top of async functions to execute backend operations directly from form submissions.',
    links: [
      { title: 'React 19 Actions Docs', snippet: 'Full guide to using async transitions and Server Actions in React 19.', url: 'https://react.dev/reference/rsc/server-actions' },
      { title: 'Next.js 15 Server Actions Guide', snippet: 'How to mutate data using Server Actions in Next.js App Router.', url: 'https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions' },
    ],
  });

  const handleRunSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setSearchResults({
        query,
        summary: `UrPilot Tavily LLM synthesized results for "${query}". Found 3 high-confidence documentation pages with instant auto-navigation capability.`,
        links: [
          { title: `${query} — Official Docs`, snippet: `Comprehensive documentation and API reference for ${query}.`, url: `https://google.com/search?q=${encodeURIComponent(query)}` },
          { title: `Getting Started with ${query}`, snippet: `Step-by-step setup tutorial, code snippets, and best practices.`, url: `https://github.com/search?q=${encodeURIComponent(query)}` },
        ],
      });
    }, 1000);
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
            FEATURE 03
          </div>
          <h1 className="font-sans text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-[#17160F]">
            Voice Search & Auto-Navigate
          </h1>
          <p className="text-base sm:text-lg text-[#5C594C] max-w-2xl leading-relaxed">
            Speak your target topic naturally. UrPilot executes Tavily real-time web search, synthesizes key answers, and auto-opens the top match.
          </p>
        </div>

        {/* Live Search Console Bar */}
        <div className="border-2 border-[#17160F] bg-white rounded-3xl p-6 shadow-[6px_6px_0_0_#17160F] space-y-6">
          <form onSubmit={handleRunSearch} className="flex gap-2">
            <div className="flex-1 flex items-center gap-3 border border-[#17160F]/30 bg-[#F5F0E6] px-4 py-3 rounded-2xl">
              <Search size={18} className="text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Speak or type a search query..."
                className="w-full bg-transparent font-mono text-sm font-semibold text-[#17160F] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="rounded-2xl border border-[#17160F] bg-[#EFB92E] px-6 py-3 font-sans text-xs font-extrabold text-[#17160F] hover:bg-[#17160F] hover:text-white transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Quick Voice Triggers */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="text-slate-400 font-bold">Try voice query:</span>
            {['Stellar Soroban CLI quickstart', 'Tailwind v4 upgrade guide', 'Next.js 15 App Router middleware'].map((sample, i) => (
              <button
                key={i}
                onClick={() => { setQuery(sample); handleRunSearch(); }}
                className="border border-[#17160F]/20 bg-[#F5F0E6] px-3 py-1 rounded-full hover:bg-[#EFB92E] transition-colors"
              >
                "{sample}"
              </button>
            ))}
          </div>

          {/* Search Result Cards */}
          {searchResults && (
            <div className="border-t border-[#17160F]/15 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500">
                  <Sparkles size={14} className="text-[#EFB92E]" />
                  Tavily AI Synthesis Result
                </div>
                <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                  <Navigation size={12} /> Auto-Navigate Active
                </div>
              </div>

              <div className="bg-[#F5F0E6] border border-[#17160F]/15 rounded-2xl p-4 text-xs font-sans text-[#17160F] leading-relaxed">
                {searchResults.summary}
              </div>

              <div className="space-y-2">
                {searchResults.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between border border-[#17160F]/15 bg-white p-3.5 rounded-xl hover:border-[#17160F] transition-all group"
                  >
                    <div className="space-y-0.5">
                      <div className="font-sans text-sm font-bold text-[#17160F] group-hover:underline flex items-center gap-1.5">
                        {link.title}
                        {idx === 0 && <span className="text-[9px] font-mono bg-[#EFB92E] px-1.5 py-0.2 rounded">TOP MATCH</span>}
                      </div>
                      <div className="font-mono text-xs text-slate-500">{link.snippet}</div>
                    </div>
                    <ExternalLink size={16} className="text-slate-400 group-hover:text-[#17160F]" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
