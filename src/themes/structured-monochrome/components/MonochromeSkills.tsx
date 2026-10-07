'use client';

import React from 'react';
import type { ThemeSkillsProps } from '../../types';
import type { Skill, SkillCategory } from '@/lib/supabase/types';

export const MonochromeSkills: React.FC<ThemeSkillsProps> = ({
  content,
  skillsList = [],
  sectionIndex,
}) => {
  const title = content?.title || 'Technical Catalog';
  const subtitle =
    content?.subtitle ||
    'Structured inventory of machine learning toolchains, programming languages, and production systems.';

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
      className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.15]"
    >
      {/* Stark Section Label */}
      <div className="pb-6 mb-12 sm:mb-16 border-b border-white/[0.12] flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#737373]">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">{secNum}</span>
          <span>—</span>
          <span className="text-white font-bold tracking-widest">SKILLS</span>
        </div>
        <span>TAXONOMY // CAPABILITIES</span>
      </div>

      <div className="space-y-4 mb-16">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base text-[#A3A3A3] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Structured Technical Catalog Grid with Clean Fine Lines */}
      {hasVisibleSkills ? (
        <div className="border-t border-white/[0.15] divide-y divide-white/[0.15]">
          {sortedCategoryNames.map((category, idx) => {
            const skills = groupedCategories[category] || [];
            const meta = categoryMetaMap.get(category.toLowerCase());
            const catIndex = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={category}
                className="py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-baseline"
              >
                {/* Category Header (col-4) */}
                <div className="lg:col-span-4 space-y-1">
                  <div className="text-xs font-mono text-[#737373] tracking-widest uppercase">
                    CAT. {catIndex}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                    {category}
                  </h3>
                  {meta?.description && (
                    <p className="text-xs text-[#737373] pt-1">
                      {meta.description}
                    </p>
                  )}
                </div>

                {/* Skills Text Catalog (col-8) */}
                <div className="lg:col-span-8">
                  <div className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-sm">
                    {skills.map((skill, sIdx) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center text-[#E5E5E5] hover:text-white transition-colors"
                      >
                        <span className="font-semibold">{skill.name}</span>
                        {typeof skill.proficiency === 'number' && skill.proficiency > 0 && (
                          <span className="text-[11px] text-[#737373] ml-1">
                            [{skill.proficiency}%]
                          </span>
                        )}
                        {sIdx < skills.length - 1 && (
                          <span className="text-white/20 ml-6 select-none">/</span>
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
        <div className="p-8 border border-white/10 text-center text-xs font-mono text-[#737373]">
          NO CAPABILITY CATEGORIES AVAILABLE
        </div>
      )}
    </section>
  );
};
