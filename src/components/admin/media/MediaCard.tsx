'use client';

import React, { useState } from 'react';
import type { MediaItemWithUsage } from '@/lib/supabase/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface MediaCardProps {
  media: MediaItemWithUsage;
  onViewDetails: (media: MediaItemWithUsage) => void;
  onDelete: (media: MediaItemWithUsage) => void;
  onSelect?: (media: MediaItemWithUsage) => void;
  isSelectable?: boolean;
  isSelected?: boolean;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onViewDetails,
  onDelete,
  onSelect,
  isSelectable = false,
  isSelected = false,
}) => {
  const [copied, setCopied] = useState(false);
  const isImage = media.media_type === 'image';
  const extension = media.file_name.split('.').pop()?.toUpperCase() || 'FILE';

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(media.public_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => {
        if (isSelectable && onSelect) {
          onSelect(media);
        } else {
          onViewDetails(media);
        }
      }}
      className={`group relative bg-[#0D111A] border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col ${
        isSelected
          ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-2 ring-amber-500/50'
          : 'border-white/10 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5'
      }`}
    >
      {/* 1. Preview Container */}
      <div className="relative aspect-video w-full bg-[#080B11] border-b border-white/5 overflow-hidden flex items-center justify-center">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.public_url}
            alt={media.alt_text || media.title || media.file_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // Fallback placeholder if image cannot load
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-slate-400">
            <span className="text-4xl">📄</span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
              {extension} Document
            </span>
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <Badge variant="outline" className="text-[10px] uppercase font-mono px-2 py-0.5 bg-black/70 backdrop-blur-sm border-white/20">
            {extension}
          </Badge>
        </div>

        {/* In-Use Status Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {media.inUse ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              In Use ({media.usageCount})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800/80 text-slate-400 border border-white/10 backdrop-blur-sm">
              Unused
            </span>
          )}
        </div>
      </div>

      {/* 2. Metadata Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h4
            className="text-sm font-semibold text-slate-100 truncate group-hover:text-amber-400 transition-colors"
            title={media.title || media.file_name}
          >
            {media.title || media.file_name}
          </h4>
          <p
            className="text-xs text-slate-400 font-mono truncate mt-0.5"
            title={media.file_name}
          >
            {media.file_name}
          </p>
        </div>

        {/* Meta Specs */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
          <span>{formatBytes(media.file_size)}</span>
          {media.width && media.height ? (
            <span>{media.width}×{media.height}</span>
          ) : (
            <span>{new Date(media.created_at).toLocaleDateString()}</span>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(media);
            }}
            className="flex-1 text-xs font-mono py-1.5 h-auto min-h-0 border-white/10 hover:border-amber-500/40"
          >
            Details
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyUrl}
            className="text-xs font-mono py-1.5 px-2.5 h-auto min-h-0 text-slate-300 hover:text-amber-400"
            title="Copy Public URL"
          >
            {copied ? '✓ Copied' : '🔗 URL'}
          </Button>

          {!isSelectable && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(media);
              }}
              className={`text-xs font-mono py-1.5 px-2.5 h-auto min-h-0 ${
                media.inUse
                  ? 'text-slate-600 hover:text-slate-500 cursor-not-allowed'
                  : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
              }`}
              title={
                media.inUse
                  ? `Cannot delete: referenced by ${media.usageCount} content item(s)`
                  : 'Delete unused media asset'
              }
            >
              🗑️
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
