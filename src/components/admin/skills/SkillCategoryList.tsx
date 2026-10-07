'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { SkillCategory } from '@/lib/supabase/types';

interface SkillCategoryListProps {
  categories: SkillCategory[];
  skillCountMap: Record<string, number>;
  onEdit: (category: SkillCategory) => void;
  onDelete: (category: SkillCategory) => void;
  onReorder: (orderedIds: string[]) => Promise<void>;
  isReordering?: boolean;
}

export const SkillCategoryList: React.FC<SkillCategoryListProps> = ({
  categories,
  skillCountMap,
  onEdit,
  onDelete,
  onReorder,
  isReordering = false,
}) => {
  const sorted = [...categories].sort((a, b) => a.display_order - b.display_order);

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const newSorted = [...sorted];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSorted[index];
    newSorted[index] = newSorted[targetIndex];
    newSorted[targetIndex] = temp;

    const orderedIds = newSorted.map((c) => c.id);
    await onReorder(orderedIds);
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 border border-dashed border-white/10 rounded-xl">
        No categories found. Create your first category above.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((category, index) => {
        const count = skillCountMap[category.name.toLowerCase()] || 0;

        return (
          <Card
            key={category.id}
            variant="standard"
            className="bg-[#0D111A] border-white/10 hover:border-white/20 transition-colors"
          >
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Category Info */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl w-8 text-center flex-shrink-0" role="img" aria-hidden="true">
                  {category.icon || '⚡'}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-slate-100 text-sm md:text-base truncate">
                      {category.name}
                    </h4>
                    {category.enabled ? (
                      <Badge variant="success" dot className="text-[10px]">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="crimson" className="text-[10px]">
                        Disabled
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {count} {count === 1 ? 'skill' : 'skills'}
                    </Badge>
                  </div>
                  {category.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions & Reordering */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                {/* Reorder Buttons */}
                <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-white/5 mr-2">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0 || isReordering}
                    aria-label={`Move ${category.name} up`}
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
                    aria-label={`Move ${category.name} down`}
                    className="p-1.5 px-2 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors cursor-pointer text-xs"
                    title="Move Down"
                  >
                    ▼
                  </button>
                </div>

                {/* Edit Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(category)}
                >
                  Edit
                </Button>

                {/* Delete Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(category)}
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
