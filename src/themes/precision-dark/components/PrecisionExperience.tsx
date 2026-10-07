'use client';

import React from 'react';
import type { ThemeExperienceProps } from '../../types';
import { formatExperienceDate } from '@/lib/date';

export const PrecisionExperience: React.FC<ThemeExperienceProps> = ({
  content,
  experienceList = [],
  sectionIndex,
}) => {
  const title = content?.title || 'Professional Experience';
  const subtitle =
    content?.subtitle ||
    'Chronological breakdown of engineering roles, production deliveries, and organizational impact.';

  const list = experienceList
    .filter((e) => e.enabled !== false && e.status !== 'archived')
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const secNum = String((sectionIndex ?? 2)).padStart(2, '0');

  return (
    <section
      id="experience"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.10]"
    >
      {/* Precision Dynamic Section Header */}
      <div className="flex items-center justify-between pb-4 mb-8 sm:mb-12 border-b border-white/[0.08] text-xs font-mono tracking-wider text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className="text-[#F59E0B] font-bold">{`[${secNum}]`}</span>
          <span className="text-white/20">{'//'}</span>
          <span className="text-[#F1F5F9] uppercase font-bold tracking-widest">EXPERIENCE</span>
        </div>
        <span className="text-[10px] text-[#94A3B8]">LEDGER: CAREER_TIMELINE</span>
      </div>

      <div className="space-y-3 mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Architectural Two-Column Experience Ledger */}
      {list.length > 0 ? (
        <div className="space-y-6">
          {list.map((exp, idx) => {
            const formattedStart = formatExperienceDate(exp.start_date);
            const formattedEnd = exp.is_current || exp.current_position ? 'Current' : formatExperienceDate(exp.end_date);
            const logoUrl = exp.company_logo || exp.company_logo_url;
            const expCode = `EXP.${String(idx + 1).padStart(2, '0')}`;

            return (
              <div
                key={exp.id}
                className="p-6 rounded-sm bg-[#0E1014] border border-white/[0.08] hover:border-[#F59E0B]/30 transition-all grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start group"
              >
                {/* Left Column: Organization & Timeline Metadata (col-4) */}
                <div className="lg:col-span-4 space-y-3 lg:border-r lg:border-white/[0.06] lg:pr-6">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                    <span>{expCode}</span>
                    {(exp.is_current || exp.current_position) && (
                      <span className="px-1.5 py-0.2 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase">
                        ACTIVE ROLE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt={`${exp.company} logo`}
                        className="w-8 h-8 rounded-sm object-contain bg-[#12151B] border border-white/10 p-0.5"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-sm bg-[#12151B] border border-white/10 flex items-center justify-center font-mono text-xs text-[#F1F5F9] font-bold">
                        {exp.company.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-[#F1F5F9]">
                        {exp.company}
                      </h3>
                      {exp.location && (
                        <p className="text-[11px] font-mono text-[#64748B]">
                          LOC: {exp.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dates & Employment Type */}
                  <div className="pt-2 text-xs font-mono text-[#94A3B8] space-y-1">
                    <div className="text-[#F59E0B] font-semibold">
                      {formattedStart} → {formattedEnd}
                    </div>
                    {exp.employment_type && (
                      <div className="text-[10px] uppercase text-[#64748B] tracking-wider">
                        TYPE // {exp.employment_type}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Role Title, Scope, Achievements, Technologies (col-8) */}
                <div className="lg:col-span-8 space-y-3">
                  <h4 className="text-lg sm:text-xl font-bold text-[#F1F5F9] group-hover:text-white transition-colors">
                    {exp.role}
                  </h4>

                  {exp.description && (
                    <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                      {exp.description}
                    </p>
                  )}

                  {/* Key Impact Items */}
                  {((exp.achievements && exp.achievements.length > 0) ||
                    (exp.responsibilities && exp.responsibilities.length > 0)) && (
                    <div className="pt-2 space-y-1.5">
                      {(exp.achievements && exp.achievements.length > 0
                        ? exp.achievements
                        : exp.responsibilities || []
                      ).map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#94A3B8]">
                          <span className="font-mono text-[#F59E0B] text-[10px] mt-0.5">▸</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Technology Chips */}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-sm bg-[#12151B] border border-white/[0.08] text-[10px] font-mono text-[#F1F5F9]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-sm bg-[#0E1014] border border-white/[0.08] text-center text-xs font-mono text-[#64748B]">
          NO EXPERIENCE RECORDS REGISTERED IN LEDGER
        </div>
      )}
    </section>
  );
};
