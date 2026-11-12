import React, { useState, useMemo } from 'react';
import { Regex, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

const REGEX_PRESETS = [
  {
    name: 'Email Address',
    pattern: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
    flags: 'gm',
    sample:
      'Contact support@devswissknife.dev or engineering.lead+alerts@github.com for API access.',
  },
  {
    name: 'HTTPS URLs',
    pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)',
    flags: 'gi',
    sample:
      'Docs hosted at https://vitejs.dev/guide/ and repo at https://github.com/Jayasri7-ux/dev-swiss-knife',
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b',
    flags: 'g',
    sample:
      'Gateway nodes: 192.168.1.104, 10.240.0.12, and invalid node 999.12.0.1 in cluster.',
  },
  {
    name: 'Hex Colors',
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    flags: 'gi',
    sample: 'Theme palette: primary #6366F1, accent #10B981, surface #0F172A, short #fff.',
  },
];

export default function RegexTester({ onToolAction }) {
  const [pattern, setPattern] = useState(REGEX_PRESETS[0].pattern);
  const [flags, setFlags] = useState(REGEX_PRESETS[0].flags);
  const [testText, setTestText] = useState(REGEX_PRESETS[0].sample);

  const toggleFlag = (f) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, '') : prev + f));
  };

  const evaluation = useMemo(() => {
    if (!pattern) {
      return { valid: true, matches: [], segments: [{ text: testText, isMatch: false }] };
    }
    try {
      const safeFlags = flags.includes('g') ? flags : flags + 'g';
      const regex = new RegExp(pattern, safeFlags);
      const matches = [];
      const segments = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(testText)) !== null) {
        if (match.index > lastIndex) {
          segments.push({
            text: testText.slice(lastIndex, match.index),
            isMatch: false,
          });
        }
        segments.push({
          text: match[0],
          isMatch: true,
          matchIndex: matches.length + 1,
        });
        matches.push({
          fullMatch: match[0],
          index: match.index,
          groups: match.slice(1),
        });
        lastIndex = match.index + match[0].length;
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }

      if (lastIndex < testText.length) {
        segments.push({
          text: testText.slice(lastIndex),
          isMatch: false,
        });
      }

      return { valid: true, matches, segments, error: null };
    } catch (err) {
      return {
        valid: false,
        matches: [],
        segments: [{ text: testText, isMatch: false }],
        error: err.message,
      };
    }
  }, [pattern, flags, testText]);

  return (
    <div className="space-y-5">
      {/* Presets Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="font-medium text-slate-300">Quick Pattern Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {REGEX_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setPattern(preset.pattern);
                setFlags(preset.flags);
                setTestText(preset.sample);
                onToolAction?.(`Loaded regex preset: ${preset.name}`);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Regex Pattern + Flags Input */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 focus-within:border-indigo-500">
            <span className="text-slate-500 font-mono text-sm select-none mr-1">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regular expression pattern..."
              spellCheck={false}
              className="w-full bg-transparent font-mono text-xs text-amber-300 focus:outline-none"
            />
            <span className="text-slate-500 font-mono text-sm select-none ml-1">/{flags}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {['g', 'i', 'm', 's'].map((flag) => (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                title={`Toggle '${flag}' flag`}
                className={`w-9 h-9 rounded-lg font-mono text-xs font-semibold transition cursor-pointer ${
                  flags.includes(flag)
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between text-xs">
          {evaluation.valid ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Valid RegExp — <strong>{evaluation.matches.length}</strong> match
              {evaluation.matches.length === 1 ? '' : 'es'} found
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-rose-400">
              <AlertCircle className="w-4 h-4" />
              {evaluation.error}
            </span>
          )}
        </div>
      </div>

      {/* Test String & Highlighted Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Test Target String
          </div>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={7}
            spellCheck={false}
            className="w-full p-4 bg-transparent font-mono text-xs text-slate-200 leading-relaxed resize-none focus:outline-none"
          />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Live Match Highlighting
          </div>
          <div className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words min-h-[168px]">
            {evaluation.segments.map((seg, idx) =>
              seg.isMatch ? (
                <mark
                  key={idx}
                  className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/50 rounded px-1 py-0.5"
                >
                  {seg.text}
                </mark>
              ) : (
                <span key={idx} className="text-slate-300">
                  {seg.text}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Capture Groups Table */}
      {evaluation.matches.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Extracted Matches & Capture Groups ({evaluation.matches.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Full Match</th>
                  <th className="py-2.5 px-4">Index</th>
                  <th className="py-2.5 px-4">Capture Groups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {evaluation.matches.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-4 text-emerald-300 font-semibold">{m.fullMatch}</td>
                    <td className="py-2.5 px-4 text-slate-400">{m.index}</td>
                    <td className="py-2.5 px-4 text-purple-300">
                      {m.groups.length > 0
                        ? m.groups.map((g, i) => `Group ${i + 1}: "${g ?? ''}"`).join(' | ')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
