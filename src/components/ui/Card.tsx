import React from 'react';

export type CardVariant = 'standard' | 'elevated' | 'cinematic' | 'translucent' | 'interactive';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  standard:
    'bg-[#0D111A] border border-white/10 shadow-md',
  elevated:
    'bg-[#131926] border border-white/15 shadow-xl',
  cinematic:
    'bg-gradient-to-b from-[#161E31]/90 to-[#0D111A]/95 border border-white/10 shadow-2xl backdrop-blur-sm',
  translucent:
    'bg-[#0D111A]/70 backdrop-blur-md border border-white/10 shadow-lg',
  interactive:
    'bg-[#0D111A] border border-white/10 hover:border-amber-500/50 hover:shadow-amber-500/10 shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer',
};

export const Card: React.FC<CardProps> = ({
  variant = 'standard',
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-6 pb-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3
      className={`text-lg md:text-xl font-bold tracking-tight text-slate-100 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p className={`text-xs md:text-sm text-slate-400 mt-1 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-6 pt-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-6 pt-0 flex items-center gap-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
