'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import type { Section } from '@/lib/supabase/types';

interface SectionDisableModalProps {
  section: Section | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (section: Section) => void;
  loading?: boolean;
}

export const SectionDisableModal: React.FC<SectionDisableModalProps> = ({
  section,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disable-modal-title"
      aria-describedby="disable-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#0D111A] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg shrink-0">
            ⚠️
          </div>
          <div>
            <h3 id="disable-modal-title" className="text-base font-bold text-slate-100">
              Disable {section.title}?
            </h3>
            <span className="text-xs font-mono text-slate-400">Section Visibility Control</span>
          </div>
        </div>

        <p id="disable-modal-desc" className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The <span className="font-semibold text-white">&ldquo;{section.title}&rdquo;</span> section will no
          longer appear on your public portfolio. All existing content, settings, and records will
          remain safely stored in the database.
        </p>

        <div className="bg-[#080B11] border border-white/5 rounded-xl p-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>Target Identifier:</span>
          <span className="text-amber-400 font-semibold">#{section.slug}</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <Button
            ref={cancelButtonRef}
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="text-xs font-mono"
          >
            Keep Active
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onConfirm(section)}
            disabled={loading}
            className="text-xs font-mono bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/40"
          >
            {loading ? 'Disabling...' : 'Confirm Disable'}
          </Button>
        </div>
      </div>
    </div>
  );
};
