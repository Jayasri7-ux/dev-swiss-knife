import React, { useState, useMemo } from 'react';
import { ShieldCheck, ShieldAlert, Clock, KeyRound, Copy, Check, RefreshCw } from 'lucide-react';

function base64UrlEncode(obj) {
  const json = JSON.stringify(obj);
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createSampleJwt() {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT', kid: 'dev-key-2026' };
  const payload = {
    sub: 'usr_98234109',
    name: 'Jaya Sri',
    github: 'Jayasri7-ux',
    role: 'admin',
    scopes: ['repos:read', 'repos:write', 'deployments:trigger'],
    iat: nowSec - 1800,
    exp: nowSec + 7200,
    iss: 'https://auth.devswissknife.dev',
  };
  const signature = 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.${signature}`;
}

function decodeBase64Url(segment) {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const decoded = decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(decoded);
}

export default function JwtDecoder({ onToolAction }) {
  const [token, setToken] = useState(() => createSampleJwt());
  const [copiedSection, setCopiedSection] = useState(null);

  const decoded = useMemo(() => {
    const trimmed = token.trim();
    if (!trimmed) return { valid: false, error: 'Paste a JWT token above to inspect its claims.' };

    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      return {
        valid: false,
        error: `Invalid JWT structure: expected 3 dot-separated segments (Header.Payload.Signature), found ${parts.length}.`,
      };
    }

    try {
      const header = decodeBase64Url(parts[0]);
      const payload = decodeBase64Url(parts[1]);
      const signature = parts[2];

      const nowSec = Math.floor(Date.now() / 1000);
      const isExpired = typeof payload.exp === 'number' ? payload.exp < nowSec : null;
      const issuedAt =
        typeof payload.iat === 'number' ? new Date(payload.iat * 1000).toLocaleString() : null;
      const expiresAt =
        typeof payload.exp === 'number' ? new Date(payload.exp * 1000).toLocaleString() : null;

      return {
        valid: true,
        header,
        payload,
        signature,
        parts,
        isExpired,
        issuedAt,
        expiresAt,
      };
    } catch (err) {
      return {
        valid: false,
        error: `Failed to Base64URL decode token segments: ${err.message}`,
      };
    }
  }, [token]);

  const copyJson = async (label, data) => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedSection(label);
    onToolAction?.(`Copied JWT ${label}`);
    setTimeout(() => setCopiedSection(null), 1800);
  };

  return (
    <div className="space-y-5">
      {/* Encoded Token Input */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Encoded JWT Token (Bearer / OAuth2 / OIDC)
            </span>
          </div>
          <button
            onClick={() => {
              setToken(createSampleJwt());
              onToolAction?.('Generated fresh sample JWT');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Generate Fresh Token
          </button>
        </div>

        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={3}
          spellCheck={false}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className="w-full p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 break-all resize-none focus:outline-none focus:border-indigo-500"
        />

        {/* Color-coded segment preview */}
        {decoded.valid && (
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono text-xs break-all leading-relaxed">
            <span className="text-rose-400">{decoded.parts[0]}</span>
            <span className="text-slate-500">.</span>
            <span className="text-purple-400">{decoded.parts[1]}</span>
            <span className="text-slate-500">.</span>
            <span className="text-cyan-400">{decoded.parts[2]}</span>
          </div>
        )}
      </div>

      {/* Token Status Banner */}
      {decoded.valid ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            {decoded.isExpired ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <div className="text-xs text-slate-400">Token Lifecycle Status</div>
              <div
                className={`text-sm font-semibold ${
                  decoded.isExpired ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {decoded.isExpired === null
                  ? 'No Expiration Claim (exp)'
                  : decoded.isExpired
                  ? 'Expired Token'
                  : 'Active & Unexpired'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Issued At (iat)</div>
              <div className="text-xs font-mono text-slate-200">
                {decoded.issuedAt || 'Not specified'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Expires At (exp)</div>
              <div className="text-xs font-mono text-slate-200">
                {decoded.expiresAt || 'Not specified'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono">
          {decoded.error}
        </div>
      )}

      {/* Decoded Header & Payload Panels */}
      {decoded.valid && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Header */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Header — Algorithm & Token Type
              </span>
              <button
                onClick={() => copyJson('Header', decoded.header)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                {copiedSection === 'Header' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy
              </button>
            </div>
            <pre className="p-4 font-mono text-xs text-rose-300 overflow-auto">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                Payload — Decoded Claims & Permissions
              </span>
              <button
                onClick={() => copyJson('Payload', decoded.payload)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                {copiedSection === 'Payload' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy
              </button>
            </div>
            <pre className="p-4 font-mono text-xs text-purple-300 overflow-auto">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
