import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card, CardContent } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { TextLink } from '@/components/ui/TextLink';
import { MediaFrame } from '@/components/ui/MediaFrame';
import type { Project, ProjectsContent } from '@/lib/supabase/types';

interface ProjectsSectionProps {
  content?: ProjectsContent;
  projectsList?: Project[];
}

import { EmptyState } from '@/components/ui/EmptyState';

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  content,
  projectsList,
}) => {
  const badge = content?.badge || 'Portfolio';
  const title = content?.title || 'Featured Projects';
  const subtitle =
    content?.subtitle ||
    'A collection of projects that showcase my skills and experience in machine learning and software engineering.';

  // Source of truth: CMS data (no synthetic fallback if DB returns empty list)
  const list = (projectsList !== undefined ? projectsList : [])
    .filter((p) => p.status === 'published' && p.enabled !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <section id="projects" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/5">
      <SectionHeading badge={badge} title={title} subtitle={subtitle} />

      {list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 sm:mt-10">
          {list.map((project) => (
            <Card
              key={project.id}
              variant="interactive"
              className="group flex flex-col justify-between"
            >
              <div>
                {/* Media Thumbnail */}
                <MediaFrame
                  src={project.thumbnail_url}
                  alt={`Preview for ${project.title}`}
                  aspectRatio="16/9"
                  fallbackIcon="📊"
                  className="border-b border-white/10 rounded-b-none"
                />

                <CardContent className="p-6 space-y-3">
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {project.short_description}
                  </p>

                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.technologies.map((tech) => (
                      <Tag key={tech} className="text-[11px]">
                        {tech}
                      </Tag>
                    ))}
                  </div>
                </CardContent>
              </div>

              {/* Action Links */}
              <div className="p-6 pt-0 flex items-center justify-between border-t border-white/5 text-xs font-mono">
                {project.github_url && (
                  <TextLink
                    href={project.github_url}
                    isExternal
                    variant="amber"
                    aria-label={`View source code for ${project.title}`}
                  >
                    Source Code ↗
                  </TextLink>
                )}
                {project.live_url && (
                  <TextLink
                    href={project.live_url}
                    isExternal
                    variant="subtle"
                    aria-label={`View live demo for ${project.title}`}
                  >
                    Live Demo ↗
                  </TextLink>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto mt-8 sm:mt-10">
          <EmptyState
            title="No Published Projects"
            description="Projects and machine learning models will appear here once published from the CMS."
            icon="🚀"
          />
        </div>
      )}
    </section>
  );
};
