import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card, CardContent } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Skill, SkillsContent, SkillCategory } from '@/lib/supabase/types';

interface SkillsSectionProps {
  content?: SkillsContent;
  skillsList?: Skill[];
}

const defaultCategoryIcons: Record<string, string> = {
  'Machine Learning': '🧠',
  'Programming': '💻',
  'Data Science': '📊',
  'Backend': '⚙️',
  'Databases': '🗄️',
  'Tools': '🛠️',
};

export const SkillsSection: React.FC<SkillsSectionProps> = ({ content, skillsList }) => {
  const badge = content?.badge || 'Capabilities';
  const title = content?.title || 'Skills';
  const subtitle = content?.subtitle || 'Tools and technologies I work with.';

  // If skillsList is provided, use it directly (do not inject synthetic skills if DB has 0 items)
  const list = skillsList !== undefined ? skillsList : [];

  // Configured categories from CMS section content
  const configuredCategories: SkillCategory[] = (content?.categories || []).filter(
    (c) => c.enabled !== false
  );

  // Map category names to their metadata
  const categoryMetaMap = new Map<string, SkillCategory>();
  configuredCategories.forEach((cat) => {
    categoryMetaMap.set(cat.name.toLowerCase(), cat);
  });

  // Group skills by category
  const groupedCategories = list.reduce<Record<string, Skill[]>>((acc, skill) => {
    // Check if category is explicitly disabled in CMS
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

  // Sort skills within each category by display_order
  Object.keys(groupedCategories).forEach((cat) => {
    groupedCategories[cat].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  });

  // Determine category ordering
  // 1. If configured categories exist, use their display_order
  // 2. Otherwise if categoriesOrder array exists, use that order
  // 3. Otherwise sort alphabetically
  let sortedCategoryNames: string[] = [];

  if (configuredCategories.length > 0) {
    const configuredNames = [...configuredCategories]
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map((c) => c.name);

    // Keep configured categories that have skills or keep in order
    sortedCategoryNames = configuredNames.filter((name) => groupedCategories[name]?.length > 0);

    // Append any extra categories from skills not in configured list
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
    <section id="skills" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/5">
      <SectionHeading badge={badge} title={title} subtitle={subtitle} />

      {hasVisibleSkills ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 sm:mt-10">
          {sortedCategoryNames.map((category) => {
            const skills = groupedCategories[category] || [];
            const meta = categoryMetaMap.get(category.toLowerCase());
            const icon = meta?.icon || defaultCategoryIcons[category] || '⚡';

            return (
              <Card
                key={category}
                variant="standard"
                className="bg-[#0D111A] border-white/10 hover:border-amber-500/30 transition-colors"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {icon}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{category}</h3>
                      {meta?.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{meta.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {skills.map((skill) => (
                      <Tag key={skill.id} className="text-xs">
                        {skill.name}
                        {typeof skill.proficiency === 'number' && skill.proficiency > 0 ? (
                          <span className="ml-1 opacity-60 text-[10px]">{skill.proficiency}%</span>
                        ) : null}
                      </Tag>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="max-w-md mx-auto mt-8 sm:mt-10">
          <EmptyState
            title="No Skills Configured"
            description="Technical proficiencies and tools will be listed here once enabled in the CMS."
            icon="🛠️"
          />
        </div>
      )}
    </section>
  );
};
