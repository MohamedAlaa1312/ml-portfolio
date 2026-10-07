'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SocialDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemTitle?: string;
}

export const SocialDeleteModal: React.FC<SocialDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemTitle = 'this social link',
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete social link.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-social-title"
    >
      <div className="w-full max-w-md">
        <Card variant="standard" className="bg-[#0D111A] border-red-500/20 shadow-2xl overflow-hidden">
          <CardHeader className="p-5 border-b border-white/10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-base text-red-400">
                🗑️
              </div>
              <CardTitle id="delete-social-title" className="text-base font-bold text-slate-100">
                Delete Social Link
              </CardTitle>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-white/5 focus-ring"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-4">
            {error && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono"
              >
                {error}
              </div>
            )}

            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-amber-400">&ldquo;{itemTitle}&rdquo;</span>?
            </p>

            <p className="text-xs text-slate-400 font-mono leading-relaxed bg-[#131926] p-3 rounded-xl border border-white/5">
              ⚠️ This will remove the link from both the Contact section and the Hero section across the public portfolio.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isDeleting}
                className="text-xs font-mono min-h-[40px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="bg-red-600 hover:bg-red-500 text-white border-transparent text-xs font-mono font-semibold min-h-[40px]"
              >
                Yes, Delete Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
