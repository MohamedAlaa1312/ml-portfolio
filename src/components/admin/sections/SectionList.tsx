'use client';

import React from 'react';
import { SectionRow } from './SectionRow';
import type { Section } from '@/lib/supabase/types';

interface SectionListProps {
  sections: Section[];
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggle: (section: Section) => void;
  onEdit: (section: Section) => void;
  loading?: boolean;
}

export const SectionList: React.FC<SectionListProps> = ({
  sections,
  onMoveUp,
  onMoveDown,
  onToggle,
  onEdit,
  loading = false,
}) => {
  if (sections.length === 0) {
    return (
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-10 text-center space-y-3">
        <span className="text-3xl">📑</span>
        <h4 className="text-base font-bold text-slate-100">No Sections Found</h4>
        <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
          The public portfolio sections table appears to be empty. Please verify your database seed
          or configuration to load the core sections.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 relative">
      {loading && (
        <div className="absolute inset-0 bg-[#080B11]/50 backdrop-blur-[1px] z-10 rounded-2xl flex items-center justify-center">
          <div className="flex items-center gap-2 bg-[#0D111A] border border-white/10 px-4 py-2 rounded-xl text-xs font-mono text-amber-400">
            <span className="animate-spin">⏳</span>
            <span>Updating section configuration...</span>
          </div>
        </div>
      )}

      {sections.map((section, index) => (
        <SectionRow
          key={section.id || section.slug}
          section={section}
          index={index}
          totalSections={sections.length}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onToggle={onToggle}
          onEdit={onEdit}
          loading={loading}
        />
      ))}
    </div>
  );
};
