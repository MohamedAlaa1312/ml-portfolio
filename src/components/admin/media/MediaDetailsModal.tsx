'use client';

import React, { useState } from 'react';
import type { MediaItemWithUsage } from '@/lib/supabase/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface MediaDetailsModalProps {
  media: MediaItemWithUsage | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveMetadata: (
    id: string,
    metadata: { title?: string; alt_text?: string; description?: string }
  ) => Promise<void>;
  onDeleteRequest: (media: MediaItemWithUsage) => void;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({
  media,
  isOpen,
  onClose,
  onSaveMetadata,
  onDeleteRequest,
}) => {
  const [title, setTitle] = useState(media?.title || '');
  const [altText, setAltText] = useState(media?.alt_text || '');
  const [description, setDescription] = useState(media?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Sync state whenever media changes
  React.useEffect(() => {
    if (media) {
      setTitle(media.title || '');
      setAltText(media.alt_text || '');
      setDescription(media.description || '');
      setSaveSuccess(false);
    }
  }, [media]);

  if (!isOpen || !media) return null;

  const isImage = media.media_type === 'image';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveMetadata(media.id, {
        title: title.trim(),
        alt_text: altText.trim(),
        description: description.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(media.public_url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0D111A] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* 1. Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#080B11]/50">
          <div className="flex items-center gap-3">
            <span className="text-xl">{isImage ? '🖼️' : '📄'}</span>
            <div>
              <h3 id="media-details-title" className="text-base font-bold text-slate-100">
                Media Asset Details
              </h3>
              <p className="text-xs font-mono text-slate-400 truncate max-w-md">
                {media.file_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-100 p-2 rounded-lg hover:bg-white/5 transition-colors focus-ring"
          >
            ✕
          </button>
        </div>

        {/* 2. Modal Body (2-Column Grid on md+) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column (col-5): Visual Preview & Technical Specs */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#080B11] border border-white/10 flex items-center justify-center group">
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={media.public_url}
                  alt={media.alt_text || media.title || media.file_name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <span className="text-5xl">📄</span>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                    PDF Document
                  </span>
                  <a
                    href={media.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-amber-300 underline hover:text-amber-200 mt-2"
                  >
                    Open Document ↗
                  </a>
                </div>
              )}
            </div>

            {/* Technical Metadata Card */}
            <div className="p-4 rounded-xl bg-[#080B11]/70 border border-white/5 space-y-2.5 text-xs font-mono text-slate-400">
              <div className="flex justify-between">
                <span>File Size:</span>
                <span className="text-slate-200 font-semibold">{formatBytes(media.file_size)}</span>
              </div>
              <div className="flex justify-between">
                <span>MIME Type:</span>
                <span className="text-slate-200 font-semibold">{media.mime_type}</span>
              </div>
              {media.width && media.height && (
                <div className="flex justify-between">
                  <span>Dimensions:</span>
                  <span className="text-slate-200 font-semibold">{media.width} × {media.height} px</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Uploaded:</span>
                <span className="text-slate-200">{new Date(media.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
                <span>Public Storage URL:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={media.public_url}
                    className="w-full bg-[#0D111A] border border-white/10 rounded px-2 py-1 text-[11px] text-slate-300 font-mono select-all truncate"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="text-xs font-mono py-1 px-2.5 h-auto min-h-0"
                  >
                    {copiedUrl ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>

            {/* In-Use / Protection Banner */}
            <div className="p-4 rounded-xl border">
              {media.inUse ? (
                <div className="space-y-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 p-3 rounded-lg">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="text-emerald-400">🛡️</span> Protected (In Active Use)
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-200/90">
                    This media item is referenced by {media.usageCount} content record(s). Unsafe deletion is locked.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 border-slate-700 bg-slate-800/40 text-slate-400 p-3 rounded-lg">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-300">
                    <span>🗑️</span> Unused Asset
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    No active content references found. This asset can be safely deleted if no longer needed.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (col-7): Metadata Editor & Reference List */}
          <div className="md:col-span-7 space-y-6">
            {/* Metadata Edit Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Asset Metadata
              </h4>

              <Input
                label="Asset Title"
                helperText="Human-readable title used for search and media management."
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mohamed Alaa Profile Photo"
              />

              {isImage && (
                <Input
                  label="Alternative Text (Alt Text)"
                  helperText="Required for accessibility screen readers and SEO. Describe the image content accurately."
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="e.g. Portrait photo of Mohamed Alaa wearing professional attire"
                />
              )}

              <Textarea
                label="Description & Usage Notes"
                helperText="Internal notes on where this media should be used."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. High-resolution portrait for primary website hero section."
              />

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  className="font-mono text-xs font-bold"
                >
                  {isSaving ? 'Saving...' : 'Save Metadata'}
                </Button>

                {saveSuccess && (
                  <span className="text-xs font-mono text-emerald-400 font-semibold animate-in fade-in">
                    ✓ Metadata saved successfully!
                  </span>
                )}
              </div>
            </form>

            {/* Usage References List */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  Content References ({media.references.length})
                </h4>
                {media.inUse && (
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                    Active in CMS
                  </Badge>
                )}
              </div>

              {media.references.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {media.references.map((ref, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#080B11] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200 block truncate max-w-xs">
                          {ref.entityTitle}
                        </span>
                        <span className="text-[11px] font-mono text-amber-400/90">
                          Field: {ref.field}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {ref.entityType}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-mono italic">
                  No entities currently reference this file.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#080B11]/50">
          <div>
            {!media.inUse ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onDeleteRequest(media)}
                className="text-xs font-mono text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              >
                🗑️ Delete Unused Asset
              </Button>
            ) : (
              <span className="text-xs font-mono text-slate-500 italic">
                Deletion locked while referenced by content
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-mono"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
