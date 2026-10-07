import React from 'react';

export interface DividerProps {
  variant?: 'subtle' | 'gradient' | 'technical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  variant = 'subtle',
  className = '',
}) => {
  if (variant === 'gradient') {
    return (
      <div className={`w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-8 ${className}`} />
    );
  }

  if (variant === 'technical') {
    return (
      <div className={`relative flex items-center justify-center my-8 ${className}`}>
        <div className="w-full h-[1px] bg-white/10" />
        <div className="absolute px-3 bg-[#080B11] text-[10px] font-mono text-slate-500 tracking-widest uppercase">
          {"// SYS //"}
        </div>
      </div>
    );
  }

  return <div className={`w-full h-[1px] bg-white/10 my-8 ${className}`} />;
};
