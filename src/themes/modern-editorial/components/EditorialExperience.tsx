'use client';

import React from 'react';
import type { ThemeExperienceProps } from '../../types';
import { formatExperienceDate } from '@/lib/date';

export const EditorialExperience: React.FC<ThemeExperienceProps> = ({
  content,
  experienceList = [],
}) => {
  const badge = content?.badge || 'TRAJECTORY // 02';
  const title = content?.title || 'Professional Experience';
  const subtitle =
    content?.subtitle ||
    'Engineering roles, applied research positions, and industry collaborations.';

  const list = experienceList
    .filter((e) => e.enabled !== false && e.status !== 'archived')
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <section
      id="experience"
      className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.08]"
    >
      {/* Editorial Section Header */}
      <div className="pb-8 mb-12 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#71717A]">
        <div className="flex items-center gap-2">
          <span className="text-[#C25E34]">02</span>
          <span>/</span>
          <span>EXPERIENCE</span>
        </div>
        <span>{badge}</span>
      </div>

      <div className="space-y-4 mb-16">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#EDEDEC] leading-tight font-sans">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base text-[#A1A1AA] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Editorial Structured Vertical Timeline List */}
      {list.length > 0 ? (
        <div className="divide-y divide-white/[0.08]">
          {list.map((exp) => {
            const formattedStart = formatExperienceDate(exp.start_date);
            const formattedEnd = exp.is_current || exp.current_position ? 'Present' : formatExperienceDate(exp.end_date);
            const logoUrl = exp.company_logo || exp.company_logo_url;

            return (
              <div
                key={exp.id}
                className="py-10 first:pt-0 last:pb-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start group"
              >
                {/* Left Column: Dates, Company Meta, Logo (col-4) */}
                <div className="lg:col-span-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt={`${exp.company} logo`}
                        className="w-8 h-8 rounded object-contain bg-[#17191E] border border-white/10 p-0.5"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-[#17191E] border border-white/10 flex items-center justify-center font-mono text-xs text-[#A1A1AA] uppercase">
                        {exp.company.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-semibold text-[#EDEDEC]">
                        {exp.company}
                      </h3>
                      {exp.location && (
                        <p className="text-xs font-mono text-[#71717A]">
                          {exp.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date & Employment Type */}
                  <div className="pt-1 text-xs font-mono text-[#A1A1AA] flex flex-wrap items-center gap-2">
                    <span className="text-[#C25E34]">
                      {formattedStart} — {formattedEnd}
                    </span>
                    {exp.employment_type && (
                      <>
                        <span className="text-white/20">•</span>
                        <span className="uppercase text-[#71717A] text-[11px]">
                          {exp.employment_type}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column: Role Title, Description, Achievements, Tech Tags (col-8) */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-xl sm:text-2xl font-semibold text-[#EDEDEC] group-hover:text-white transition-colors">
                      {exp.role}
                    </h4>
                    {(exp.is_current || exp.current_position) && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#C25E34]/15 border border-[#C25E34]/30 text-[#D97746]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C25E34] animate-pulse" />
                        Current
                      </span>
                    )}
                  </div>

                  {/* Summary / Description */}
                  {exp.description && (
                    <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
                      {exp.description}
                    </p>
                  )}

                  {/* Responsibilities or Key Achievements */}
                  {((exp.achievements && exp.achievements.length > 0) ||
                    (exp.responsibilities && exp.responsibilities.length > 0)) && (
                    <ul className="space-y-2 pt-2 text-sm text-[#A1A1AA]">
                      {(exp.achievements && exp.achievements.length > 0
                        ? exp.achievements
                        : exp.responsibilities || []
                      ).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="text-[#C25E34] font-mono text-xs select-none mt-0.5">—</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Technologies Tags */}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded bg-[#17191E] border border-white/[0.08] text-[11px] font-mono text-[#A1A1AA]"
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
        <div className="p-8 rounded bg-[#121417] border border-white/[0.08] text-center text-xs font-mono text-[#71717A]">
          NO EXPERIENCE RECORDS SPECIFIED
        </div>
      )}
    </section>
  );
};
