import React, { useState, useEffect } from 'react';
import {
  Braces,
  KeyRound,
  Regex,
  Fingerprint,
  Wrench,
  Search,
  Flame,
  Github,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import JsonFormatter from './tools/JsonFormatter';
import JwtDecoder from './tools/JwtDecoder';
import RegexTester from './tools/RegexTester';
import CryptoSuite from './tools/CryptoSuite';

const TOOLS = [
  {
    id: 'json',
    name: 'JSON Formatter & Validator',
    shortName: 'JSON Formatter',
    badge: 'RFC 8259',
    description:
      'Pretty-print, minify, sort keys alphabetically, and inspect object depth and byte size.',
    icon: Braces,
    shortcut: '1',
    component: JsonFormatter,
  },
  {
    id: 'jwt',
    name: 'JWT Token Inspector',
    shortName: 'JWT Inspector',
    badge: 'OAuth2 / OIDC',
    description:
      'Decode Base64URL JWT headers and payloads client-side with live expiration checks.',
    icon: KeyRound,
    shortcut: '2',
    component: JwtDecoder,
  },
  {
    id: 'regex',
    name: 'Live Regex Workbench',
    shortName: 'Regex Workbench',
    badge: 'ECMAScript',
    description:
      'Test regular expressions in real time with inline highlighting and capture group extraction.',
    icon: Regex,
    shortcut: '3',
    component: RegexTester,
  },
  {
    id: 'crypto',
    name: 'Crypto, UUID & Encoders',
    shortName: 'Crypto & UUID',
    badge: 'WebCrypto API',
    description:
      'Generate bulk UUID v4 tokens, high-entropy CSPRNG secrets, and Base64 / URL encodings.',
    icon: Fingerprint,
    shortcut: '4',
    component: CryptoSuite,
  },
];

const UPCOMING_STREAK_IDEAS = [
  { day: 'Day 2', title: 'Cron Expression Explainer', tag: 'feat(tools): add cron schedule parser' },
  { day: 'Day 3', title: 'CSS Color Palette Converter', tag: 'feat(tools): add HEX/RGB/HSL converter' },
  { day: 'Day 4', title: 'Side-by-Side JSON Diff Viewer', tag: 'feat(tools): add diff comparison tool' },
  { day: 'Day 5', title: 'cURL to Fetch/Axios Generator', tag: 'feat(tools): add HTTP snippet generator' },
];

export default function App() {
  const [activeToolId, setActiveToolId] = useState('json');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastAction, setLastAction] = useState('Ready — 100% client-side execution');

  const activeTool = TOOLS.find((t) => t.id === activeToolId) || TOOLS[0];
  const ActiveComponent = activeTool.component;

  const filteredTools = TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const idx = Number(e.key) - 1;
        if (TOOLS[idx]) setActiveToolId(TOOLS[idx].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">
                  DevSwissKnife
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Privacy-First Developer Utilities Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero-Server Local Execution</span>
            </div>

            <a
              href="https://github.com/Jayasri7-ux"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition"
            >
              <Github className="w-4 h-4" />
              <span>@Jayasri7-ux</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-5">
          {/* Tool Filter */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tools..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Navigation List */}
          <nav className="space-y-1.5">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = tool.id === activeToolId;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveToolId(tool.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/15 text-white border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{tool.shortName}</div>
                      <div className="text-[11px] text-slate-500">{tool.badge}</div>
                    </div>
                  </div>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-900 text-slate-400 border border-slate-800">
                    Alt+{tool.shortcut}
                  </kbd>
                </button>
              );
            })}
          </nav>

          {/* Daily Streak Builder Card */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Flame className="w-4 h-4" />
              <span>GitHub Streak Roadmap</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add 1 mini-tool each day and push a clean commit to grow your green contribution graph:
            </p>
            <div className="space-y-2">
              {UPCOMING_STREAK_IDEAS.map((item) => (
                <div
                  key={item.day}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center justify-between font-medium text-slate-200">
                    <span>{item.title}</span>
                    <span className="text-[10px] font-mono text-indigo-400">{item.day}</span>
                  </div>
                  <code className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    {item.tag}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Active Tool Workspace */}
        <main className="lg:col-span-9 space-y-5">
          {/* Tool Header Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-white">{activeTool.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-indigo-300 border border-slate-700">
                  {activeTool.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400">{activeTool.description}</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{lastAction}</span>
            </div>
          </div>

          {/* Active Tool Component */}
          <ActiveComponent onToolAction={setLastAction} />
        </main>
      </div>
    </div>
  );
}
