'use client';

import React from 'react';
import type { ThemeProjectsProps } from '../../types';

export const MonochromeProjects: React.FC<ThemeProjectsProps> = ({
  content,
  projectsList = [],
  sectionIndex,
}) => {
  const title = content?.title || 'Selected Projects';
  const subtitle =
    content?.subtitle ||
    'Documented case studies in deep learning architecture, statistical inference, and software engineering.';

  const list = projectsList
    .filter((p) => p.status === 'published' && p.enabled !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const secNum = String((sectionIndex ?? 4)).padStart(2, '0');

  return (
    <section
      id="projects"
      className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.15]"
    >
      {/* Stark Section Label */}
      <div className="pb-6 mb-12 sm:mb-16 border-b border-white/[0.12] flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#737373]">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">{secNum}</span>
          <span>—</span>
          <span className="text-white font-bold tracking-widest">PROJECTS</span>
        </div>
        <span>CASE STUDIES // WORKS</span>
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

      {/* Editorial Case-Study Full-Width Project Rows */}
      {list.length > 0 ? (
        <div className="divide-y divide-white/[0.15] border-t border-b border-white/[0.15]">
          {list.map((project, idx) => {
            const indexStr = String(idx + 1).padStart(2, '0');
            const hasLinks = Boolean(project.github_url || project.live_url);

            return (
              <article
                key={project.id}
                className="py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center group"
              >
                {/* Media Column (col-6) */}
                <div className="lg:col-span-6">
                  {project.thumbnail_url ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden border border-white/20 bg-[#0A0A0A]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.thumbnail_url}
                        alt={`Visual record for ${project.title}`}
                        className="w-full h-full object-cover filter grayscale contrast-125 brightness-95 group-hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full border border-white/20 bg-[#0A0A0A] flex items-center justify-center font-mono text-xs text-[#737373] uppercase tracking-widest">
                      {'// VISUAL SPECIFICATION'} {indexStr}
                    </div>
                  )}
                </div>

                {/* Details Column (col-6) */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#737373]">
                    <span className="text-white font-bold">PROJECT {indexStr}</span>
                    <span>PRODUCTION SYSTEM</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight group-hover:text-neutral-300 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-base text-[#A3A3A3] leading-relaxed">
                    {project.short_description}
                  </p>

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 border border-white/20 text-xs font-mono uppercase text-[#A3A3A3]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Links */}
                  {hasLinks && (
                    <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs font-mono uppercase tracking-wider">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-neutral-400 underline underline-offset-4 decoration-white/40 hover:decoration-white transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white inline-flex items-center gap-1"
                          aria-label={`Source repository for ${project.title}`}
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
                          className="text-white hover:text-neutral-400 underline underline-offset-4 decoration-white/40 hover:decoration-white transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white inline-flex items-center gap-1"
                          aria-label={`Live deployment for ${project.title}`}
                        >
                          <span>LIVE DEMO</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="p-8 border border-white/10 text-center text-xs font-mono text-[#737373]">
          NO CASE STUDY RECORDS AVAILABLE
        </div>
      )}
    </section>
  );
};
