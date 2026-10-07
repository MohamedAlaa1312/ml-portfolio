'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tag } from '@/components/ui/Tag';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatExperienceRange } from '@/lib/date';
import type { Experience } from '@/lib/supabase/types';

interface ExperienceListProps {
  experiences: Experience[];
  onEdit: (exp: Experience) => void;
  onDelete: (exp: Experience) => void;
  onToggleEnabled: (exp: Experience) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onAddNew: () => void;
  isReordering?: boolean;
}

export const ExperienceList: React.FC<ExperienceListProps> = ({
  experiences,
  onEdit,
  onDelete,
  onToggleEnabled,
  onMoveUp,
  onMoveDown,
  onAddNew,
  isReordering = false,
}) => {
  if (experiences.length === 0) {
    return (
      <Card variant="standard" className="bg-[#0D111A] border-white/10 p-8 sm:p-12 text-center">
        <EmptyState
          icon="💼"
          title="No Professional Experience Recorded"
          description="Your portfolio experience timeline is currently empty. Add your career roles, achievements, and tech stack tags to publish them to the public site."
          actionLabel="+ Add First Experience"
          onAction={onAddNew}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {experiences.map((exp, index) => {
        const isFirst = index === 0;
        const isLast = index === experiences.length - 1;
        const logoUrl = exp.company_logo || exp.company_logo_url;
        const isOngoing = Boolean(exp.is_current ?? exp.current_position);
        const dateRange = formatExperienceRange(exp.start_date, exp.end_date, isOngoing);

        return (
          <Card
            key={exp.id}
            variant="standard"
            className={`bg-[#0D111A] border-white/10 transition-all ${
              !exp.enabled ? 'opacity-65' : ''
            }`}
          >
            <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left Column: Reorder Controls + Company Logo + Role Information */}
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Accessible Reorder buttons */}
                <div className="flex flex-col gap-1 items-center shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onMoveUp(index)}
                    disabled={isFirst || isReordering}
                    aria-label={`Move ${exp.role} at ${exp.company} up`}
                    className="w-7 h-7 rounded-lg bg-[#131926] border border-white/10 flex items-center justify-center text-xs text-slate-400 hover:text-amber-400 hover:border-amber-500/30 disabled:opacity-25 disabled:cursor-not-allowed focus-ring transition-colors cursor-pointer"
                  >
                    ▲
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 select-none">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => onMoveDown(index)}
                    disabled={isLast || isReordering}
                    aria-label={`Move ${exp.role} at ${exp.company} down`}
                    className="w-7 h-7 rounded-lg bg-[#131926] border border-white/10 flex items-center justify-center text-xs text-slate-400 hover:text-amber-400 hover:border-amber-500/30 disabled:opacity-25 disabled:cursor-not-allowed focus-ring transition-colors cursor-pointer"
                  >
                    ▼
                  </button>
                </div>

                {/* Company Logo or Monogram */}
                <div className="w-12 h-12 rounded-xl bg-[#131926] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={`${exp.company} logo`}
                      className="w-full h-full object-contain p-1.5"
                    />
                  ) : (
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {exp.company.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Title & Metadata */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                      {exp.role}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      at <span className="text-amber-400 font-semibold">{exp.company}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-400">
                    <span>{dateRange}</span>
                    {exp.employment_type && (
                      <span>• {exp.employment_type}</span>
                    )}
                    {exp.location && (
                      <span className="text-slate-500">({exp.location})</span>
                    )}
                  </div>

                  {/* Tech stack pills */}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {exp.technologies.slice(0, 5).map((tech) => (
                        <Tag key={tech} className="text-[10px] py-0.5 px-2 bg-[#131926]">
                          {tech}
                        </Tag>
                      ))}
                      {exp.technologies.length > 5 && (
                        <span className="text-[10px] font-mono text-slate-500 self-center">
                          +{exp.technologies.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Achievements indicator */}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="pt-1 text-[11px] font-mono text-emerald-400/90 flex items-center gap-1.5">
                      <span>✔</span>
                      <span>{exp.achievements.length} highlighted achievement{exp.achievements.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Status Badges, Visibility Switch & Action Buttons */}
              <div className="flex flex-row md:flex-col lg:flex-row items-center justify-between md:items-end lg:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/5 shrink-0">
                {/* Badges */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      exp.status === 'published'
                        ? 'success'
                        : exp.status === 'draft'
                        ? 'gold'
                        : 'outline'
                    }
                    dot={exp.status === 'published'}
                  >
                    {exp.status.toUpperCase()}
                  </Badge>

                  {/* Enable/Disable toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleEnabled(exp)}
                    aria-label={`Toggle enabled state for ${exp.role}`}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono border transition-colors cursor-pointer ${
                      exp.enabled
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {exp.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(exp)}
                    className="text-xs min-h-[36px]"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(exp)}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 min-h-[36px]"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
