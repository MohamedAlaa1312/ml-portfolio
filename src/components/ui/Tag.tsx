import React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  interactive?: boolean;
  active?: boolean;
}

export const Tag: React.FC<TagProps> = ({
  interactive = false,
  active = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center px-2.5 py-1 text-xs font-mono rounded-md border transition-all duration-150 select-none';

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:border-amber-500/50 hover:text-amber-300'
    : '';

  const activeClasses = active
    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
    : 'bg-[#161E31]/70 border-white/10 text-slate-300';

  return (
    <span
      className={`${baseClasses} ${activeClasses} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
