'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { Skill, SkillCategory } from '@/lib/supabase/types';

interface SkillFormProps {
  initialData?: Skill | null;
  categories: SkillCategory[];
  onSubmit: (data: Partial<Skill>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SkillForm: React.FC<SkillFormProps> = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(
    initialData?.category || (categories[0]?.name ?? 'Machine Learning')
  );
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [proficiency, setProficiency] = useState<string>(
    initialData?.proficiency !== null && initialData?.proficiency !== undefined
      ? String(initialData.proficiency)
      : ''
  );
  const [icon, setIcon] = useState(initialData?.icon || '');
  const [displayOrder, setDisplayOrder] = useState<string>(
    initialData?.display_order !== undefined ? String(initialData.display_order) : ''
  );
  const [enabled, setEnabled] = useState(
    initialData?.enabled !== undefined ? initialData.enabled : true
  );

  const [error, setError] = useState<string | null>(null);

  // Category select options
  const categoryOptions = [
    ...categories.map((c) => ({ value: c.name, label: `${c.icon ? c.icon + ' ' : ''}${c.name}` })),
    { value: '__CUSTOM__', label: '+ Enter custom category...' },
  ];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__CUSTOM__') {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
      setCategory(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Skill name is required.');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category.trim();
    if (!finalCategory) {
      setError('Category is required.');
      return;
    }

    let parsedProficiency: number | null = null;
    if (proficiency.trim() !== '') {
      const p = Number(proficiency);
      if (isNaN(p) || p < 0 || p > 100) {
        setError('Proficiency must be a number between 0 and 100.');
        return;
      }
      parsedProficiency = Math.round(p);
    }

    let parsedOrder: number | undefined = undefined;
    if (displayOrder.trim() !== '') {
      const o = Number(displayOrder);
      if (!isNaN(o) && o >= 0) {
        parsedOrder = Math.round(o);
      }
    }

    const payload: Partial<Skill> = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      name: trimmedName,
      category: finalCategory,
      proficiency: parsedProficiency,
      icon: icon.trim() || null,
      enabled,
      ...(parsedOrder !== undefined ? { display_order: parsedOrder } : {}),
    };

    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save skill.';
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Skill Name */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Skill Name <span className="text-amber-400">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. PyTorch, Kubernetes, Transformer Models"
          required
          autoFocus
        />
      </div>

      {/* Category Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Category <span className="text-amber-400">*</span>
        </label>
        {!isCustomCategory ? (
          <Select
            value={category}
            onChange={handleCategoryChange}
            options={categoryOptions}
          />
        ) : (
          <div className="space-y-2">
            <Input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter new category name..."
              autoFocus
            />
            <button
              type="button"
              onClick={() => setIsCustomCategory(false)}
              className="text-xs text-amber-400 hover:text-amber-300 underline"
            >
              ← Choose from existing categories
            </button>
          </div>
        )}
      </div>

      {/* Proficiency & Display Order (Side by side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Proficiency % (0-100)
          </label>
          <Input
            type="number"
            min={0}
            max={100}
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            placeholder="e.g. 90 (optional)"
          />
          {proficiency && !isNaN(Number(proficiency)) && (
            <div className="mt-1.5 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, Number(proficiency)))}%` }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Display Order
          </label>
          <Input
            type="number"
            min={1}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            placeholder="Auto-calculated if blank"
          />
        </div>
      </div>

      {/* Optional Icon/Emoji */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Icon / Symbol (Optional)
        </label>
        <Input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="e.g. ⚡, 🧠, or icon identifier"
        />
      </div>

      {/* Enabled Toggle */}
      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="skill-enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-4 h-4 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
        />
        <label htmlFor="skill-enabled" className="text-sm font-medium text-slate-200 cursor-pointer">
          Enabled (Visible on public portfolio)
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {initialData ? 'Update Skill' : 'Create Skill'}
        </Button>
      </div>
    </form>
  );
};
