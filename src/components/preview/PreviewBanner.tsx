'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import type { CmsDraft } from '@/lib/supabase/types';

interface PreviewBannerProps {
  draftCount: number;
  drafts?: CmsDraft[];
}

export const PreviewBanner: React.FC<PreviewBannerProps> = ({ draftCount, drafts = [] }) => {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handlePublishAll = async () => {
    if (!window.confirm('Publish all draft changes to the live public portfolio?')) {
      return;
    }

    setPublishing(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/publishing/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish changes.');
      }

      setFeedback('All changes published successfully! Reloading...');
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Publish failed.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div
      role="region"
      aria-label="Admin Preview Mode Banner"
      className="sticky top-0 z-[60] bg-amber-950/90 backdrop-blur-md border-b border-amber-500/30 text-amber-200 px-4 py-2.5 shadow-lg shadow-black/40"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        {/* Left: Identity and status badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="font-bold uppercase tracking-wider text-amber-300">
            Preview Mode
          </span>
          <span className="text-amber-400/60">•</span>
          <span className="text-amber-200/90">
            {draftCount > 0 ? (
              <>
                <strong className="text-white font-semibold">{draftCount}</strong> unpublished{' '}
                {draftCount === 1 ? 'change' : 'changes'} staged
              </>
            ) : (
              'All content published (Viewing Live State)'
            )}
          </span>
          {drafts.some((d) => d.entity_type === 'theme') && (
            <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-500/50 text-[11px] font-semibold">
              Preview Mode — Unpublished Theme
            </span>
          )}
          {feedback && (
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px]">
              {feedback}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {draftCount > 0 && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePublishAll}
              disabled={publishing}
              className="text-xs font-mono bg-amber-500 hover:bg-amber-400 text-black font-bold border-none"
            >
              {publishing ? 'Publishing...' : 'Publish All'}
            </Button>
          )}

          <Link
            href="/admin/publishing"
            className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-amber-500/30 text-amber-200 hover:text-white transition-colors flex items-center gap-1.5 focus-ring"
          >
            <span>Review Changes</span>
            <span>↗</span>
          </Link>

          <Link
            href="/admin/themes"
            className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-amber-500/30 text-amber-200 hover:text-white transition-colors flex items-center gap-1.5 focus-ring"
          >
            <span>Themes</span>
            <span>🎨</span>
          </Link>

          <Link
            href="/admin/dashboard"
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors focus-ring"
          >
            Exit Preview ✕
          </Link>
        </div>
      </div>
    </div>
  );
};
