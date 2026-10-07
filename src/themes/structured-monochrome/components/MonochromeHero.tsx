'use client';

import React from 'react';
import type { ThemeHeroProps } from '../../types';
import { parseSocialLinks, getPlatformIcon } from '@/lib/social-utils';

export const MonochromeHero: React.FC<ThemeHeroProps> = ({ content, settings }) => {
  const name = settings?.name || 'Mohamed Khaled';
  const role = settings?.professional_title || 'Machine Learning Engineer';
  const summary =
    content?.summary ||
    settings?.bio ||
    'Designing, evaluating, and deploying production machine learning architectures, deep neural networks, and scalable data intelligence systems.';
  const primaryCta = content?.primaryCta || { label: 'Selected Works ↓', anchor: '#projects' };
  const secondaryCta = content?.secondaryCta;
  const avatarUrl = settings?.profile_image_url || settings?.profile_image || '/images/profile.jpg';
  const location = settings?.location?.trim();

  const socialLinks = parseSocialLinks(settings?.social_links).filter(
    (s) => s.enabled && s.status !== 'archived'
  );

  return (
    <section
      id="hero"
      className="relative w-full py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.15]"
    >
      {/* Top Cover Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-10 sm:mb-14 border-b border-white/[0.12] text-xs font-mono uppercase tracking-widest text-[#737373]">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">PORTFOLIO</span>
          <span>/</span>
          <span>VOLUME 03 — MONOCHROME</span>
        </div>
        <div className="flex items-center gap-4">
          {location && <span>LOCATION: {location.toUpperCase()}</span>}
          <span className="text-white">AVAILABLE FOR ROLES</span>
        </div>
      </div>

      {/* Dominant Billboard Headline Name */}
      <div className="pb-8 mb-10 sm:mb-12 border-b border-white/[0.12]">
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white uppercase leading-[0.88] select-none break-words">
          {name}
        </h1>
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold font-sans tracking-tight text-white uppercase">
            — {role}
          </p>
          {settings?.subtitle && (
            <p className="text-xs sm:text-sm font-mono tracking-widest text-[#A3A3A3] uppercase">
              [{settings.subtitle}]
            </p>
          )}
        </div>
      </div>

      {/* Cover Body Composition: Asymmetric Portrait & Content Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Large Monochrome Portrait Image (col-5 on desktop) */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div className="relative p-2 border border-white/20 bg-[#0A0A0A]">
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#121212] border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={`Portrait of ${name} — ${role}`}
                className="w-full h-full object-cover object-top filter grayscale contrast-125 brightness-95"
                loading="eager"
              />
            </div>
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#737373] uppercase tracking-widest">
              <span className="text-white font-bold">PORTRAIT 01</span>
              <span>FIGURE // MACHINE LEARNING</span>
            </div>
          </div>
        </div>

        {/* Right Column: Statement Narrative, Minimal Action Dock, Social Strip (col-7 on desktop) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8 order-1 lg:order-2">
          {/* Narrative Statement */}
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#737373] block">
              {'// PROFILE STATEMENT'}
            </span>
            <p className="text-lg sm:text-xl lg:text-2xl text-[#E5E5E5] font-sans font-normal leading-relaxed">
              {summary}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-white/10 space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              {primaryCta?.label && primaryCta?.anchor && (
                <a
                  href={primaryCta.anchor}
                  className="inline-flex items-center justify-center px-6 py-3 border border-white bg-white text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-transparent hover:text-white transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  {primaryCta.label}
                </a>
              )}

              {secondaryCta?.label && secondaryCta?.anchor && (
                <a
                  href={secondaryCta.anchor}
                  className="inline-flex items-center justify-center px-6 py-3 border border-white/30 text-white font-mono text-xs uppercase tracking-widest font-semibold hover:border-white hover:bg-white/[0.05] transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  {secondaryCta.label}
                </a>
              )}
            </div>

            {/* Social Channels Strip */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-[#A3A3A3] pt-2">
                <span className="text-[11px] text-[#737373] tracking-widest uppercase">
                  NETWORKS:
                </span>
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target={link.url.startsWith('mailto:') ? '_self' : '_blank'}
                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="inline-flex items-center gap-1.5 text-white hover:text-neutral-400 underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                    aria-label={`${name} on ${link.platform}`}
                  >
                    <span>{link.icon || getPlatformIcon(link.platform)}</span>
                    <span>{link.label || link.platform}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
