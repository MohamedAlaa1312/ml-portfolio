'use client';

import React, { useState } from 'react';
import type { ThemeProjectsProps } from '../../types';
import type { Project } from '@/lib/supabase/types';
import { ProjectDetailsModal } from '@/components/ui/ProjectDetailsModal';

export const EditorialProjects: React.FC<ThemeProjectsProps> = ({
  content,
  projectsList = [],
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
                onClick={() => setSelectedProject(project)}
                className="group rounded bg-[#121417] border border-white/[0.08] hover:border-white/[0.25] transition-all flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-black/60"
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

                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xl font-semibold text-[#EDEDEC] group-hover:text-white transition-colors">
                        {project.title}
                      </h3>
                      <span className="text-xs font-mono text-[#C25E34] opacity-75 group-hover:opacity-100 transition-opacity shrink-0">
                        ↗
                      </span>
                    </div>

                    <p className="text-sm text-[#A1A1AA] leading-relaxed line-clamp-3">
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

                {/* Editorial Actions (Details, GitHub, Live URL) */}
                <div className="px-6 sm:px-7 py-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                    }}
                    className="text-[#EDEDEC] hover:text-[#C25E34] transition-colors inline-flex items-center gap-1 font-semibold"
                  >
                    <span>CASE DETAILS</span>
                    <span>↗</span>
                  </button>

                  <div className="flex items-center gap-4 ml-auto">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#A1A1AA] hover:text-[#EDEDEC] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C25E34] rounded inline-flex items-center gap-1"
                        aria-label={`Source code for ${project.title}`}
                      >
                        <span>SOURCE</span>
                        <span>↗</span>
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#C25E34] hover:text-[#D97746] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C25E34] rounded inline-flex items-center gap-1"
                        aria-label={`Live system for ${project.title}`}
                      >
                        <span>DEMO</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded bg-[#121417] border border-white/[0.08] text-center text-xs font-mono text-[#71717A]">
          NO PUBLISHED PROJECTS FOUND
        </div>
      )}

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};
