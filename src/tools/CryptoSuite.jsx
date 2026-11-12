import React, { useState } from 'react';
import { Fingerprint, Key, Copy, Check, RefreshCw, ArrowLeftRight } from 'lucide-react';

function generateUuidV4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateSecret(length = 32, includeSymbols = true) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
    (includeSymbols ? '!@#$%^&*()-_=+[]{}<>?' : '');
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join('');
}

export default function CryptoSuite({ onToolAction }) {
  const [uuidCount, setUuidCount] = useState(5);
  const [uuids, setUuids] = useState(() => Array.from({ length: 5 }, generateUuidV4));
  const [secretLen, setSecretLen] = useState(36);
  const [useSymbols, setUseSymbols] = useState(true);
  const [secret, setSecret] = useState(() => generateSecret(36, true));
  const [plainText, setPlainText] = useState('https://github.com/Jayasri7-ux?tab=repositories');
  const [copiedId, setCopiedId] = useState(null);

  const regenerateUuids = (count = uuidCount) => {
    setUuids(Array.from({ length: count }, generateUuidV4));
    onToolAction?.(`Generated ${count} UUID v4 tokens`);
  };

  const regenerateSecret = (len = secretLen, sym = useSymbols) => {
    setSecret(generateSecret(len, sym));
    onToolAction?.('Generated new cryptographic secret');
  };

  const copyValue = async (id, text) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    onToolAction?.(`Copied ${id} to clipboard`);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const poolSize = 62 + (useSymbols ? 21 : 0);
  const entropyBits = Math.round(secretLen * Math.log2(poolSize));

  const base64Encoded = (() => {
    try {
      return btoa(unescape(encodeURIComponent(plainText)));
    } catch {
      return 'Invalid input for Base64';
    }
  })();

  const urlEncoded = encodeURIComponent(plainText);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* UUID v4 Bulk Generator */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                UUID v4 Bulk Generator (RFC 4122)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={uuidCount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setUuidCount(val);
                  regenerateUuids(val);
                }}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
              >
                <option value={1}>1 UUID</option>
                <option value={5}>5 UUIDs</option>
                <option value={10}>10 UUIDs</option>
              </select>
              <button
                onClick={() => regenerateUuids()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                New
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            {uuids.map((id, index) => (
              <div
                key={id + index}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-emerald-300"
              >
                <span>{id}</span>
                <button
                  onClick={() => copyValue(`uuid-${index}`, id)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {copiedId === `uuid-${index}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* High-Entropy API Secret Generator */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                API Secret & Key Generator (CSPRNG)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {entropyBits} bits entropy
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 break-all flex items-center justify-between gap-3">
            <span>{secret}</span>
            <button
              onClick={() => copyValue('secret', secret)}
              className="shrink-0 px-2.5 py-1.5 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              {copiedId === 'secret' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Secret Length: {secretLen} characters</span>
              <input
                type="range"
                min={16}
                max={64}
                value={secretLen}
                onChange={(e) => {
                  const len = Number(e.target.value);
                  setSecretLen(len);
                  regenerateSecret(len, useSymbols);
                }}
                className="w-44 accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSymbols}
                  onChange={(e) => {
                    const sym = e.target.checked;
                    setUseSymbols(sym);
                    regenerateSecret(secretLen, sym);
                  }}
                  className="rounded accent-indigo-500"
                />
                Include special symbols (!@#$%^&*)
              </label>

              <button
                onClick={() => regenerateSecret()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate Secret
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Base64 & URL Encoder */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Instant Base64 & URL Encoder
          </h3>
        </div>

        <input
          type="text"
          value={plainText}
          onChange={(e) => setPlainText(e.target.value)}
          placeholder="Type any string or URL to encode..."
          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Base64 Encoded</span>
              <button
                onClick={() => copyValue('b64', base64Encoded)}
                className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                {copiedId === 'b64' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="font-mono text-xs text-cyan-300 break-all">{base64Encoded}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>URL Percent-Encoded</span>
              <button
                onClick={() => copyValue('url', urlEncoded)}
                className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                {copiedId === 'url' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="font-mono text-xs text-purple-300 break-all">{urlEncoded}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
