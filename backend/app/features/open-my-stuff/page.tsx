'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Plus, Trash2, Layers, CheckCircle2, Play } from 'lucide-react';

function UrPilotLogo({ className = "h-6 w-6 text-[#17160F]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20L12 4L20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6.5" y1="14" x2="17.5" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function OpenMyStuffPage() {
  const [stacks, setStacks] = useState([
    {
      id: 'dev',
      name: 'Dev Stack',
      phrase: 'open my dev stack',
      links: [
        { title: 'GitHub', url: 'https://github.com' },
        { title: 'Linear', url: 'https://linear.app' },
        { title: 'Claude AI', url: 'https://claude.ai' },
      ],
    },
    {
      id: 'social',
      name: 'Social Stack',
      phrase: 'open my social stack',
      links: [
        { title: 'Twitter / X', url: 'https://x.com' },
        { title: 'YouTube', url: 'https://youtube.com' },
      ],
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [activeStackId, setActiveStackId] = useState('dev');
  const [launchMessage, setLaunchMessage] = useState('');

  const activeStack = stacks.find((s) => s.id === activeStackId) || stacks[0];

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;
    setStacks((prev) =>
      prev.map((s) =>
        s.id === activeStackId
          ? { ...s, links: [...s.links, { title: newTitle, url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}` }] }
          : s
      )
    );
    setNewTitle('');
    setNewUrl('');
  };

  const handleDeleteLink = (index: number) => {
    setStacks((prev) =>
      prev.map((s) =>
        s.id === activeStackId ? { ...s, links: s.links.filter((_, i) => i !== index) } : s
      )
    );
  };

  const handleSimulateLaunch = (stackName: string, phrase: string) => {
    setLaunchMessage(`Triggered phrase "${phrase}" → Opening ${activeStack.links.length} tabs...`);
    setTimeout(() => {
      setLaunchMessage(`Successfully opened ${stackName}!`);
    }, 1200);
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
            FEATURE 02
          </div>
          <h1 className="font-sans text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-[#17160F]">
            Open My Stuff
          </h1>
          <p className="text-base sm:text-lg text-[#5C594C] max-w-2xl leading-relaxed">
            Organize your favorite web app tabs into workflow stacks. Launch 3, 5, or 10 tabs simultaneously with a single voice command.
          </p>
        </div>

        {/* Stack Selector Tabs */}
        <div className="flex gap-3 border-b border-[#17160F]/20 pb-2 overflow-x-auto">
          {stacks.map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStackId(st.id)}
              className={`px-5 py-2.5 rounded-full font-mono text-xs font-bold transition-all border border-[#17160F] ${
                activeStackId === st.id ? 'bg-[#17160F] text-[#F5F0E6]' : 'bg-white text-[#17160F] hover:bg-[#EFB92E]'
              }`}
            >
              {st.name} ({st.links.length})
            </button>
          ))}
        </div>

        {/* Main Stack Manager Layout */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Saved Tab Stack Box */}
          <div className="lg:col-span-7 border-2 border-[#17160F] bg-white rounded-3xl p-6 shadow-[6px_6px_0_0_#17160F] space-y-6">
            <div className="flex items-center justify-between border-b border-[#17160F]/15 pb-4">
              <div>
                <h2 className="font-sans text-xl font-extrabold text-[#17160F]">{activeStack.name}</h2>
                <div className="font-mono text-xs text-[#5C594C]">Voice Phrase: "{activeStack.phrase}"</div>
              </div>
              <button
                onClick={() => handleSimulateLaunch(activeStack.name, activeStack.phrase)}
                className="inline-flex items-center gap-2 rounded-full border border-[#17160F] bg-[#EFB92E] px-4 py-2 text-xs font-bold text-[#17160F] hover:bg-[#17160F] hover:text-white transition-colors"
              >
                <Play size={14} />
                <span>Simulate Launch</span>
              </button>
            </div>

            {launchMessage && (
              <div className="border border-green-600 bg-green-50 text-green-900 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold animate-fadeIn">
                ✓ {launchMessage}
              </div>
            )}

            <div className="space-y-3">
              {activeStack.links.map((link, idx) => (
                <div key={idx} className="flex items-center justify-between border border-[#17160F]/15 bg-[#F5F0E6] p-3.5 rounded-xl">
                  <div className="space-y-0.5">
                    <div className="font-sans text-sm font-bold text-[#17160F]">{link.title}</div>
                    <div className="font-mono text-xs text-slate-500">{link.url}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={link.url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-black/5 rounded">
                      <ExternalLink size={16} />
                    </a>
                    <button onClick={() => handleDeleteLink(idx)} className="p-1.5 hover:bg-red-100 text-red-600 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New URL Form */}
            <form onSubmit={handleAddLink} className="pt-4 border-t border-[#17160F]/15 space-y-3">
              <div className="font-mono text-xs font-bold uppercase text-slate-500">Add Link To Stack:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Title (e.g. Figma)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border border-[#17160F]/30 bg-slate-50 px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-[#17160F]"
                />
                <input
                  type="text"
                  placeholder="URL (e.g. figma.com)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="border border-[#17160F]/30 bg-slate-50 px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-[#17160F]"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#17160F] bg-[#17160F] py-2 text-xs font-bold text-[#F5F0E6] hover:bg-[#EFB92E] hover:text-[#17160F] transition-colors"
              >
                <Plus size={14} />
                <span>Add URL to Stack</span>
              </button>
            </form>
          </div>

          {/* Sync & How It Works Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#17160F]/20 bg-[#E8E3DA] rounded-3xl p-6 space-y-4">
              <div className="font-mono text-xs font-extrabold uppercase text-[#17160F]">How Extension Sync Works</div>
              <p className="text-xs text-[#5C594C] leading-relaxed">
                Stacks saved here automatically sync with your Chrome Extension options via <code className="font-mono bg-white px-1 py-0.5 rounded">chrome.storage.sync</code>.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-green-800"><CheckCircle2 size={14} /> Encrypted Chrome Sync Storage</div>
                <div className="flex items-center gap-2 text-green-800"><CheckCircle2 size={14} /> Unlimited Saved Stacks</div>
                <div className="flex items-center gap-2 text-green-800"><CheckCircle2 size={14} /> Custom Voice Triggers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
