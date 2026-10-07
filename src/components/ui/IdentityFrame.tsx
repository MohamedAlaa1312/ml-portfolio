import React from 'react';
import { Badge } from './Badge';

export interface IdentityFrameProps {
  name: string;
  title: string;
  introduction: string;
  avatarUrl?: string | null;
  actions?: React.ReactNode;
  socials?: React.ReactNode;
  className?: string;
}

/**
 * Reusable Personal Identity Visual Foundation.
 * Prominently frames the owner's large portrait, bold name, professional title,
 * and key CTA/social links for future Hero and Bio implementations.
 */
export const IdentityFrame: React.FC<IdentityFrameProps> = ({
  name,
  title,
  introduction,
  avatarUrl,
  actions,
  socials,
  className = '',
}) => {
  return (
    <div
      className={`relative w-full rounded-3xl bg-[#0D111A] border border-white/10 p-6 md:p-10 shadow-2xl overflow-hidden ${className}`}
    >
      {/* Subtle Ambient Technical Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
        {/* Large Prominent Profile Photo Frame */}
        <div className="relative shrink-0 group">
          <div className="absolute -inset-1.5 bg-gradient-to-br from-amber-500/40 via-amber-700/20 to-transparent rounded-3xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-2xl overflow-hidden bg-[#131926] border-2 border-white/15 shadow-2xl">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1A2234] to-[#0D111A] text-slate-400 p-4 text-center">
                <span className="text-4xl mb-2">👤</span>
                <span className="text-xs font-mono text-amber-400 font-semibold">
                  {name}
                </span>
                <span className="text-[10px] font-mono text-slate-500 mt-1">
                  Profile Portrait
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Identity & Typography Container */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
          <Badge variant="accent" dot>
            {title || 'Machine Learning Engineer'}
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
            {name}
          </h1>

          <p className="text-base sm:text-lg text-amber-400/90 font-mono font-medium">
            {title}
          </p>

          <p className="text-sm md:text-base text-slate-400 max-w-xl leading-relaxed">
            {introduction}
          </p>

          {/* Action CTAs */}
          {actions && (
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {actions}
            </div>
          )}

          {/* Social Links */}
          {socials && (
            <div className="pt-3 flex items-center justify-center lg:justify-start gap-4 text-slate-400">
              {socials}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
