'use client';

import React from 'react';
import type { ThemeHeroProps } from '../../types';
import { parseSocialLinks, getPlatformIcon } from '@/lib/social-utils';

export const EditorialHero: React.FC<ThemeHeroProps> = ({ content, settings }) => {
  const greeting = content?.greeting || 'PORTFOLIO // VOLUME 01';
  const name = settings?.name || 'Mohamed Alaa';
  const role = settings?.professional_title || 'Machine Learning Engineer';
  const summary =
    content?.summary ||
    settings?.bio ||
    'Building reliable, scalable AI systems, deep learning models, and high-performance inference pipelines for production environments.';
  const primaryCta = content?.primaryCta || { label: 'Explore Projects →', anchor: '#projects' };
  const secondaryCta = content?.secondaryCta;
  const avatarUrl = settings?.profile_image_url || settings?.profile_image || '/images/profile.jpg';
  const location = settings?.location?.trim();

  const socialLinks = parseSocialLinks(settings?.social_links).filter(
    (s) => s.enabled && s.status !== 'archived'
  );

  return (
    <section
      id="hero"
      className="relative w-full py-14 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.08]"
    >
      {/* Top Editorial Index Bar */}
      <div className="flex items-center justify-between pb-8 mb-10 sm:mb-14 border-b border-white/[0.06] text-xs font-mono uppercase tracking-widest text-[#71717A]">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C25E34]" />
          <span>INDEX // 00</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:inline text-[#A1A1AA]">TECHNICAL DOSSIER</span>
        </div>
        {location ? (
          <div className="text-right">
            <span>LOC: {location}</span>
          </div>
        ) : (
          <div className="text-right">
            <span>SYSTEM STATUS: ACTIVE</span>
          </div>
        )}
      </div>

      {/* Editorial Grid: Asymmetric Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-start">
        {/* Left Column: Identity, Narrative, CTAs, Social (col-7) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8 order-1">
          {/* Greeting / Monograph Label */}
          <div className="space-y-3">
            <span className="inline-block text-[11px] font-mono tracking-widest uppercase text-[#C25E34]">
              {greeting}
            </span>

            {/* Authoritative Name (H1) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#EDEDEC] leading-[1.08]">
              {name}
            </h1>

            {/* Professional Title */}
            <p className="text-xl sm:text-2xl font-mono font-medium text-[#A1A1AA] pt-1">
              {role}
            </p>

            {settings?.subtitle && (
              <p className="text-sm font-mono text-[#71717A] tracking-wide">
                {settings.subtitle}
              </p>
            )}
          </div>

          {/* Editorial Summary */}
          <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl leading-relaxed font-sans">
            {summary}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {primaryCta?.label && primaryCta?.anchor && (
              <a
                href={primaryCta.anchor}
                className="inline-flex items-center justify-center px-6 py-3 rounded bg-[#EDEDEC] hover:bg-white text-[#0C0D0E] font-mono text-xs uppercase tracking-wider font-semibold transition-all min-h-[44px] shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C25E34]"
              >
                {primaryCta.label}
              </a>
            )}

            {secondaryCta?.label && secondaryCta?.anchor && (
              <a
                href={secondaryCta.anchor}
                className="inline-flex items-center justify-center px-6 py-3 rounded border border-white/20 hover:border-[#EDEDEC] bg-white/[0.03] hover:bg-white/[0.08] text-[#EDEDEC] font-mono text-xs uppercase tracking-wider font-medium transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C25E34]"
              >
                {secondaryCta.label}
              </a>
            )}
          </div>

          {/* CMS Dynamic Social Links */}
          {socialLinks.length > 0 && (
            <div className="pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-[#71717A]">
              <span className="text-[10px] uppercase tracking-widest text-[#71717A] mr-1">
                DISPATCH //
              </span>
              {socialLinks.map((link, idx) => (
                <React.Fragment key={link.id}>
                  <a
                    href={link.url}
                    target={link.url.startsWith('mailto:') ? '_self' : '_blank'}
                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="inline-flex items-center gap-1.5 text-[#A1A1AA] hover:text-[#EDEDEC] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C25E34] rounded"
                    aria-label={`${name} on ${link.platform}`}
                  >
                    <span>{link.icon || getPlatformIcon(link.platform)}</span>
                    <span>{link.label || link.platform}</span>
                  </a>
                  {idx < socialLinks.length - 1 && (
                    <span className="text-white/10 select-none">{'//'}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Prominent Large Portrait Frame (col-5) */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end order-2">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-none">
            {/* Technical Frame with Fine Borders */}
            <div className="relative p-2.5 rounded bg-[#121417] border border-white/[0.12] shadow-2xl">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#C25E34]" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#C25E34]" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#C25E34]" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#C25E34]" />

              {/* Large Portrait Image Container */}
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded bg-[#17191E]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt={`Portrait of ${name} — ${role}`}
                  className="w-full h-full object-cover object-top filter contrast-[1.03]"
                  loading="eager"
                />
              </div>

              {/* Editorial Technical Caption */}
              <div className="pt-3 pb-1 px-1 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#71717A]">
                <span className="text-[#A1A1AA]">FIG 01. PORTRAIT</span>
                <span>{role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
