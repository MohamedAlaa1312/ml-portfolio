'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { DraftCard } from './DraftCard';
import { PublishConfirmationModal } from './PublishConfirmationModal';
import { DiscardConfirmationModal } from './DiscardConfirmationModal';
import type { CmsDraft } from '@/lib/supabase/types';

interface PublishingManagerProps {
  initialDrafts: CmsDraft[];
}

export const PublishingManager: React.FC<PublishingManagerProps> = ({ initialDrafts }) => {
  const [drafts, setDrafts] = useState<CmsDraft[]>(initialDrafts);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Modal Targets
  const [publishTarget, setPublishTarget] = useState<{ draft?: CmsDraft; all?: boolean } | null>(
    null
  );
  const [discardTarget, setDiscardTarget] = useState<{ draft?: CmsDraft; all?: boolean } | null>(
    null
  );

  const draftCount = drafts.length;

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Execute Publish Network Request
  const handleExecutePublish = async () => {
    if (!publishTarget) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/publishing/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          publishTarget.all
            ? { all: true }
            : { draftId: publishTarget.draft?.id }
        ),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish content.');
      }

      if (publishTarget.all) {
        setDrafts([]);
        showFeedback(
          'success',
          `All changes (${publishTarget.draft ? 1 : draftCount}) successfully published to live portfolio.`
        );
      } else if (publishTarget.draft) {
        setDrafts((prev) => prev.filter((d) => d.id !== publishTarget.draft?.id));
        showFeedback('success', `"${publishTarget.draft.title}" published successfully.`);
      }

      setPublishTarget(null);
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Publish action failed.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Discard Network Request
  const handleExecuteDiscard = async () => {
    if (!discardTarget) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/publishing/discard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          discardTarget.all
            ? { all: true }
            : { draftId: discardTarget.draft?.id }
        ),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to discard draft.');
      }

      if (discardTarget.all) {
        setDrafts([]);
        showFeedback('success', 'All staged draft changes have been discarded. Published baseline preserved.');
      } else if (discardTarget.draft) {
        setDrafts((prev) => prev.filter((d) => d.id !== discardTarget.draft?.id));
        showFeedback('success', `Draft for "${discardTarget.draft.title}" discarded. Published baseline preserved.`);
      }

      setDiscardTarget(null);
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Discard action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
              Pending Drafts
            </span>
            <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
              {draftCount}
            </span>
            <span className="text-[11px] text-slate-400">Unpublished modifications</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg">
            📝
          </div>
        </div>

        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
              Public Status
            </span>
            <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
              Live
            </span>
            <span className="text-[11px] text-slate-400">Serving Published Baseline</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg">
            🌐
          </div>
        </div>

        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
              Preview Mode
            </span>
            <span className="text-2xl font-bold text-blue-400 font-mono mt-1 block">
              Active
            </span>
            <span className="text-[11px] text-slate-400">Authenticated Sandbox</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg">
            👁️
          </div>
        </div>
      </div>

      {/* 2. Real-time Feedback Banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-xl text-xs font-mono border flex items-center justify-between animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === 'success' ? '✔' : '✖'}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white ml-4 cursor-pointer focus-ring rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Main Publishing Panel */}
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Staged Content Changes</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                  draftCount > 0
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {draftCount > 0 ? `${draftCount} Pending` : 'All Published'}
              </span>
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Draft changes staged by administrators. Preview modifications before publishing or
              discarding them.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/admin/preview"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 focus-ring"
            >
              <span>Preview Staged Site</span>
              <span>↗</span>
            </Link>

            {draftCount > 0 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDiscardTarget({ all: true })}
                  disabled={loading}
                  className="text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-white/10"
                >
                  Discard All
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setPublishTarget({ all: true })}
                  disabled={loading}
                  className="text-xs font-mono bg-amber-500 hover:bg-amber-400 text-black font-bold"
                >
                  Publish All ({draftCount})
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 4. Drafts List or Clean Empty State */}
        {draftCount === 0 ? (
          <div className="bg-[#080B11] border border-white/5 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl mx-auto">
              ✓
            </div>
            <h4 className="text-base font-bold text-slate-100">Everything is Up to Date</h4>
            <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
              The public portfolio is currently displaying all approved published content. Any new
              edits saved in the CMS will appear here as drafts for your review.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-amber-400 transition-colors"
              >
                <span>View Live Portfolio</span>
                <span>↗</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onPublish={(d) => setPublishTarget({ draft: d })}
                onDiscard={(d) => setDiscardTarget({ draft: d })}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <PublishConfirmationModal
        isOpen={Boolean(publishTarget)}
        onClose={() => setPublishTarget(null)}
        onConfirm={handleExecutePublish}
        loading={loading}
        title={publishTarget?.draft?.title}
        count={publishTarget?.all ? draftCount : undefined}
      />

      <DiscardConfirmationModal
        isOpen={Boolean(discardTarget)}
        onClose={() => setDiscardTarget(null)}
        onConfirm={handleExecuteDiscard}
        loading={loading}
        title={discardTarget?.draft?.title}
        isAll={Boolean(discardTarget?.all)}
      />
    </div>
  );
};
