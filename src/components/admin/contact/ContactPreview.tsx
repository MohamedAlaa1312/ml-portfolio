'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getPlatformIcon } from '@/lib/social-utils';
import type { ContactContent, Section, SiteSettings, SocialLinkItem } from '@/lib/supabase/types';

interface ContactPreviewProps {
  settings: SiteSettings | null;
  section: Section | null;
  socialLinks: SocialLinkItem[];
}

export const ContactPreview: React.FC<ContactPreviewProps> = ({
  settings,
  section,
  socialLinks,
}) => {
  const content = (section?.content as ContactContent) || {};
  const badge = content.badge || 'Contact';
  const title = content.title || section?.title || 'Get In Touch';
  const subtitle = content.subtitle || 'Feel free to reach out for collaborations, opportunities or just to say hello!';
  const description = content.description || '';
  const availability = content.availabilityText || '';
  const ctaText = content.ctaText || '';
  const ctaUrl = content.ctaUrl || '';

  const email = settings?.email || '';
  const phone = settings?.phone || '';
  const location = settings?.location || '';

  const enabledSocials = socialLinks.filter((s) => s.enabled);

  return (
    <Card variant="standard" className="bg-[#0D111A] border-white/10 overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm">👁️</span>
          <CardTitle className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Live Public Preview
          </CardTitle>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
          Client Output
        </span>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Section Heading Preview */}
        <div className="text-center space-y-2">
          <Badge variant="accent" className="text-[11px] font-mono">
            {badge}
          </Badge>
          <h3 className="text-xl font-extrabold text-slate-100 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Availability Badge (if set) */}
        {availability && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{availability}</span>
            </div>
          </div>
        )}

        {/* Direct Contact Grid */}
        <div className="space-y-3 bg-[#131926] p-4 rounded-xl border border-white/5">
          {/* Email */}
          {email ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm text-amber-400 shrink-0">
                ✉️
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-slate-500 block">Email</span>
                <span className="text-xs font-semibold text-slate-200 truncate block">
                  {email}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] font-mono text-amber-400/80">⚠️ Primary email not set</p>
          )}

          {/* Phone (Only when set) */}
          {phone ? (
            <div className="flex items-center gap-3 pt-2 border-t border-white/5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm text-amber-400 shrink-0">
                📞
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-slate-500 block">Phone</span>
                <span className="text-xs font-semibold text-slate-200 truncate block">
                  {phone}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] font-mono text-slate-500 pt-1">
              (Phone row hidden publicly)
            </p>
          )}

          {/* Location (Only when set) */}
          {location ? (
            <div className="flex items-center gap-3 pt-2 border-t border-white/5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm text-amber-400 shrink-0">
                📍
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-slate-500 block">Location</span>
                <span className="text-xs font-semibold text-slate-200 truncate block">
                  {location}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] font-mono text-slate-500 pt-1">
              (Location row hidden publicly)
            </p>
          )}
        </div>

        {/* Supporting Description (if present) */}
        {description && (
          <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-amber-500/50 pl-3">
            &ldquo;{description}&rdquo;
          </p>
        )}

        {/* CTA Button Preview (if present) */}
        {ctaText && ctaUrl && (
          <div className="pt-2 flex justify-center">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono transition-colors shadow-lg shadow-amber-500/20"
            >
              <span>{ctaText}</span>
              <span>↗</span>
            </a>
          </div>
        )}

        {/* Connected Social Links Preview */}
        <div className="pt-3 border-t border-white/5 space-y-2">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
            Public Social Connect ({enabledSocials.length} links)
          </span>

          {enabledSocials.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono italic">
              No active social links to display.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {enabledSocials.map((link) => (
                <div
                  key={link.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161E31] border border-white/10 text-xs font-mono text-amber-400"
                >
                  <span>{link.icon || getPlatformIcon(link.platform)}</span>
                  <span>{link.label || link.platform}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
