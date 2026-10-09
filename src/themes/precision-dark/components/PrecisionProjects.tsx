'use client';

import React, { useState } from 'react';
import type { ThemeProjectsProps } from '../../types';
import type { Project } from '@/lib/supabase/types';
import { ProjectDetailsModal } from '@/components/ui/ProjectDetailsModal';

export const PrecisionProjects: React.FC<ThemeProjectsProps> = ({
  content,
  projectsList = [],
  sectionIndex,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const title = content?.title || 'Applied Engineering Systems';
  const subtitle =
    content?.subtitle ||
    'Production machine learning deployments, deep neural model architectures, and data engineering solutions.';

  const list = projectsList
    .filter((p) => p.status === 'published' && p.enabled !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const secNum = String((sectionIndex ?? 4)).padStart(2, '0');

  return (
    <section
      id="projects"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.10]"
    >
      {/* Precision Dynamic Section Header */}
      <div className="flex items-center justify-between pb-4 mb-8 sm:mb-12 border-b border-white/[0.08] text-xs font-mono tracking-wider text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className="text-[#F59E0B] font-bold">{`[${secNum}]`}</span>
          <span className="text-white/20">{'//'}</span>
          <span className="text-[#F1F5F9] uppercase font-bold tracking-widest">PROJECTS</span>
        </div>
        <span className="text-[10px] text-[#94A3B8]">INDEX: APPLIED_SYSTEMS</span>
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

      {list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {list.map((project, idx) => {
            const projectCode = `SYS.${String(idx + 1).padStart(2, '0')}`;
            const hasLinks = Boolean(project.github_url || project.live_url);

            return (
              <article
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="rounded-sm bg-[#0E1014] border border-white/[0.08] hover:border-[#F59E0B]/60 transition-all flex flex-col justify-between overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-black/50"
              >
                <div>
                  {/* Top Spec Header Bar */}
                  <div className="px-5 py-2.5 bg-[#12151B] border-b border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                    <span className="text-[#F59E0B] font-bold">{projectCode}</span>
                    <span className="group-hover:text-amber-400 transition-colors">CLICK FOR DETAILS // VIEW SPECS ↗</span>
                  </div>

                  {/* Media Frame */}
                  {project.thumbnail_url ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#12151B] border-b border-white/[0.06]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.thumbnail_url}
                        alt={`Preview for ${project.title}`}
                        className="w-full h-full object-cover filter contrast-[1.03] group-hover:scale-[1.02] transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-[#12151B] border-b border-white/[0.06] flex items-center justify-center font-mono text-[10px] text-[#64748B] uppercase tracking-wider">
                      SPECIFICATION BLUEPRINT // {projectCode}
                    </div>
                  )}

                  {/* Project Details */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-[#F1F5F9] font-sans group-hover:text-amber-400 transition-colors">
                        {project.title}
                      </h3>
                      <span className="text-xs font-mono text-[#F59E0B] opacity-75 group-hover:opacity-100 transition-opacity shrink-0">
                        ↗
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed line-clamp-3">
                      {project.short_description}
                    </p>

                    {/* Tech Stack Chips */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {project.technologies.map((tech) => (
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

                {/* Technical Links & Details Dock */}
                <div className="px-5 sm:px-6 py-3 bg-[#12151B] border-t border-white/[0.06] flex items-center justify-between text-xs font-mono flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                    }}
                    className="text-[#F1F5F9] hover:text-[#F59E0B] transition-colors inline-flex items-center gap-1 font-bold"
                  >
                    <span className="text-[#F59E0B]">[DETAILS]</span>
                    <span>OVERVIEW ↗</span>
                  </button>

                  <div className="flex items-center gap-4 ml-auto">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B] rounded-sm inline-flex items-center gap-1"
                        aria-label={`Source repository for ${project.title}`}
                      >
                        <span className="text-[#64748B]">[CODE]</span>
                        <span>REPO ↗</span>
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#F59E0B] hover:text-[#D97706] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B] rounded-sm inline-flex items-center gap-1"
                        aria-label={`Live system deployment for ${project.title}`}
                      >
                        <span className="text-[#F59E0B]/60">[LIVE]</span>
                        <span>SYSTEM ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-sm bg-[#0E1014] border border-white/[0.08] text-center text-xs font-mono text-[#64748B]">
          NO SYSTEMS LOGGED IN PRODUCTION DIRECTORY
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
