'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ProjectList } from './ProjectList';
import { ProjectForm } from './ProjectForm';
import type { Project, Skill } from '@/lib/supabase/types';

interface ProjectsManagerProps {
  initialProjects: Project[];
  availableSkills?: Skill[];
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  initialProjects,
  availableSkills = [],
}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [featuredFilter, setFeaturedFilter] = useState<string>('ALL');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Operation states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((current) => (current?.message === message ? null : current));
    }, 5000);
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        p.title.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.technologies && p.technologies.some((t) => t.toLowerCase().includes(q)));

      const matchesStatus =
        statusFilter === 'ALL' || p.status === statusFilter;

      const matchesFeatured =
        featuredFilter === 'ALL' || (featuredFilter === 'featured' && p.featured);

      return matchesSearch && matchesStatus && matchesFeatured;
    });
  }, [projects, searchQuery, statusFilter, featuredFilter]);

  // Statistics
  const totalCount = projects.length;
  const publishedCount = projects.filter((p) => p.status === 'published' && p.enabled !== false).length;
  const draftCount = projects.filter((p) => p.status === 'draft' || p.enabled === false).length;
  const featuredCount = projects.filter((p) => p.featured).length;

  // ---------------------------------------------------------------------------
  // CRUD OPERATIONS
  // ---------------------------------------------------------------------------

  const handleSave = async (payload: Partial<Project>) => {
    setIsSaving(true);
    setFeedback(null);

    try {
      const isEdit = Boolean(editingProject?.id);
      const url = isEdit ? `/api/admin/projects/${editingProject!.id}` : '/api/admin/projects';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save project.');
      }

      if (isEdit) {
        setProjects((prev) => prev.map((p) => (p.id === data.project.id ? data.project : p)));
        showFeedback('success', `Project "${data.project.title}" updated successfully.`);
      } else {
        setProjects((prev) => [...prev, data.project]);
        showFeedback('success', `Project "${data.project.title}" created successfully.`);
      }

      setIsFormOpen(false);
      setEditingProject(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      showFeedback('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEnabled = async (project: Project) => {
    try {
      const currentlyEnabled = project.enabled ?? (project.status === 'published');
      const nextEnabled = !currentlyEnabled;
      const nextStatus = nextEnabled ? 'published' : 'draft';

      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: nextEnabled,
          status: nextStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle project state.');
      }

      setProjects((prev) => prev.map((p) => (p.id === project.id ? data.project : p)));
      showFeedback(
        'success',
        `Project "${project.title}" is now ${nextEnabled ? 'enabled (published)' : 'disabled (draft)'}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Toggle failed';
      showFeedback('error', msg);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/projects/${deletingProject.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete project.');
      }

      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      showFeedback('success', `Project "${deletingProject.title}" was removed.`);
      setDeletingProject(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      showFeedback('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (orderedIds: string[]) => {
    setIsReordering(true);
    try {
      const res = await fetch('/api/admin/projects/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reorder projects.');
      }

      setProjects((prev) => {
        const orderMap = new Map<string, number>();
        orderedIds.forEach((id, idx) => orderMap.set(id, idx + 1));

        return prev.map((p) => {
          if (orderMap.has(p.id)) {
            return { ...p, display_order: orderMap.get(p.id)! };
          }
          return p;
        });
      });

      showFeedback('success', 'Projects reordered successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reordering failed';
      showFeedback('error', msg);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm transition-all duration-300 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-200 cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">
            Projects
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage the machine learning models, research demos, and repositories displayed in your public portfolio.
          </p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="accent" dot>
              {totalCount} Total Projects
            </Badge>
            <Badge variant="success">
              {publishedCount} Published
            </Badge>
            <Badge variant="default">
              {draftCount} Draft / Hidden
            </Badge>
            <Badge variant="gold">
              {featuredCount} Featured
            </Badge>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setEditingProject(null);
            setIsFormOpen(true);
          }}
        >
          + Add Project
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="sm:col-span-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, description, or technology..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
              { value: 'archived', label: 'Archived' },
            ]}
          />

          <Select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Items' },
              { value: 'featured', label: 'Featured Only' },
            ]}
          />
        </div>
      </div>

      {/* Project List */}
      <ProjectList
        projects={filteredProjects}
        onEdit={(proj) => {
          setEditingProject(proj);
          setIsFormOpen(true);
        }}
        onDelete={(proj) => setDeletingProject(proj)}
        onToggleEnabled={handleToggleEnabled}
        onReorder={handleReorder}
        isReordering={isReordering}
      />

      {/* --------------------------------------------------------------------- */}
      {/* MODALS */}
      {/* --------------------------------------------------------------------- */}

      {/* 1. Create / Edit Project Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProject(null);
        }}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        description={
          editingProject
            ? `Modify project metadata, technologies, and links for "${editingProject.title}".`
            : 'Add a new Machine Learning project or demo to your portfolio.'
        }
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <ProjectForm
          initialData={editingProject}
          availableSkills={availableSkills}
          onSubmit={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingProject(null);
          }}
          isLoading={isSaving}
        />
      </Modal>

      {/* 2. Destructive Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            You are about to permanently remove{' '}
            <strong className="text-slate-100">{deletingProject?.title}</strong> (
            <span className="font-mono text-xs text-amber-400">/{deletingProject?.slug}</span>
            ).
          </p>

          <p className="text-xs text-slate-400">
            This project will immediately disappear from your public portfolio and admin database.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setDeletingProject(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
