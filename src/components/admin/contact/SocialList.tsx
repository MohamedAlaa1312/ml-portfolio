'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getPlatformIcon } from '@/lib/social-utils';
import type { SocialLinkItem } from '@/lib/supabase/types';

interface SocialListProps {
  links: SocialLinkItem[];
  onAddClick: () => void;
  onEditClick: (link: SocialLinkItem) => void;
  onDeleteClick: (link: SocialLinkItem) => void;
  onToggleEnabled: (id: string, currentEnabled: boolean) => Promise<void>;
  onMoveOrder: (id: string, direction: 'up' | 'down') => Promise<void>;
  isReordering?: boolean;
}

export const SocialList: React.FC<SocialListProps> = ({
  links,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onToggleEnabled,
  onMoveOrder,
  isReordering = false,
}) => {
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const handleToggle = async (id: string, current: boolean) => {
    setTogglingId(id);
    try {
      await onToggleEnabled(id, !current);
    } finally {
      setTogglingId(null);
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    setMovingId(id);
    try {
      await onMoveOrder(id, direction);
    } finally {
      setMovingId(null);
    }
  };

  const sortedLinks = [...links].sort((a, b) => a.display_order - b.display_order);
  const totalCount = sortedLinks.length;
  const enabledCount = sortedLinks.filter((l) => l.enabled).length;

  return (
    <Card variant="standard" className="bg-[#0D111A] border-white/10 overflow-hidden">
      <CardHeader className="p-5 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-100">
              Social Links
            </CardTitle>
            <Badge variant="outline" className="text-[11px] font-mono border-amber-500/30 text-amber-400">
              {enabledCount} of {totalCount} active
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centrally manage social media and professional networking links displayed across Hero and Contact sections.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onAddClick}
          className="text-xs font-mono font-semibold self-start sm:self-auto min-h-[40px] shrink-0"
        >
          <span className="mr-1.5 font-bold">+</span> Add Social Link
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {sortedLinks.length === 0 ? (
          // Empty State (Strict Requirement 14 & 36)
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-2xl text-amber-400 mx-auto flex items-center justify-center">
              🌐
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">No social links yet.</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Connect your professional networks, code repositories, and research profiles to showcase them on your portfolio.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddClick}
              className="text-xs font-mono border-amber-500/40 text-amber-400 hover:bg-amber-500/10 min-h-[40px]"
            >
              + Add Social Link
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sortedLinks.map((link, index) => {
              const isFirst = index === 0;
              const isLast = index === sortedLinks.length - 1;
              const isToggling = togglingId === link.id;
              const isMoving = movingId === link.id || isReordering;

              return (
                <div
                  key={link.id}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-white/[0.02] ${
                    !link.enabled ? 'opacity-60 bg-black/20' : ''
                  }`}
                >
                  {/* Left Column: Order, Icon, Platform Name, URL */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {/* Display Order Badge */}
                    <div className="w-7 h-7 rounded-lg bg-[#131926] border border-white/10 flex items-center justify-center text-xs font-mono text-slate-400 shrink-0 mt-0.5 sm:mt-0 font-semibold">
                      {link.display_order}
                    </div>

                    {/* Platform Icon */}
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg shrink-0 text-amber-400" aria-hidden="true">
                      {link.icon || getPlatformIcon(link.platform)}
                    </div>

                    {/* Platform Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-100">
                          {link.platform}
                        </span>
                        {link.label && link.label !== link.platform && (
                          <span className="text-xs text-slate-400 font-mono">
                            ({link.label})
                          </span>
                        )}
                        {!link.enabled && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400 border border-white/10">
                            Hidden
                          </span>
                        )}
                      </div>

                      {/* URL with safe wrapping */}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-400/90 hover:text-amber-300 font-mono transition-colors flex items-center gap-1.5 mt-0.5 truncate break-all max-w-full"
                        aria-label={`Open external link to ${link.platform}`}
                      >
                        <span className="truncate">{link.url}</span>
                        <span className="text-[10px] shrink-0">↗</span>
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Order Controls, Visibility Toggle, Actions */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    {/* Move Up / Move Down Controls (Accessible requirement 20, 41, 42) */}
                    <div className="flex items-center gap-1 bg-[#131926] p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => handleMove(link.id, 'up')}
                        disabled={isFirst || isMoving}
                        aria-label={`Move ${link.platform} up in public order`}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-mono transition-colors ${
                          isFirst || isMoving
                            ? 'text-slate-600 cursor-not-allowed'
                            : 'text-slate-300 hover:text-amber-400 hover:bg-white/10'
                        }`}
                      >
                        ▲
                      </button>
                      <span className="text-[10px] font-mono text-slate-500 select-none">|</span>
                      <button
                        type="button"
                        onClick={() => handleMove(link.id, 'down')}
                        disabled={isLast || isMoving}
                        aria-label={`Move ${link.platform} down in public order`}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-mono transition-colors ${
                          isLast || isMoving
                            ? 'text-slate-600 cursor-not-allowed'
                            : 'text-slate-300 hover:text-amber-400 hover:bg-white/10'
                        }`}
                      >
                        ▼
                      </button>
                    </div>

                    {/* Enable / Disable Switch (Requirement 21) */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={link.enabled}
                      aria-label={`Toggle visibility for ${link.platform}`}
                      onClick={() => handleToggle(link.id, link.enabled)}
                      disabled={isToggling}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-ring ${
                        link.enabled ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          link.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEditClick(link)}
                        className="text-xs font-mono h-8 px-2.5 hover:text-amber-400 min-h-[36px]"
                        aria-label={`Edit ${link.platform} details`}
                      >
                        ✏️ Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() => onDeleteClick(link)}
                        className="h-8 px-2.5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono transition-colors min-h-[36px] flex items-center gap-1"
                        aria-label={`Delete ${link.platform}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
