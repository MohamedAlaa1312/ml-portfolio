'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MediaFrame } from '@/components/ui/MediaFrame';
import type { Project } from '@/lib/supabase/types';

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onToggleEnabled: (project: Project) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  isReordering?: boolean;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onEdit,
  onDelete,
  onToggleEnabled,
  onReorder,
  isReordering = false,
}) => {
  const sorted = [...projects].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const newSorted = [...sorted];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSorted[index];
    newSorted[index] = newSorted[targetIndex];
    newSorted[targetIndex] = temp;

    const orderedIds = newSorted.map((p) => p.id);
    await onReorder(orderedIds);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 border border-dashed border-white/10 rounded-2xl bg-[#0D111A]">
        <p className="text-base font-semibold text-slate-200">No projects yet.</p>
        <p className="text-xs text-slate-400 mt-1">Add your real machine learning projects and model demos using the button above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((project, index) => {
        const isEnabled = project.enabled ?? (project.status === 'published');

        return (
          <Card
            key={project.id}
            variant="standard"
            className={`bg-[#0D111A] border-white/10 hover:border-white/20 transition-all ${
              !isEnabled || project.status === 'draft' ? 'opacity-75' : ''
            }`}
          >
            <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Media Thumbnail & Project Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
                {/* Thumbnail Preview */}
                <div className="w-24 sm:w-28 flex-shrink-0">
                  <MediaFrame
                    src={project.thumbnail_url || project.thumbnail || undefined}
                    alt={`Preview for ${project.title}`}
                    aspectRatio="16/9"
                    fallbackIcon="🚀"
                    className="border border-white/10 rounded-lg overflow-hidden"
                  />
                </div>

                {/* Project Details */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-100 text-base truncate">
                      {project.title}
                    </h3>

                    {/* Status Badge */}
                    {project.status === 'published' ? (
                      <Badge variant="success" dot className="text-[10px]">
                        Published
                      </Badge>
                    ) : project.status === 'draft' ? (
                      <Badge variant="default" className="text-[10px]">
                        Draft
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Archived
                      </Badge>
                    )}

                    {/* Featured Badge */}
                    {project.featured && (
                      <Badge variant="gold" className="text-[10px]">
                        Featured
                      </Badge>
                    )}

                    <span className="text-[11px] font-mono text-slate-400">
                      /{project.slug}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {project.short_description}
                  </p>

                  {/* Technology Tags */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {project.technologies.slice(0, 6).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 text-slate-300 border border-white/10"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 6 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{project.technologies.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions & Reordering Controls */}
              <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 w-full md:w-auto justify-end">
                {/* Reorder Buttons */}
                <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-white/5 mr-2">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0 || isReordering}
                    aria-label={`Move ${project.title} up`}
                    className="p-1.5 px-2 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors cursor-pointer text-xs"
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <div className="w-[1px] h-4 bg-white/10" />
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === sorted.length - 1 || isReordering}
                    aria-label={`Move ${project.title} down`}
                    className="p-1.5 px-2 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors cursor-pointer text-xs"
                    title="Move Down"
                  >
                    ▼
                  </button>
                </div>

                {/* Inline Toggle Button */}
                <button
                  type="button"
                  onClick={() => onToggleEnabled(project)}
                  className={`p-1.5 px-2.5 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                    isEnabled
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                  title={isEnabled ? 'Click to disable' : 'Click to enable'}
                >
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </button>

                {/* Edit Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(project)}
                >
                  Edit
                </Button>

                {/* Delete Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(project)}
                  className="text-red-400 hover:text-red-300 hover:border-red-500/30"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
