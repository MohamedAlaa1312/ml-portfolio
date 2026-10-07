'use client';

import React from 'react';
import type { ThemeSkillsProps } from '../../types';
import type { Skill, SkillCategory } from '@/lib/supabase/types';

export const EditorialSkills: React.FC<ThemeSkillsProps> = ({
  content,
  skillsList = [],
}) => {
  const badge = content?.badge || 'CAPABILITIES // 03';
  const title = content?.title || 'Technical Capabilities';
  const subtitle =
    content?.subtitle ||
    'Core domains, toolchains, modeling frameworks, and computational infrastructure.';

  const configuredCategories: SkillCategory[] = (content?.categories || []).filter(
    (c) => c.enabled !== false
  );

  const categoryMetaMap = new Map<string, SkillCategory>();
  configuredCategories.forEach((cat) => {
    categoryMetaMap.set(cat.name.toLowerCase(), cat);
  });

  // Group skills by category
  const groupedCategories = skillsList.reduce<Record<string, Skill[]>>((acc, skill) => {
    const meta = categoryMetaMap.get(skill.category.toLowerCase());
    if (meta && meta.enabled === false) {
      return acc;
    }
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  // Sort skills within category by display_order
  Object.keys(groupedCategories).forEach((cat) => {
    groupedCategories[cat].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  });

  // Determine category ordering
  let sortedCategoryNames: string[] = [];
  if (configuredCategories.length > 0) {
    const configuredNames = [...configuredCategories]
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map((c) => c.name);

    sortedCategoryNames = configuredNames.filter((name) => groupedCategories[name]?.length > 0);
    Object.keys(groupedCategories).forEach((name) => {
      if (!sortedCategoryNames.includes(name)) {
        sortedCategoryNames.push(name);
      }
    });
  } else if (content?.categoriesOrder && content.categoriesOrder.length > 0) {
    sortedCategoryNames = content.categoriesOrder.filter((name) => groupedCategories[name]?.length > 0);
    Object.keys(groupedCategories).forEach((name) => {
      if (!sortedCategoryNames.includes(name)) {
        sortedCategoryNames.push(name);
      }
    });
  } else {
    sortedCategoryNames = Object.keys(groupedCategories).sort();
  }

  const hasVisibleSkills = sortedCategoryNames.length > 0;

  return (
    <section
      id="skills"
      className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.08]"
    >
      {/* Editorial Section Header */}
      <div className="pb-8 mb-12 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#71717A]">
        <div className="flex items-center gap-2">
          <span className="text-[#C25E34]">03</span>
          <span>/</span>
          <span>CAPABILITIES</span>
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

      {hasVisibleSkills ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCategoryNames.map((category, idx) => {
            const skills = groupedCategories[category] || [];
            const meta = categoryMetaMap.get(category.toLowerCase());
            const numStr = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={category}
                className="p-6 rounded bg-[#121417] border border-white/[0.08] hover:border-white/[0.18] transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#C25E34]">
                      CAT // {numStr}
                    </span>
                    <span className="text-[11px] font-mono text-[#71717A]">
                      {skills.length} {skills.length === 1 ? 'ITEM' : 'ITEMS'}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#EDEDEC] tracking-tight">
                    {category}
                  </h3>

                  {meta?.description && (
                    <p className="text-xs text-[#71717A] mt-1 mb-4 leading-relaxed">
                      {meta.description}
                    </p>
                  )}

                  {/* Skills List */}
                  <div className="flex flex-wrap gap-2 pt-3">
                    {skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center px-2.5 py-1 rounded bg-[#17191E] border border-white/[0.08] text-xs font-mono text-[#A1A1AA] hover:text-[#EDEDEC] hover:border-white/20 transition-colors"
                      >
                        <span>{skill.name}</span>
                        {typeof skill.proficiency === 'number' && skill.proficiency > 0 && (
                          <span className="ml-1.5 text-[10px] text-[#C25E34]">
                            {skill.proficiency}%
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded bg-[#121417] border border-white/[0.08] text-center text-xs font-mono text-[#71717A]">
          NO CAPABILITIES CONFIGURED
        </div>
      )}
    </section>
  );
};
