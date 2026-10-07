'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface PublishConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  count?: number;
}

export const PublishConfirmationModal: React.FC<PublishConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title,
  count,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => confirmBtnRef.current?.focus(), 50);
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
      aria-labelledby="publish-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#0D111A] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg shrink-0">
            🌐
          </div>
          <div>
            <h3 id="publish-modal-title" className="text-base font-bold text-slate-100">
              {title ? `Publish "${title}"?` : `Publish ${count ? `${count} ` : ''}Draft Changes?`}
            </h3>
            <span className="text-xs font-mono text-slate-400">Content Publication Workflow</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          These changes will immediately become visible to all public visitors on your live portfolio.
          The production cache will be automatically refreshed.
        </p>

        <div className="bg-[#080B11] border border-white/5 rounded-xl p-3.5 text-xs font-mono text-amber-300/90 flex items-center gap-2">
          <span>⚡</span>
          <span>Instant live revalidation of public routes.</span>
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
            ref={confirmBtnRef}
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="text-xs font-mono bg-amber-500 hover:bg-amber-400 text-black font-bold"
          >
            {loading ? 'Publishing...' : 'Confirm & Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
};
