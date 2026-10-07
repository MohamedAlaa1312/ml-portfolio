'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import type { Section } from '@/lib/supabase/types';

interface SectionRowProps {
  section: Section;
  index: number;
  totalSections: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggle: (section: Section) => void;
  onEdit: (section: Section) => void;
  loading?: boolean;
}

const SECTION_ICONS: Record<string, string> = {
  hero: '👤',
  about: '📝',
  experience: '💼',
  skills: '🛠️',
  projects: '🚀',
  certifications: '📜',
  contact: '✉️',
};

const SECTION_CMS_LINKS: Record<string, { label: string; href: string }> = {
  hero: { label: 'Profile & Hero', href: '/admin/profile' },
  about: { label: 'About CMS', href: '/admin/about' },
  experience: { label: 'Experience CMS', href: '/admin/experience' },
  skills: { label: 'Skills CMS', href: '/admin/skills' },
  projects: { label: 'Projects CMS', href: '/admin/projects' },
  certifications: { label: 'Certifications CMS', href: '/admin/certifications' },
  contact: { label: 'Contact CMS', href: '/admin/contact' },
};

export const SectionRow: React.FC<SectionRowProps> = ({
  section,
  index,
  totalSections,
  onMoveUp,
  onMoveDown,
  onToggle,
  onEdit,
  loading = false,
}) => {
  const isFirst = index === 0;
  const isLast = index === totalSections - 1;
  const isHero = section.type === 'hero' || section.slug === 'hero';
  const icon = SECTION_ICONS[section.type] || '📑';
  const cmsLink = SECTION_CMS_LINKS[section.type];

  return (
    <div
      className={`group bg-[#0D111A] border transition-all rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        section.enabled
          ? 'border-white/10 hover:border-amber-500/30'
          : 'border-white/5 opacity-70 bg-[#0A0D14]'
      }`}
    >
      {/* Left: Order badge + Identity */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
        {/* Deterministic Order Number */}
        <div
          className={`w-9 h-9 rounded-xl border font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
            section.enabled
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-white/5 border-white/10 text-slate-400'
          }`}
          title={`Display Sequence #${section.display_order}`}
        >
          #{section.display_order}
        </div>

        {/* Section Icon & Titles */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base select-none" aria-hidden="true">
              {icon}
            </span>
            <h4 className="text-sm font-bold text-slate-100 truncate">{section.title}</h4>

            {/* Section Type Badge */}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/5 text-slate-400 border border-white/5">
              {section.type}
            </span>

            {/* Stable Anchor Slug */}
            <span className="text-[11px] font-mono text-amber-500/80">
              #{section.slug}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Publication Lifecycle Status Badge */}
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                section.status === 'published'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : section.status === 'draft'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
              }`}
            >
              ● {section.status.toUpperCase()}
            </span>

            {/* Visibility State Badge */}
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                section.enabled
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {section.enabled ? 'VISIBLE' : 'DISABLED'}
            </span>

            {/* Dedicated CMS Editor Shortcut */}
            {cmsLink && (
              <Link
                href={cmsLink.href}
                className="text-[11px] font-mono text-slate-400 hover:text-amber-400 hover:underline transition-colors flex items-center gap-1"
                title={`Open ${cmsLink.label}`}
              >
                <span>Edit Content</span>
                <span>↗</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center justify-between md:justify-end gap-2.5 sm:gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
        {/* Accessible Move Up / Down Buttons (Requirement 8, 40) */}
        <div className="flex items-center gap-1 bg-[#080B11] border border-white/10 rounded-xl p-1">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={isFirst || loading}
            aria-label={`Move ${section.title} section up`}
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors focus-ring cursor-pointer ${
              isFirst || loading
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-amber-400 hover:bg-white/5 active:scale-95'
            }`}
            title="Move Up"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={isLast || loading}
            aria-label={`Move ${section.title} section down`}
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors focus-ring cursor-pointer ${
              isLast || loading
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-amber-400 hover:bg-white/5 active:scale-95'
            }`}
            title="Move Down"
          >
            ▼
          </button>
        </div>

        {/* Enable / Disable Toggle (Requirement 12, 13) */}
        {isHero ? (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono select-none"
            title="The Hero section provides the critical viewport identity and cannot be disabled to protect public portfolio integrity."
          >
            <span>🔒</span>
            <span className="text-[11px] font-semibold">Core Identity</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onToggle(section)}
            disabled={loading}
            aria-label={
              section.enabled
                ? `Disable ${section.title} section`
                : `Enable ${section.title} section`
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors focus-ring cursor-pointer ${
              section.enabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                section.enabled ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span>{section.enabled ? 'Enabled' : 'Disabled'}</span>
          </button>
        )}

        {/* Edit Metadata Modal Trigger */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(section)}
          disabled={loading}
          className="text-xs font-mono px-3"
          aria-label={`Edit metadata for ${section.title}`}
        >
          Edit
        </Button>
      </div>
    </div>
  );
};
