import React from 'react';

export type BadgeVariant = 'default' | 'accent' | 'gold' | 'crimson' | 'success' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-white/5 text-slate-300 border-white/10',
  accent: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  gold: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  crimson: 'bg-red-500/10 text-red-400 border-red-500/30',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  outline: 'bg-transparent text-slate-400 border-white/15',
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  accent: 'bg-amber-500 animate-pulse',
  gold: 'bg-amber-400',
  crimson: 'bg-red-500',
  success: 'bg-emerald-400 animate-pulse',
  outline: 'bg-slate-500',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  dot = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-full border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />}
      <span>{children}</span>
    </span>
  );
};
