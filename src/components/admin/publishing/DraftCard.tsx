'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import type { CmsDraft } from '@/lib/supabase/types';

interface DraftCardProps {
  draft: CmsDraft;
  onPublish: (draft: CmsDraft) => void;
  onDiscard: (draft: CmsDraft) => void;
  loading?: boolean;
}

const ENTITY_ICONS: Record<string, string> = {
  site_settings: '👤',
  sections_order: '🗂️',
  section: '📑',
  project: '🚀',
  experience: '💼',
  certification: '📜',
  skill: '🛠️',
  social_link: '✉️',
};

const ENTITY_LABELS: Record<string, string> = {
  site_settings: 'Profile & Hero',
  sections_order: 'Sections Pipeline',
  section: 'Section Config',
  project: 'Projects',
  experience: 'Experience',
  certification: 'Certifications',
  skill: 'Skills',
  social_link: 'Social Link',
};

export const DraftCard: React.FC<DraftCardProps> = ({
  draft,
  onPublish,
  onDiscard,
  loading = false,
}) => {
  const icon = ENTITY_ICONS[draft.entity_type] || '📑';
  const label = ENTITY_LABELS[draft.entity_type] || draft.entity_type;

  return (
    <div className="bg-[#0D111A] border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
      {/* Left: Icon, Badge, Identity, and Summary */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-100 truncate">{draft.title}</h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {label}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Draft
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono mt-1 truncate max-w-xl">
            {draft.summary || 'Unpublished modifications staged for preview and publication.'}
          </p>

          <span className="text-[11px] font-mono text-slate-500 block mt-1">
            Target Entity ID: #{draft.entity_id} • Staged: {new Date(draft.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
        <Link
          href="/admin/preview"
          className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-amber-500/40 text-xs font-mono text-slate-300 hover:text-amber-400 transition-colors focus-ring"
        >
          Preview ↗
        </Link>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onDiscard(draft)}
          disabled={loading}
          className="text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-white/10"
        >
          Discard
        </Button>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => onPublish(draft)}
          disabled={loading}
          className="text-xs font-mono bg-amber-500 hover:bg-amber-400 text-black font-bold"
        >
          Publish
        </Button>
      </div>
    </div>
  );
};
