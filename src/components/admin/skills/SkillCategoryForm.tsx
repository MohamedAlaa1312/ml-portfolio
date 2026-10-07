'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import type { SkillCategory } from '@/lib/supabase/types';

interface SkillCategoryFormProps {
  initialData?: SkillCategory | null;
  onSubmit: (data: Partial<SkillCategory>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const COMMON_ICONS = ['🧠', '💻', '📊', '⚙️', '🗄️', '🛠️', '🚀', '🔬', '🌐', '🛡️', '⚡', '🤖'];

export const SkillCategoryForm: React.FC<SkillCategoryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [icon, setIcon] = useState(initialData?.icon || '⚡');
  const [displayOrder, setDisplayOrder] = useState<string>(
    initialData?.display_order !== undefined ? String(initialData.display_order) : ''
  );
  const [enabled, setEnabled] = useState(
    initialData?.enabled !== undefined ? initialData.enabled : true
  );

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Category name is required.');
      return;
    }

    let parsedOrder: number | undefined = undefined;
    if (displayOrder.trim() !== '') {
      const o = Number(displayOrder);
      if (!isNaN(o) && o >= 0) {
        parsedOrder = Math.round(o);
      }
    }

    const payload: Partial<SkillCategory> = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      name: trimmedName,
      description: description.trim() || undefined,
      icon: icon.trim() || '⚡',
      enabled,
      ...(parsedOrder !== undefined ? { display_order: parsedOrder } : {}),
    };

    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save category.';
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

      {/* Category Name */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Category Name <span className="text-amber-400">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Machine Learning, Cloud & MLOps, Deep Learning"
          required
          autoFocus
        />
        {initialData && initialData.name !== name && (
          <p className="text-[11px] text-amber-400/90 mt-1">
            Note: Renaming this category will automatically update all skills assigned to it.
          </p>
        )}
      </div>

      {/* Icon Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Category Icon (Emoji or Symbol)
        </label>
        <div className="flex items-center gap-3">
          <Input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="⚡"
            className="w-20 text-center text-xl"
          />
          <div className="flex flex-wrap gap-1.5">
            {COMMON_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`p-1.5 rounded-lg border text-base transition-colors ${
                  icon === emoji
                    ? 'border-amber-500 bg-amber-500/20'
                    : 'border-white/10 hover:border-white/30 bg-white/5'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Short Description (Optional)
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description shown under the category header on the public portfolio."
          rows={2}
        />
      </div>

      {/* Display Order */}
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

      {/* Enabled Toggle */}
      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="category-enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-4 h-4 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
        />
        <label htmlFor="category-enabled" className="text-sm font-medium text-slate-200 cursor-pointer">
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
          {initialData ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
};
