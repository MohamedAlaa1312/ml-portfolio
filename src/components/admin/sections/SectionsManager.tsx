'use client';

import React, { useState } from 'react';
import { SectionList } from './SectionList';
import { SectionDisableModal } from './SectionDisableModal';
import { SectionMetadataModal } from './SectionMetadataModal';
import { Button } from '@/components/ui/Button';
import type { Section, PublishStatus } from '@/lib/supabase/types';

interface SectionsManagerProps {
  initialSections: Section[];
}

export const SectionsManager: React.FC<SectionsManagerProps> = ({ initialSections }) => {
  const [sections, setSections] = useState<Section[]>(() =>
    [...initialSections].sort((a, b) => a.display_order - b.display_order)
  );
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Modal States
  const [disableModalTarget, setDisableModalTarget] = useState<Section | null>(null);
  const [editModalTarget, setEditModalTarget] = useState<Section | null>(null);

  const totalSections = sections.length;
  const enabledCount = sections.filter((s) => s.enabled).length;
  const disabledCount = totalSections - enabledCount;

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  // Reordering: Move Up (accessible keyboard & click)
  const handleMoveUp = async (index: number) => {
    if (index <= 0 || loading) return;

    const previousSections = [...sections];
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;

    // Re-index display_order locally
    newSections.forEach((s, idx) => {
      s.display_order = idx + 1;
    });

    setSections(newSections);
    setLoading(true);

    try {
      const orderedIds = newSections.map((s) => s.id);
      const res = await fetch('/api/admin/sections/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update section ordering.');
      }

      showFeedback('success', `Moved "${temp.title}" to position #${index}.`);
    } catch (err: unknown) {
      setSections(previousSections);
      showFeedback('error', err instanceof Error ? err.message : 'Reordering failed.');
    } finally {
      setLoading(false);
    }
  };

  // Reordering: Move Down
  const handleMoveDown = async (index: number) => {
    if (index >= sections.length - 1 || loading) return;

    const previousSections = [...sections];
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;

    newSections.forEach((s, idx) => {
      s.display_order = idx + 1;
    });

    setSections(newSections);
    setLoading(true);

    try {
      const orderedIds = newSections.map((s) => s.id);
      const res = await fetch('/api/admin/sections/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update section ordering.');
      }

      showFeedback('success', `Moved "${temp.title}" to position #${index + 2}.`);
    } catch (err: unknown) {
      setSections(previousSections);
      showFeedback('error', err instanceof Error ? err.message : 'Reordering failed.');
    } finally {
      setLoading(false);
    }
  };

  // Visibility Toggle Click Dispatcher
  const handleToggleClick = (section: Section) => {
    if (section.type === 'hero' || section.slug === 'hero') {
      showFeedback(
        'error',
        'The Hero section is a core identity section and cannot be disabled.'
      );
      return;
    }

    if (section.enabled) {
      // Prompt confirmation before disabling (Requirement 41)
      setDisableModalTarget(section);
    } else {
      // Immediately enable without modal
      executeToggle(section, true);
    }
  };

  // Execute Toggle Network Request
  const executeToggle = async (section: Section, targetEnabled: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sections/${section.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: targetEnabled }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update section visibility.');
      }

      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, enabled: targetEnabled } : s))
      );

      setDisableModalTarget(null);
      showFeedback(
        'success',
        targetEnabled
          ? `"${section.title}" is now visible on the public portfolio.`
          : `"${section.title}" has been disabled and hidden from the public portfolio.`
      );
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Toggle action failed.');
    } finally {
      setLoading(false);
    }
  };

  // Metadata Save
  const handleSaveMetadata = async (
    id: string,
    updates: { title: string; status: PublishStatus }
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update section metadata.');
      }

      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );

      showFeedback('success', `Metadata updated for "${updates.title}".`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
              Total Sections
            </span>
            <span className="text-2xl font-bold text-slate-100 font-mono mt-1 block">
              {totalSections}
            </span>
            <span className="text-[11px] font-mono text-slate-400">Core Architecture</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg">
            📑
          </div>
        </div>

        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
              Active / Visible
            </span>
            <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
              {enabledCount}
            </span>
            <span className="text-[11px] font-mono text-slate-400">Rendered in DOM</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg">
            👁️
          </div>
        </div>

        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
              Disabled / Hidden
            </span>
            <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
              {disabledCount}
            </span>
            <span className="text-[11px] font-mono text-slate-400">Omitted from DOM</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg">
            🚫
          </div>
        </div>
      </div>

      {/* Real-time Feedback Banner */}
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

      {/* Main Sections Management Panel */}
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Public Section Pipeline</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono">
                {enabledCount} Active
              </span>
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Deterministic sequence configured directly in PostgreSQL. Move sections up or down to
              reorder public display.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 bg-[#080B11] border border-white/5 px-3 py-1.5 rounded-xl">
              ⚡ Live Revalidation Active
            </span>
          </div>
        </div>

        {/* Section List with Accessible Move Up / Down */}
        <SectionList
          sections={sections}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onToggle={handleToggleClick}
          onEdit={(section) => setEditModalTarget(section)}
          loading={loading}
        />
      </div>

      {/* Section Disable Confirmation Modal */}
      <SectionDisableModal
        section={disableModalTarget}
        isOpen={Boolean(disableModalTarget)}
        onClose={() => setDisableModalTarget(null)}
        onConfirm={(target) => executeToggle(target, false)}
        loading={loading}
      />

      {/* Section Metadata Editor Modal */}
      <SectionMetadataModal
        section={editModalTarget}
        isOpen={Boolean(editModalTarget)}
        onClose={() => setEditModalTarget(null)}
        onSave={handleSaveMetadata}
        loading={loading}
      />
    </div>
  );
};
