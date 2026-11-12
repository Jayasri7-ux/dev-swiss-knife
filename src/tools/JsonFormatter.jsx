import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  Minimize2,
  ArrowDownAZ,
  Trash2,
  Download,
  FileJson,
} from 'lucide-react';

const SAMPLE_JSON = {
  service: 'DevSwissKnife API Gateway',
  version: '2.4.0',
  environment: 'production',
  region: 'ap-south-1',
  healthy: true,
  latencyMs: 18.4,
  features: ['json-formatter', 'jwt-inspector', 'regex-workbench', 'crypto-suite'],
  rateLimit: {
    requestsPerMinute: 1200,
    burstCapacity: 250,
    retryAfterSeconds: 30,
  },
  maintainer: {
    username: 'Jayasri7-ux',
    role: 'Full-Stack Developer',
  },
};

function sortObjectKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObjectKeys(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

function analyzeJson(obj) {
  let keys = 0;
  let maxDepth = 0;

  function traverse(node, depth) {
    if (depth > maxDepth) maxDepth = depth;
    if (Array.isArray(node)) {
      node.forEach((item) => traverse(item, depth + 1));
    } else if (node !== null && typeof node === 'object') {
      const k = Object.keys(node);
      keys += k.length;
      k.forEach((key) => traverse(node[key], depth + 1));
    }
  }

  traverse(obj, 0);
  return { keys, maxDepth };
}

export default function JsonFormatter({ onToolAction }) {
  const [input, setInput] = useState(() => JSON.stringify(SAMPLE_JSON, null, 2));
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [copied, setCopied] = useState(false);

  const parsedResult = useMemo(() => {
    if (!input.trim()) {
      return { valid: false, empty: true, output: '', error: null, stats: null };
    }
    try {
      const parsed = JSON.parse(input);
      const processed = sortKeys ? sortObjectKeys(parsed) : parsed;
      const formatted =
        indent === 0
          ? JSON.stringify(processed)
          : JSON.stringify(processed, null, indent);
      const { keys, maxDepth } = analyzeJson(processed);
      const sizeBytes = new Blob([formatted]).size;

      return {
        valid: true,
        empty: false,
        output: formatted,
        error: null,
        stats: {
          keys,
          maxDepth,
          sizeBytes,
          lines: formatted.split('\n').length,
        },
      };
    } catch (err) {
      return {
        valid: false,
        empty: false,
        output: '',
        error: err.message,
        stats: null,
      };
    }
  }, [input, indent, sortKeys]);

  const handleCopy = async () => {
    if (!parsedResult.valid) return;
    await navigator.clipboard.writeText(parsedResult.output);
    setCopied(true);
    onToolAction?.('Copied formatted JSON');
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    if (!parsedResult.valid) return;
    const blob = new Blob([parsedResult.output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted-data.json';
    a.click();
    URL.revokeObjectURL(url);
    onToolAction?.('Downloaded formatted-data.json');
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIndent(2)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              indent === 2
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
            2 Spaces
          </button>
          <button
            onClick={() => setIndent(4)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              indent === 4
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            4 Spaces
          </button>
          <button
            onClick={() => setIndent(0)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              indent === 0
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Minimize2 className="w-3.5 h-3.5 inline mr-1.5" />
            Minify
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={() => setSortKeys((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              sortKeys
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-transparent'
            }`}
          >
            <ArrowDownAZ className="w-3.5 h-3.5 inline mr-1.5" />
            Sort Keys {sortKeys ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInput(JSON.stringify(SAMPLE_JSON, null, 2))}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 inline mr-1.5" />
            Sample
          </button>
          <button
            onClick={() => setInput('')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-rose-300 hover:bg-rose-950/50 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 inline mr-1" />
            Clear
          </button>
        </div>
      </div>

      {/* Status & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border bg-slate-900/60 border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          {parsedResult.empty ? (
            <span className="text-slate-400">Paste or type JSON payload to validate...</span>
          ) : parsedResult.valid ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Valid RFC 8259 JSON
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
              <AlertTriangle className="w-4 h-4" />
              Syntax Error: {parsedResult.error}
            </span>
          )}
        </div>

        {parsedResult.stats && (
          <div className="flex items-center gap-4 text-slate-400 font-mono">
            <span>
              Keys: <strong className="text-slate-200">{parsedResult.stats.keys}</strong>
            </span>
            <span>
              Max Depth: <strong className="text-slate-200">{parsedResult.stats.maxDepth}</strong>
            </span>
            <span>
              Lines: <strong className="text-slate-200">{parsedResult.stats.lines}</strong>
            </span>
            <span>
              Size: <strong className="text-slate-200">{parsedResult.stats.sizeBytes} B</strong>
            </span>
          </div>
        )}
      </div>

      {/* Dual Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Raw JSON Input
            </span>
            <span className="text-xs text-slate-500 font-mono">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw or minified JSON here..."
            spellCheck={false}
            className="w-full h-[420px] p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Formatted Output
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!parsedResult.valid}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Save .json
              </button>
              <button
                onClick={handleCopy}
                disabled={!parsedResult.valid}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {parsedResult.valid ? (
            <pre className="w-full h-[420px] p-4 overflow-auto text-emerald-300 font-mono text-xs leading-relaxed">
              {parsedResult.output}
            </pre>
          ) : (
            <div className="w-full h-[420px] p-6 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="w-9 h-9 text-rose-400/80 mb-3" />
              <p className="text-sm font-medium text-slate-200 mb-1">
                {parsedResult.empty ? 'Waiting for JSON input' : 'Unable to parse JSON'}
              </p>
              {parsedResult.error && (
                <code className="mt-2 px-3 py-2 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-mono max-w-md">
                  {parsedResult.error}
                </code>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
