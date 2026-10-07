'use client';

import React from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log sanitized error information to monitoring if configured
    console.error('[Application Runtime Error]:', error.message);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#080B11] text-slate-100 flex items-center justify-center p-6 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="w-full max-w-lg bg-[#0D111A] border border-red-500/20 rounded-2xl p-8 sm:p-10 shadow-2xl relative text-center space-y-6">
        {/* Glow */}
        <div className="absolute inset-0 bg-red-500/5 rounded-2xl blur-2xl pointer-events-none" />

        {/* Code Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>STATUS: 500 // RUNTIME_EXCEPTION</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-white">
            An Unexpected Error Occurred
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            The application encountered an unexpected runtime state. System diagnostics have been recorded safely.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-500 pt-1">
              Event Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs font-mono transition-colors shadow-lg shadow-amber-500/20"
          >
            ↻ Retry Request
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium text-xs font-mono transition-colors"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
