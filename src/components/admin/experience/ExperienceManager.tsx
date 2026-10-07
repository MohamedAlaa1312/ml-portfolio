'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ExperienceList } from './ExperienceList';
import { ExperienceForm } from './ExperienceForm';
import type { Experience } from '@/lib/supabase/types';

interface ExperienceManagerProps {
  initialExperiences: Experience[];
}

export const ExperienceManager: React.FC<ExperienceManagerProps> = ({
  initialExperiences,
}) => {
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [deletingExperience, setDeletingExperience] = useState<Experience | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Clear feedback after 5 seconds
  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((current) => (current?.message === message ? null : current));
    }, 5000);
  };

  // 1. CREATE EXPERIENCE
  const handleCreate = async (payload: Partial<Experience>) => {
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create experience entry.');
      }

      setExperiences([...experiences, data.experience]);
      setIsCreateOpen(false);
      showFeedback('success', `Experience at ${data.experience.company} added successfully.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Creation failed';
      showFeedback('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  // 2. UPDATE EXPERIENCE
  const handleUpdate = async (payload: Partial<Experience>) => {
    if (!editingExperience) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/experience/${editingExperience.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update experience entry.');
      }

      setExperiences(
        experiences.map((exp) => (exp.id === editingExperience.id ? data.experience : exp))
      );
      setEditingExperience(null);
      showFeedback('success', `Experience for ${data.experience.role} updated successfully.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      showFeedback('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  // 3. DELETE EXPERIENCE
  const confirmDelete = async () => {
    if (!deletingExperience) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/experience/${deletingExperience.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete experience.');
      }

      setExperiences(experiences.filter((exp) => exp.id !== deletingExperience.id));
      showFeedback(
        'success',
        `Successfully deleted ${deletingExperience.role} at ${deletingExperience.company}.`
      );
      setDeletingExperience(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed';
      showFeedback('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // 4. QUICK TOGGLE ENABLED
  const handleToggleEnabled = async (exp: Experience) => {
    const updatedState = !exp.enabled;
    const previous = [...experiences];

    // Optimistic update
    setExperiences(
      experiences.map((item) => (item.id === exp.id ? { ...item, enabled: updatedState } : item))
    );

    try {
      const res = await fetch(`/api/admin/experience/${exp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...exp, enabled: updatedState }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle visibility.');
      }

      showFeedback(
        'success',
        `"${exp.role} at ${exp.company}" is now ${updatedState ? 'visible' : 'hidden'}.`
      );
    } catch (err: unknown) {
      // Revert optimistic update
      setExperiences(previous);
      const msg = err instanceof Error ? err.message : 'Visibility update failed';
      showFeedback('error', msg);
    }
  };

  // 5. REORDERING
  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= experiences.length) return;

    const list = [...experiences];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    // Update display_order numbers locally
    const reorderedList = list.map((item, idx) => ({ ...item, display_order: idx + 1 }));
    setExperiences(reorderedList);
    setIsReordering(true);

    try {
      const orderedIds = reorderedList.map((item) => item.id);
      const res = await fetch('/api/admin/experience/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to persist order.');
      }
      showFeedback('success', 'Experience order updated and published.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reordering failed';
      showFeedback('error', msg);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0D111A] border border-white/10 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg shrink-0">
            💼
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Experience Management
              </h2>
              <Badge variant="accent">
                {experiences.length} Record{experiences.length === 1 ? '' : 's'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Manage professional career milestones, achievements, and tech stacks
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          className="min-h-[44px]"
        >
          + Add Experience
        </Button>
      </div>

      {/* Global Notifications */}
      {feedback && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs font-mono leading-relaxed border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? '✔ ' : '✖ '}
          {feedback.message}
        </div>
      )}

      {/* Experience List */}
      <ExperienceList
        experiences={experiences}
        onEdit={(exp) => setEditingExperience(exp)}
        onDelete={(exp) => setDeletingExperience(exp)}
        onToggleEnabled={handleToggleEnabled}
        onMoveUp={(index) => handleReorder(index, index - 1)}
        onMoveDown={(index) => handleReorder(index, index + 1)}
        onAddNew={() => setIsCreateOpen(true)}
        isReordering={isReordering}
      />

      {/* Create Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Add Professional Experience"
          description="Create a new career milestone for your portfolio timeline."
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <ExperienceForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={isSaving}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editingExperience && (
        <Modal
          isOpen={!!editingExperience}
          onClose={() => setEditingExperience(null)}
          title={`Edit Experience — ${editingExperience.company}`}
          description={`Update details for ${editingExperience.role}.`}
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <ExperienceForm
            initialData={editingExperience}
            onSubmit={handleUpdate}
            onCancel={() => setEditingExperience(null)}
            isLoading={isSaving}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExperience && (
        <Modal
          isOpen={!!deletingExperience}
          onClose={() => setDeletingExperience(null)}
          title="Confirm Deletion"
          description="Are you sure you want to delete this career milestone?"
          className="max-w-md"
        >
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-1">
              <p className="font-bold text-red-200">
                {deletingExperience.role} at {deletingExperience.company}
              </p>
              <p className="text-[11px] font-mono text-red-400">
                This action is destructive and will remove the record from your public timeline and database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setDeletingExperience(null)}
                disabled={isDeleting}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="md"
                onClick={confirmDelete}
                isLoading={isDeleting}
                disabled={isDeleting}
                className="min-h-[44px]"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
