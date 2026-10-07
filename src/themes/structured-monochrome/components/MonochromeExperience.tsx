'use client';

import React from 'react';
import type { ThemeExperienceProps } from '../../types';
import { formatExperienceDate } from '@/lib/date';

export const MonochromeExperience: React.FC<ThemeExperienceProps> = ({
  content,
  experienceList = [],
  sectionIndex,
}) => {
  const title = content?.title || 'Professional Timeline';
  const subtitle =
    content?.subtitle ||
    'Chronological case studies of engineering roles, production deliveries, and technical leadership.';

  const list = experienceList
    .filter((e) => e.enabled !== false && e.status !== 'archived')
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const secNum = String((sectionIndex ?? 2)).padStart(2, '0');

  return (
    <section
      id="experience"
      className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.15]"
    >
      {/* Stark Section Label */}
      <div className="pb-6 mb-12 sm:mb-16 border-b border-white/[0.12] flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#737373]">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">{secNum}</span>
          <span>—</span>
          <span className="text-white font-bold tracking-widest">EXPERIENCE</span>
        </div>
        <span>CHRONOLOGY // ROLES</span>
      </div>

      <div className="space-y-4 mb-16">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base text-[#A3A3A3] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bold Case-Study Timeline Strips */}
      {list.length > 0 ? (
        <div className="divide-y divide-white/[0.15] border-t border-b border-white/[0.15]">
          {list.map((exp, idx) => {
            const formattedStart = formatExperienceDate(exp.start_date);
            const formattedEnd = exp.is_current || exp.current_position ? 'PRESENT' : formatExperienceDate(exp.end_date)?.toUpperCase();
            const logoUrl = exp.company_logo || exp.company_logo_url;
            const indexStr = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={exp.id}
                className="py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start group"
              >
                {/* Left Column: Large Year & Company Lockup (col-4) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="text-xs font-mono text-[#737373] tracking-widest uppercase">
                    NO. {indexStr}
                  </div>

                  <div className="text-xl sm:text-2xl font-black font-sans tracking-tight text-white uppercase">
                    {formattedStart} — {formattedEnd}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt={`${exp.company} logo`}
                        className="w-7 h-7 object-contain filter grayscale contrast-125 border border-white/20 p-0.5"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-7 h-7 border border-white/20 flex items-center justify-center font-mono text-[10px] text-white font-bold">
                        {exp.company.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-tight">
                        {exp.company}
                      </h3>
                      {exp.location && (
                        <p className="text-xs font-mono text-[#737373]">
                          {exp.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {exp.employment_type && (
                    <div className="text-[11px] font-mono uppercase tracking-widest text-[#737373]">
                      {'//'} {exp.employment_type}
                    </div>
                  )}
                </div>

                {/* Right Column: Role Title, Narrative, Achievements, Tech Tags (col-8) */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h4 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight group-hover:text-neutral-300 transition-colors">
                      {exp.role}
                    </h4>
                    {(exp.is_current || exp.current_position) && (
                      <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 border border-white text-white">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {exp.description && (
                    <p className="text-base text-[#A3A3A3] leading-relaxed pt-1">
                      {exp.description}
                    </p>
                  )}

                  {/* Bullet achievements / responsibilities */}
                  {((exp.achievements && exp.achievements.length > 0) ||
                    (exp.responsibilities && exp.responsibilities.length > 0)) && (
                    <ul className="space-y-2 pt-2 text-sm text-[#A3A3A3]">
                      {(exp.achievements && exp.achievements.length > 0
                        ? exp.achievements
                        : exp.responsibilities || []
                      ).map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="font-mono text-white text-xs select-none">■</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Technologies Tags in Minimal Outlined Style */}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 border border-white/20 text-xs font-mono uppercase text-[#A3A3A3]"
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
        <div className="p-8 border border-white/10 text-center text-xs font-mono text-[#737373]">
          NO CHRONOLOGICAL RECORDS AVAILABLE
        </div>
      )}
    </section>
  );
};
