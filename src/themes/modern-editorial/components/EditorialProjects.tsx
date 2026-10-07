'use client';

import React from 'react';
import type { ThemeProjectsProps } from '../../types';

export const EditorialProjects: React.FC<ThemeProjectsProps> = ({
  content,
  projectsList = [],
}) => {
  const badge = content?.badge || 'SELECTED WORKS // 04';
  const title = content?.title || 'Featured Projects';
  const subtitle =
    content?.subtitle ||
    'Architected machine learning systems, deep neural models, and scalable algorithmic pipelines.';

  const list = projectsList
    .filter((p) => p.status === 'published' && p.enabled !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <section
      id="projects"
      className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.08]"
    >
      {/* Editorial Section Header */}
      <div className="pb-8 mb-12 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#71717A]">
        <div className="flex items-center gap-2">
          <span className="text-[#C25E34]">04</span>
          <span>/</span>
          <span>PROJECTS</span>
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

      {list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {list.map((project, idx) => {
            const indexStr = String(idx + 1).padStart(2, '0');
            const hasLinks = Boolean(project.github_url || project.live_url);

            return (
              <article
                key={project.id}
                className="group rounded bg-[#121417] border border-white/[0.08] hover:border-white/[0.2] transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Media Frame */}
                  {project.thumbnail_url ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#17191E] border-b border-white/[0.08]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.thumbnail_url}
                        alt={`Preview for ${project.title}`}
                        className="w-full h-full object-cover filter contrast-[1.02] group-hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-[#17191E] border-b border-white/[0.08] flex items-center justify-center font-mono text-xs text-[#71717A] uppercase tracking-wider">
                      SPEC // {indexStr}
                    </div>
                  )}

                  {/* Editorial Card Content */}
                  <div className="p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-[#71717A]">
                      <span>SYSTEM // {indexStr}</span>
                      <span className="text-[#C25E34]">PRODUCTION</span>
                    </div>

                    <h3 className="text-xl font-semibold text-[#EDEDEC] group-hover:text-white transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-sm text-[#A1A1AA] leading-relaxed">
                      {project.short_description}
                    </p>

                    {/* Tech Stack Chips */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded bg-[#17191E] border border-white/[0.06] text-[11px] font-mono text-[#A1A1AA]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Editorial Actions (GitHub, Live URL) */}
                {hasLinks && (
                  <div className="px-6 sm:px-7 py-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#A1A1AA] hover:text-[#EDEDEC] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C25E34] rounded inline-flex items-center gap-1"
                        aria-label={`Source code for ${project.title}`}
                      >
                        <span>SOURCE CODE</span>
                        <span>↗</span>
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C25E34] hover:text-[#D97746] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C25E34] rounded inline-flex items-center gap-1 ml-auto"
                        aria-label={`Live system for ${project.title}`}
                      >
                        <span>LIVE SYSTEM</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded bg-[#121417] border border-white/[0.08] text-center text-xs font-mono text-[#71717A]">
          NO PUBLISHED PROJECTS FOUND
        </div>
      )}
    </section>
  );
};
