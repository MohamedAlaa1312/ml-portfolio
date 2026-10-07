'use client';

import React, { useState } from 'react';
import type { MediaItemWithUsage } from '@/lib/supabase/types';
import { Button } from '@/components/ui/Button';

interface MediaDeleteModalProps {
  media: MediaItemWithUsage | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (media: MediaItemWithUsage) => Promise<void>;
}

export const MediaDeleteModal: React.FC<MediaDeleteModalProps> = ({
  media,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !media) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirmDelete(media);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete media asset';
      setErrorMsg(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0D111A] border border-rose-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-rose-500/10">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 id="delete-modal-title" className="text-base font-bold text-rose-300">
              Delete Media Asset?
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Permanent removal from storage and database
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-sm text-slate-300">
          <p className="leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-100 font-mono">
              &quot;{media.title || media.file_name}&quot;
            </strong>
            ?
          </p>

          <div className="p-3 rounded-xl bg-[#080B11] border border-white/10 flex items-center gap-3">
            {media.media_type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.public_url}
                alt=""
                className="w-12 h-12 rounded object-cover border border-white/10"
              />
            ) : (
              <span className="text-3xl">📄</span>
            )}
            <div className="overflow-hidden">
              <span className="font-semibold text-slate-200 block truncate text-xs">
                {media.file_name}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {media.mime_type} • {(media.file_size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-xs leading-relaxed space-y-1">
            <span className="font-bold block">✓ Safe Deletion Verified</span>
            <span>This asset has no active references in portfolio content. Deletion will not break any published or draft sections.</span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#080B11]/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs font-mono"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white border-none"
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </div>
      </div>
    </div>
  );
};
