'use client';

import React, { useState } from 'react';

export type AspectRatio = '1/1' | '16/9' | '4/3' | '21/9' | 'auto';

export interface MediaFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt: string;
  aspectRatio?: AspectRatio;
  fallbackIcon?: string;
  overlay?: boolean;
  priority?: boolean;
}

const aspectRatioStyles: Record<AspectRatio, string> = {
  '1/1': 'aspect-square',
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '21/9': 'aspect-[21/9]',
  'auto': 'aspect-auto',
};

export const MediaFrame: React.FC<MediaFrameProps> = ({
  src,
  alt,
  aspectRatio = '16/9',
  fallbackIcon = '🖼️',
  overlay = false,
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-[#131926] border border-white/10 ${aspectRatioStyles[aspectRatio]} ${className}`}
      {...props}
    >
      {/* Loading Skeleton */}
      {isLoading && !hasError && src && (
        <div className="absolute inset-0 bg-[#1A2234] animate-pulse flex items-center justify-center">
          <span className="text-xs font-mono text-slate-500">Loading asset...</span>
        </div>
      )}

      {/* Actual Media Image */}
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          ref={(img) => {
            if (img && img.complete) {
              setIsLoading(false);
            }
          }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      ) : (
        /* Fallback State */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#131926] text-slate-500">
          <span className="text-3xl mb-2">{fallbackIcon}</span>
          <span className="text-xs font-mono text-center tracking-wide text-slate-400">
            {alt || 'Media Preview'}
          </span>
        </div>
      )}

      {/* Optional Ambient Subtle Gradient Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-transparent to-transparent opacity-80 pointer-events-none" />
      )}
    </div>
  );
};
