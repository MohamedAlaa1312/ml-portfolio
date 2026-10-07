import React from 'react';
import { Badge } from './Badge';

export interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  subtitle,
  align = 'left',
  action,
  className = '',
}) => {
  const alignClasses = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col mb-12 ${alignClasses} ${className}`}>
      <div className="flex items-center justify-between w-full">
        <div className={`flex flex-col ${alignClasses}`}>
          {badge && (
            <Badge variant="accent" dot className="mb-3">
              {badge}
            </Badge>
          )}
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm md:text-base text-slate-400 mt-2 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="hidden md:block shrink-0 ml-4">{action}</div>}
      </div>
      {action && <div className="md:hidden mt-4 w-full">{action}</div>}
    </div>
  );
};
