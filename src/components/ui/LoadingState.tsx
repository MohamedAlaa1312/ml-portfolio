import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block rounded-full border-amber-500/20 border-t-amber-500 animate-spin ${sizeMap[size]} ${className}`}
    />
  );
};

export interface SkeletonProps {
  className?: string;
}

export const SkeletonText: React.FC<SkeletonProps & { lines?: number }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2.5 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3.5 bg-[#1A2234] rounded-md ${
            i === lines - 1 ? 'w-3/5' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`p-6 rounded-2xl bg-[#0D111A] border border-white/5 animate-pulse space-y-4 ${className}`}
    >
      <div className="w-1/3 h-4 bg-[#1A2234] rounded-md" />
      <div className="w-full h-3 bg-[#161E31] rounded-md" />
      <div className="w-2/3 h-3 bg-[#161E31] rounded-md" />
      <div className="pt-2 flex gap-2">
        <div className="w-16 h-5 bg-[#1A2234] rounded-md" />
        <div className="w-16 h-5 bg-[#1A2234] rounded-md" />
      </div>
    </div>
  );
};
