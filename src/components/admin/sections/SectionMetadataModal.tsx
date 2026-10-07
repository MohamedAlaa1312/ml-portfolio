'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Section, PublishStatus } from '@/lib/supabase/types';

interface SectionMetadataModalProps {
  section: Section | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { title: string; status: PublishStatus }) => Promise<void>;
  loading?: boolean;
}

export const SectionMetadataModal: React.FC<SectionMetadataModalProps> = ({
  section,
  isOpen,
  onClose,
  onSave,
  loading = false,
}) => {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<PublishStatus>('published');
  const [error, setError] = useState<string | null>(null);
  const [prevSectionId, setPrevSectionId] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const currentSectionId = section && isOpen ? section.id : null;
  if (currentSectionId !== prevSectionId) {
    setPrevSectionId(currentSectionId);
    if (section && isOpen) {
      setTitle(section.title || '');
      setStatus(section.status || 'published');
      setError(null);
    }
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !section) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Section title is required and cannot be empty.');
      return;
    }
    setError(null);
    try {
      await onSave(section.id, {
        title: title.trim(),
        status,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update section metadata');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="metadata-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#0D111A] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-6 text-slate-100">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
              📑
            </div>
            <div>
              <h3 id="metadata-modal-title" className="text-base font-bold text-slate-100">
                Edit Section Metadata
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Type: {section.type} • Slug: #{section.slug}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white p-1 rounded-lg focus-ring cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section Title */}
          <div>
            <label
              htmlFor="section-title-input"
              className="block text-xs font-mono text-slate-300 mb-1.5"
            >
              Section Name / Title <span className="text-amber-500">*</span>
            </label>
            <Input
              id="section-title-input"
              ref={firstInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Featured Projects"
              required
              className="font-sans text-sm"
            />
          </div>

          {/* Publication Status */}
          <div>
            <label
              htmlFor="section-status-select"
              className="block text-xs font-mono text-slate-300 mb-1.5"
            >
              Publication Status
            </label>
            <select
              id="section-status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as PublishStatus)}
              className="w-full bg-[#080B11] border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus-ring focus:border-amber-500/50"
            >
              <option value="published">Published (Visible when enabled)</option>
              <option value="draft">Draft (Hidden from public view)</option>
              <option value="archived">Archived (Decommissioned)</option>
            </select>
          </div>

          {/* Info Banner reminding about dedicated module */}
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs leading-relaxed flex items-start gap-2.5">
            <span className="text-sm shrink-0">ℹ️</span>
            <div>
              <span className="font-semibold block mb-0.5">Content Management Note</span>
              <span>
                Detailed section content (projects, experiences, skills, credentials, and bio) is
                managed in its respective dedicated CMS module. This editor manages section-level
                hierarchy and status only.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs font-mono"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
              className="text-xs font-mono"
            >
              {loading ? 'Saving...' : 'Save Metadata'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
