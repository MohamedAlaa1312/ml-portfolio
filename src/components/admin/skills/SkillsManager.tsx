'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SkillForm } from './SkillForm';
import { SkillCategoryForm } from './SkillCategoryForm';
import { SkillCategoryList } from './SkillCategoryList';
import type { Skill, SkillCategory } from '@/lib/supabase/types';

interface SkillsManagerProps {
  initialSkills: Skill[];
  initialCategories: SkillCategory[];
}

export const SkillsManager: React.FC<SkillsManagerProps> = ({
  initialSkills,
  initialCategories,
}) => {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [categories, setCategories] = useState<SkillCategory[]>(initialCategories);

  // Active view tab: 'skills' | 'categories'
  const [activeTab, setActiveTab] = useState<'skills' | 'categories'>('skills');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Modals state
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<SkillCategory | null>(null);
  const [categoryDeleteError, setCategoryDeleteError] = useState<string | null>(null);

  // Loading states
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

  // Skill count map by category
  const skillCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    skills.forEach((s) => {
      const key = s.category.toLowerCase();
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [skills]);

  // Filtered skills
  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      const matchesSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategoryFilter === 'ALL' ||
        s.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [skills, searchQuery, selectedCategoryFilter]);

  // Group filtered skills by category
  const groupedSkills = useMemo(() => {
    const map: Record<string, Skill[]> = {};
    filteredSkills.forEach((s) => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });

    // Sort skills inside each category by display_order
    Object.keys(map).forEach((cat) => {
      map[cat].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    });

    return map;
  }, [filteredSkills]);

  // ---------------------------------------------------------------------------
  // SKILL OPERATIONS
  // ---------------------------------------------------------------------------

  const handleSaveSkill = async (payload: Partial<Skill>) => {
    setIsSaving(true);
    setFeedback(null);

    try {
      const isEdit = Boolean(editingSkill?.id);
      const url = isEdit ? `/api/admin/skills/${editingSkill!.id}` : '/api/admin/skills';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save skill.');
      }

      if (isEdit) {
        setSkills((prev) => prev.map((s) => (s.id === data.skill.id ? data.skill : s)));
        showFeedback('success', `Skill "${data.skill.name}" updated successfully.`);
      } else {
        setSkills((prev) => [...prev, data.skill]);
        showFeedback('success', `Skill "${data.skill.name}" created successfully.`);
      }

      // Check if new category needs to be reflected
      const existsInCats = categories.some(
        (c) => c.name.toLowerCase() === data.skill.category.toLowerCase()
      );
      if (!existsInCats) {
        const newCat: SkillCategory = {
          id: `cat-${Date.now()}`,
          name: data.skill.category,
          display_order: categories.length + 1,
          enabled: true,
        };
        setCategories((prev) => [...prev, newCat]);
      }

      setIsSkillModalOpen(false);
      setEditingSkill(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Skill save failed';
      showFeedback('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSkill = async (skill: Skill) => {
    try {
      const updatedEnabled = !skill.enabled;
      const res = await fetch(`/api/admin/skills/${skill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: updatedEnabled }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle skill state.');
      }

      setSkills((prev) => prev.map((s) => (s.id === skill.id ? data.skill : s)));
      showFeedback(
        'success',
        `Skill "${skill.name}" is now ${updatedEnabled ? 'visible' : 'hidden'}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Toggle failed';
      showFeedback('error', msg);
    }
  };

  const handleDeleteSkill = async () => {
    if (!deletingSkill) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/skills/${deletingSkill.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete skill.');
      }

      setSkills((prev) => prev.filter((s) => s.id !== deletingSkill.id));
      showFeedback('success', `Skill "${deletingSkill.name}" was removed.`);
      setDeletingSkill(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      showFeedback('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorderSkills = async (categoryName: string, skillIndex: number, direction: 'up' | 'down') => {
    const list = [...(groupedSkills[categoryName] || [])];
    if (direction === 'up' && skillIndex === 0) return;
    if (direction === 'down' && skillIndex === list.length - 1) return;

    setIsReordering(true);
    const targetIndex = direction === 'up' ? skillIndex - 1 : skillIndex + 1;
    const temp = list[skillIndex];
    list[skillIndex] = list[targetIndex];
    list[targetIndex] = temp;

    const orderedIds = list.map((s) => s.id);

    try {
      const res = await fetch('/api/admin/skills/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reorder skills.');
      }

      // Update state locally
      setSkills((prev) => {
        const orderMap = new Map<string, number>();
        orderedIds.forEach((id, idx) => orderMap.set(id, idx + 1));

        return prev.map((s) => {
          if (orderMap.has(s.id)) {
            return { ...s, display_order: orderMap.get(s.id)! };
          }
          return s;
        });
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reordering failed';
      showFeedback('error', msg);
    } finally {
      setIsReordering(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CATEGORY OPERATIONS
  // ---------------------------------------------------------------------------

  const handleSaveCategory = async (payload: Partial<SkillCategory>) => {
    setIsSaving(true);
    setFeedback(null);

    try {
      const isEdit = Boolean(editingCategory?.id);
      const url = '/api/admin/skills/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save category.');
      }

      if (isEdit) {
        const oldName = editingCategory!.name;
        const newName = data.category.name;

        setCategories((prev) =>
          prev.map((c) => (c.id === data.category.id ? data.category : c))
        );

        // If category was renamed, update local skills state to match cascade
        if (oldName !== newName) {
          setSkills((prev) =>
            prev.map((s) =>
              s.category.toLowerCase() === oldName.toLowerCase()
                ? { ...s, category: newName }
                : s
            )
          );
        }

        showFeedback('success', `Category "${data.category.name}" updated successfully.`);
      } else {
        setCategories((prev) => [...prev, data.category]);
        showFeedback('success', `Category "${data.category.name}" created successfully.`);
      }

      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Category save failed';
      showFeedback('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (force: boolean = false) => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setCategoryDeleteError(null);

    try {
      const res = await fetch(`/api/admin/skills/categories?id=${deletingCategory.id}${force ? '&force=true' : ''}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.canForce) {
          setCategoryDeleteError(data.error);
          return;
        }
        throw new Error(data.error || 'Failed to delete category.');
      }

      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
      showFeedback('success', `Category "${deletingCategory.name}" was removed.`);
      setDeletingCategory(null);
      setCategoryDeleteError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Category delete failed';
      showFeedback('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorderCategories = async (orderedIds: string[]) => {
    setIsReordering(true);
    try {
      const res = await fetch('/api/admin/skills/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reorder categories.');
      }

      // Update state locally
      setCategories((prev) => {
        const orderMap = new Map<string, number>();
        orderedIds.forEach((id, idx) => orderMap.set(id, idx + 1));

        return [...prev]
          .map((c) => ({
            ...c,
            display_order: orderMap.get(c.id) ?? c.display_order,
          }))
          .sort((a, b) => a.display_order - b.display_order);
      });

      showFeedback('success', 'Categories reordered successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reordering failed';
      showFeedback('error', msg);
    } finally {
      setIsReordering(false);
    }
  };

  // Stats
  const totalSkillsCount = skills.length;
  const enabledSkillsCount = skills.filter((s) => s.enabled).length;
  const totalCategoriesCount = categories.length;

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

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">
            Skills & Capabilities
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage your technical toolset, proficiencies, skill categories, and display hierarchy.
          </p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="accent" dot>
              {totalSkillsCount} Total Skills
            </Badge>
            <Badge variant="success">
              {enabledSkillsCount} Active
            </Badge>
            <Badge variant="outline">
              {totalCategoriesCount} Categories
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setEditingCategory(null);
              setIsCategoryModalOpen(true);
            }}
          >
            + Add Category
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setEditingSkill(null);
              setIsSkillModalOpen(true);
            }}
          >
            + Add Skill
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center border-b border-white/10 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-[1px] cursor-pointer ${
            activeTab === 'skills'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Skills ({skills.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-[1px] cursor-pointer ${
            activeTab === 'categories'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {/* TAB 1: SKILLS LIST */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills by name or category..."
              />
            </div>
            <div>
              <Select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Categories' },
                  ...categories.map((c) => ({ value: c.name, label: c.name })),
                ]}
              />
            </div>
          </div>

          {/* Grouped Skills Display */}
          {Object.keys(groupedSkills).length === 0 ? (
            <Card variant="standard" className="bg-[#0D111A] border-white/10 text-center py-12">
              <CardContent className="space-y-3">
                <p className="text-slate-400 text-base">No skills match the current filter.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryFilter('ALL');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedSkills).map(([catName, catSkills]) => {
              const catMeta = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());

              return (
                <div key={catName} className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" role="img" aria-hidden="true">
                        {catMeta?.icon || '⚡'}
                      </span>
                      <h3 className="text-base font-semibold text-slate-100">{catName}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {catSkills.length}
                      </Badge>
                      {catMeta && !catMeta.enabled && (
                        <Badge variant="crimson" className="text-[10px]">
                          Category Disabled
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {catSkills.map((skill, index) => (
                      <Card
                        key={skill.id}
                        variant="standard"
                        className={`bg-[#0D111A] border-white/10 hover:border-white/20 transition-all ${
                          !skill.enabled ? 'opacity-60' : ''
                        }`}
                      >
                        <CardContent className="p-4 flex items-center justify-between gap-3">
                          {/* Skill Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {skill.icon && <span className="text-sm">{skill.icon}</span>}
                              <h4 className="font-semibold text-slate-100 text-sm truncate">
                                {skill.name}
                              </h4>
                              {skill.enabled ? (
                                <Badge variant="success" dot className="text-[10px]">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="crimson" className="text-[10px]">
                                  Hidden
                                </Badge>
                              )}
                              {typeof skill.proficiency === 'number' && skill.proficiency > 0 && (
                                <Badge variant="gold" className="text-[10px]">
                                  {skill.proficiency}%
                                </Badge>
                              )}
                            </div>

                            {/* Proficiency Bar Preview */}
                            {typeof skill.proficiency === 'number' && skill.proficiency > 0 && (
                              <div className="mt-2 w-full max-w-[140px] bg-white/10 rounded-full h-1 overflow-hidden">
                                <div
                                  className="bg-amber-400 h-full"
                                  style={{ width: `${skill.proficiency}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Skill Action Buttons */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* Reorder Buttons */}
                            <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-white/5 mr-1">
                              <button
                                type="button"
                                onClick={() => handleReorderSkills(catName, index, 'up')}
                                disabled={index === 0 || isReordering}
                                aria-label={`Move ${skill.name} up`}
                                className="p-1 px-1.5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors cursor-pointer text-[10px]"
                                title="Move Up"
                              >
                                ▲
                              </button>
                              <div className="w-[1px] h-3 bg-white/10" />
                              <button
                                type="button"
                                onClick={() => handleReorderSkills(catName, index, 'down')}
                                disabled={index === catSkills.length - 1 || isReordering}
                                aria-label={`Move ${skill.name} down`}
                                className="p-1 px-1.5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors cursor-pointer text-[10px]"
                                title="Move Down"
                              >
                                ▼
                              </button>
                            </div>

                            {/* Toggle Enable/Disable Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleSkill(skill)}
                              className={`p-1.5 px-2 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                                skill.enabled
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                              }`}
                              title={skill.enabled ? 'Click to disable' : 'Click to enable'}
                            >
                              {skill.enabled ? 'Enabled' : 'Disabled'}
                            </button>

                            {/* Edit Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingSkill(skill);
                                setIsSkillModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>

                            {/* Delete Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingSkill(skill)}
                              className="text-red-400 hover:text-red-300 hover:border-red-500/30"
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: CATEGORIES LIST */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Categories group skills on the public portfolio. You can reorder, edit, or safely delete them.
            </p>
          </div>

          <SkillCategoryList
            categories={categories}
            skillCountMap={skillCountMap}
            onEdit={(cat) => {
              setEditingCategory(cat);
              setIsCategoryModalOpen(true);
            }}
            onDelete={(cat) => {
              setDeletingCategory(cat);
              setCategoryDeleteError(null);
            }}
            onReorder={handleReorderCategories}
            isReordering={isReordering}
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODALS */}
      {/* --------------------------------------------------------------------- */}

      {/* 1. Skill Create / Edit Modal */}
      <Modal
        isOpen={isSkillModalOpen}
        onClose={() => {
          setIsSkillModalOpen(false);
          setEditingSkill(null);
        }}
        title={editingSkill ? 'Edit Skill' : 'Create New Skill'}
        description={
          editingSkill
            ? `Modify proficiency, category, or visibility for ${editingSkill.name}.`
            : 'Add a new technical competency to your portfolio.'
        }
      >
        <SkillForm
          initialData={editingSkill}
          categories={categories}
          onSubmit={handleSaveSkill}
          onCancel={() => {
            setIsSkillModalOpen(false);
            setEditingSkill(null);
          }}
          isLoading={isSaving}
        />
      </Modal>

      {/* 2. Category Create / Edit Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Edit Skill Category' : 'Create Skill Category'}
        description={
          editingCategory
            ? `Modify name, description, or icon for ${editingCategory.name}.`
            : 'Add a new skill category grouping to organize your proficiencies.'
        }
      >
        <SkillCategoryForm
          initialData={editingCategory}
          onSubmit={handleSaveCategory}
          onCancel={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
          isLoading={isSaving}
        />
      </Modal>

      {/* 3. Skill Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingSkill)}
        onClose={() => setDeletingSkill(null)}
        title="Delete Skill"
        description="Are you sure you want to delete this skill? This action cannot be undone."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            You are about to permanently remove{' '}
            <strong className="text-slate-100">{deletingSkill?.name}</strong> from{' '}
            <span className="text-amber-400">{deletingSkill?.category}</span>.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setDeletingSkill(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteSkill}
              isLoading={isDeleting}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. Category Delete Confirmation Modal (with Safe Deletion Check) */}
      <Modal
        isOpen={Boolean(deletingCategory)}
        onClose={() => {
          setDeletingCategory(null);
          setCategoryDeleteError(null);
        }}
        title="Delete Category"
        description="Verify category removal and check for assigned skills."
      >
        <div className="space-y-4">
          {categoryDeleteError ? (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3">
              <p className="text-sm text-red-300">{categoryDeleteError}</p>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeletingCategory(null);
                    setCategoryDeleteError(null);
                  }}
                >
                  Cancel & Reassign Skills
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDeleteCategory(true)}
                  isLoading={isDeleting}
                  className="bg-red-600 hover:bg-red-500 text-white"
                >
                  Force Delete
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-300">
                Are you sure you want to delete category{' '}
                <strong className="text-slate-100">{deletingCategory?.name}</strong>?
              </p>
              {deletingCategory &&
                (skillCountMap[deletingCategory.name.toLowerCase()] || 0) > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs">
                    ⚠️ Warning: This category currently contains{' '}
                    <strong>{skillCountMap[deletingCategory.name.toLowerCase()]}</strong> skill(s).
                    Deleting it without reassigning may leave skills without a configured category.
                  </div>
                )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setDeletingCategory(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDeleteCategory(false)}
                  isLoading={isDeleting}
                  className="bg-red-600 hover:bg-red-500 text-white"
                >
                  Confirm Delete
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
