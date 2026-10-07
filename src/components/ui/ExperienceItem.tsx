import React from 'react';
import { Tag } from './Tag';

export interface ExperienceItemProps {
  company: string;
  role: string;
  employmentType?: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  isCurrent?: boolean;
  description: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
  companyLogo?: string | null;
  className?: string;
}

const renderCompanyLogo = (company: string, logoUrl?: string | null) => {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${company} logo`}
        className="w-8 h-8 rounded-lg object-contain bg-white/5 p-1 border border-white/10"
      />
    );
  }

  const normalized = company.toLowerCase().trim();
  if (normalized === 'google') {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#131926] border border-white/10 flex items-center justify-center p-1.5 shrink-0" aria-label="Google">
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
      </div>
    );
  }

  if (normalized === 'microsoft') {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#131926] border border-white/10 flex items-center justify-center p-1.5 shrink-0" aria-label="Microsoft">
        <svg viewBox="0 0 23 23" className="w-full h-full">
          <path fill="#f35325" d="M1 1h10v10H1z"/>
          <path fill="#81bc06" d="M12 1h10v10H12z"/>
          <path fill="#05a6f0" d="M1 12h10v10H1z"/>
          <path fill="#ffba08" d="M12 12h10v10H12z"/>
        </svg>
      </div>
    );
  }

  if (normalized === 'amazon') {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#131926] border border-white/10 flex items-center justify-center p-1.5 shrink-0 text-amber-400 font-bold font-mono text-sm" aria-label="Amazon">
        a
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-mono font-bold text-amber-400 shrink-0">
      {company.slice(0, 2).toUpperCase()}
    </div>
  );
};

export const ExperienceItem: React.FC<ExperienceItemProps> = ({
  company,
  role,
  employmentType,
  location,
  startDate,
  endDate,
  isCurrent,
  description,
  responsibilities = [],
  achievements = [],
  technologies = [],
  companyLogo,
  className = '',
}) => {
  return (
    <div
      className={`relative pl-6 sm:pl-8 pb-10 sm:pb-12 last:pb-2 border-l border-white/10 ${className}`}
    >
      {/* Timeline Node Accent */}
      <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#080B11] border-2 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />

      {/* Experience Header: Stacks cleanly on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          {renderCompanyLogo(company, companyLogo)}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">{role}</h3>
            <p className="text-xs sm:text-sm font-medium text-amber-400/90 mt-0.5">
              {company}
              {employmentType && (
                <span className="text-xs font-mono text-slate-400 ml-2">
                  • {employmentType}
                </span>
              )}
              {location && (
                <span className="text-xs font-mono text-slate-500 ml-2">
                  ({location})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Date Range Badge */}
        <div className="self-start sm:self-auto text-[11px] sm:text-xs font-mono px-3 py-1 rounded-full bg-[#131926] border border-white/10 text-slate-300 shrink-0">
          {startDate} — {isCurrent ? 'Present' : endDate || 'Present'}
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* Responsibilities */}
      {responsibilities.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
          {responsibilities.map((resp, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5 shrink-0">•</span>
              <span className="leading-relaxed">{resp}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mt-3 space-y-1 text-xs font-mono text-emerald-400/90">
          {achievements.map((ach, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-emerald-500 shrink-0">✔</span>
              <span>{ach}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tech Stack Pills */}
      {technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {technologies.map((tech) => (
            <Tag key={tech} className="text-[11px]">
              {tech}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
};
