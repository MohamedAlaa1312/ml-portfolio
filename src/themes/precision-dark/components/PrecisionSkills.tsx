'use client';

import React from 'react';
import type { ThemeSkillsProps } from '../../types';
import type { Skill, SkillCategory } from '@/lib/supabase/types';

export const PrecisionSkills: React.FC<ThemeSkillsProps> = ({
  content,
  skillsList = [],
  sectionIndex,
}) => {
  const title = content?.title || 'Technical Capability Matrix';
  const subtitle =
    content?.subtitle ||
    'Systematic catalog of modeling frameworks, programming languages, and production infrastructure.';

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
  const secNum = String((sectionIndex ?? 3)).padStart(2, '0');

  return (
    <section
      id="skills"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.10]"
    >
      {/* Precision Dynamic Section Header */}
      <div className="flex items-center justify-between pb-4 mb-8 sm:mb-12 border-b border-white/[0.08] text-xs font-mono tracking-wider text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className="text-[#F59E0B] font-bold">{`[${secNum}]`}</span>
          <span className="text-white/20">{'//'}</span>
          <span className="text-[#F1F5F9] uppercase font-bold tracking-widest">SKILLS</span>
        </div>
        <span className="text-[10px] text-[#94A3B8]">MATRIX: CAPABILITIES</span>
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

      {hasVisibleSkills ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedCategoryNames.map((category, idx) => {
            const skills = groupedCategories[category] || [];
            const meta = categoryMetaMap.get(category.toLowerCase());
            const catCode = `CAT.${String(idx + 1).padStart(2, '0')}`;

            return (
              <div
                key={category}
                className="p-5 rounded-sm bg-[#0E1014] border border-white/[0.08] hover:border-[#F59E0B]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.06] text-[10px] font-mono text-[#64748B]">
                    <span className="text-[#F59E0B] font-semibold">{catCode}</span>
                    <span>{skills.length} ITEMS</span>
                  </div>

                  <h3 className="text-sm font-bold text-[#F1F5F9] font-mono tracking-wide uppercase">
                    {category}
                  </h3>

                  {meta?.description && (
                    <p className="text-[11px] text-[#64748B] mt-1 mb-3 leading-normal">
                      {meta.description}
                    </p>
                  )}

                  {/* Compact Rectangular Skills Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2.5 py-1 rounded-sm bg-[#12151B] border border-white/10 hover:border-[#F59E0B]/50 text-xs font-mono text-[#94A3B8] hover:text-[#F1F5F9] transition-all"
                      >
                        {skill.name}
                        {typeof skill.proficiency === 'number' && skill.proficiency > 0 && (
                          <span className="ml-1 text-[10px] text-[#F59E0B]">
                            ({skill.proficiency}%)
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
        <div className="p-8 rounded-sm bg-[#0E1014] border border-white/[0.08] text-center text-xs font-mono text-[#64748B]">
          NO TECHNICAL CAPABILITIES REGISTERED
        </div>
      )}
    </section>
  );
};
