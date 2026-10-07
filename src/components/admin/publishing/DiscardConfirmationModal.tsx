'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface DiscardConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  isAll?: boolean;
}

export const DiscardConfirmationModal: React.FC<DiscardConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title,
  isAll = false,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelBtnRef.current?.focus(), 50);
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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="discard-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#0D111A] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg shrink-0">
            ⚠️
          </div>
          <div>
            <h3 id="discard-modal-title" className="text-base font-bold text-slate-100">
              {isAll ? 'Discard All Draft Changes?' : `Discard "${title || 'Draft'}"?`}
            </h3>
            <span className="text-xs font-mono text-slate-400">Revert Staged Changes</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {isAll
            ? 'All unpublished draft modifications across all modules will be discarded. Your existing live published portfolio and uploaded media will remain 100% preserved.'
            : `The unpublished draft changes for "${title || 'this item'}" will be discarded. The currently published version remains safely intact.`}
        </p>

        <div className="bg-[#080B11] border border-white/5 rounded-xl p-3.5 text-xs font-mono text-slate-400">
          🔒 <span className="text-slate-300">Live published content will NOT be deleted or modified.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <Button
            ref={cancelBtnRef}
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="text-xs font-mono"
          >
            Keep Draft
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="text-xs font-mono bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border-rose-500/40"
          >
            {loading ? 'Discarding...' : 'Confirm Discard'}
          </Button>
        </div>
      </div>
    </div>
  );
};
