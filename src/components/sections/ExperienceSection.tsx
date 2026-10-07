import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ExperienceItem } from '@/components/ui/ExperienceItem';
import type { Experience, ExperienceContent } from '@/lib/supabase/types';

interface ExperienceSectionProps {
  content?: ExperienceContent;
  experienceList?: Experience[];
}

const defaultExperience: Experience[] = [
  {
    id: 'exp-1',
    company: 'Google',
    role: 'Machine Learning Engineer',
    employment_type: 'Full-time',
    location: 'Remote',
    start_date: 'Jan 2022',
    end_date: null,
    is_current: true,
    current_position: true,
    description: 'Developed and deployed production-grade machine learning models serving high-throughput inference pipelines.',
    responsibilities: [
      'Developed and deployed ML models for large-scale applications.',
      'Improved model performance and reduced inference latency by 40%.',
      'Collaborated with cross-functional teams to deliver high-impact AI features.',
    ],
    technologies: ['Python', 'TensorFlow', 'Kubernetes', 'GCP'],
    achievements: ['Reduced inference latency by 40%', 'Scaled model inference to 10M+ requests/day'],
    display_order: 1,
    enabled: true,
    status: 'published',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'exp-2',
    company: 'Microsoft',
    role: 'Data Scientist',
    employment_type: 'Full-time',
    location: 'Remote',
    start_date: 'Jun 2020',
    end_date: 'Dec 2021',
    is_current: false,
    current_position: false,
    description: 'Built enterprise data pipelines and machine learning models for business intelligence.',
    responsibilities: [
      'Built data pipelines and machine learning models for business intelligence.',
      'Worked on NLP and recommendation systems across customer datasets.',
      'Optimized data processing workflows and distributed model training pipelines.',
    ],
    technologies: ['Python', 'PyTorch', 'Azure ML', 'Spark'],
    achievements: ['Engineered predictive churn models with 92% precision'],
    display_order: 2,
    enabled: true,
    status: 'published',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'exp-3',
    company: 'Amazon',
    role: 'Machine Learning Intern',
    employment_type: 'Internship',
    location: 'Seattle, USA',
    start_date: 'Jul 2019',
    end_date: 'Sep 2019',
    is_current: false,
    current_position: false,
    description: 'Assisted in research and prototyping of personalization algorithms.',
    responsibilities: [
      'Assisted in developing ML models for personalized product recommendation.',
      'Analyzed large datasets and created visual data insights for product teams.',
      'Conducted experimental ablation studies on neural collaborative filtering.',
    ],
    technologies: ['Python', 'Scikit-learn', 'AWS', 'Pandas'],
    achievements: ['Published internal benchmark study on recommendation latency'],
    display_order: 3,
    enabled: true,
    status: 'published',
    created_at: '',
    updated_at: '',
  },
];

import { EmptyState } from '@/components/ui/EmptyState';
import { formatExperienceDate } from '@/lib/date';

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  content,
  experienceList,
}) => {
  const badge = content?.badge || 'Career';
  const title = content?.title || 'Experience';
  const subtitle =
    content?.subtitle ||
    'My professional journey in building data-driven solutions and working on impactful projects.';

  // Respect CMS data: only fallback if experienceList is completely undefined (not passed)
  const list = experienceList !== undefined ? experienceList : defaultExperience;

  return (
    <section id="experience" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/5">
      <SectionHeading badge={badge} title={title} subtitle={subtitle} />

      <div className="max-w-4xl mx-auto mt-8 sm:mt-10">
        {list.length > 0 ? (
          list.map((exp) => (
            <ExperienceItem
              key={exp.id}
              company={exp.company}
              role={exp.role}
              employmentType={exp.employment_type}
              location={exp.location}
              startDate={formatExperienceDate(exp.start_date)}
              endDate={formatExperienceDate(exp.end_date)}
              isCurrent={exp.is_current ?? exp.current_position}
              description={exp.description}
              responsibilities={exp.responsibilities}
              achievements={exp.achievements}
              technologies={exp.technologies}
              companyLogo={exp.company_logo || exp.company_logo_url}
            />
          ))
        ) : (
          <EmptyState
            title="No Experience Recorded"
            description="Professional experience milestones will appear here once published via the CMS."
            icon="💼"
          />
        )}
      </div>
    </section>
  );
};
