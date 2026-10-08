'use client';

import React from 'react';
import type { ThemeHeroProps } from '../../types';
import { parseSocialLinks, getPlatformIcon } from '@/lib/social-utils';

export const PrecisionHero: React.FC<ThemeHeroProps> = ({ content, settings }) => {
  const name = settings?.name || 'Mohamed Alaa';
  const role = settings?.professional_title || 'Machine Learning Engineer';
  const summary =
    content?.summary ||
    settings?.bio ||
    'Architecting high-throughput machine learning systems, deep learning models, and production inference pipelines with rigorous mathematical precision.';
  const primaryCta = content?.primaryCta || { label: 'Explore Systems', anchor: '#projects' };
  const secondaryCta = content?.secondaryCta;
  const avatarUrl = settings?.profile_image_url || settings?.profile_image || '/images/profile.jpg';
  const location = settings?.location?.trim();

  const socialLinks = parseSocialLinks(settings?.social_links).filter(
    (s) => s.enabled && s.status !== 'archived'
  );

  return (
    <section
      id="hero"
      className="relative w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.10]"
    >
      {/* Top System Telemetry / Header Line */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 sm:mb-12 border-b border-white/[0.08] text-[11px] font-mono tracking-wider text-[#64748B]">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-sm bg-[#12151B] border border-white/10 text-[#F59E0B]">
            CORE.SYS // v2.0
          </span>
          <span className="text-[#94A3B8]">DISCIPLINE: MACHINE LEARNING</span>
        </div>
        <div className="flex items-center gap-4">
          {location && (
            <span>NODE // {location.toUpperCase()}</span>
          )}
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ONLINE
          </span>
        </div>
      </div>

      {/* Main Architectural Grid: Structured 12-Column Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        {/* Left Column: Geometric Portrait Frame (col-5 on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
          <div className="relative p-3 rounded-sm bg-[#0E1014] border border-white/[0.12] shadow-2xl">
            {/* Architectural Crosshair Alignment Marks */}
            <span className="absolute -top-1.5 -left-1.5 font-mono text-[10px] text-[#F59E0B] leading-none select-none">+</span>
            <span className="absolute -top-1.5 -right-1.5 font-mono text-[10px] text-[#F59E0B] leading-none select-none">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 font-mono text-[10px] text-[#F59E0B] leading-none select-none">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 font-mono text-[10px] text-[#F59E0B] leading-none select-none">+</span>

            {/* Large Sharp Profile Photo Container */}
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-sm bg-[#12151B] border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={`Architectural Portrait of ${name} — ${role}`}
                className="w-full h-full object-cover object-top filter contrast-[1.04]"
                loading="eager"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#08090B] via-[#08090B]/60 to-transparent p-3 pt-8">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#F59E0B] block">
                  NODE SPEC // IDENTITY
                </span>
                <span className="text-xs font-mono text-[#F1F5F9] font-bold">
                  {name.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Geometric Telemetry Bar below Image */}
            <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
              <span>SPEC.ID // ENG.ML</span>
              <span>RENDER: PRODUCTION</span>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Identity, Narrative, Action Dock (col-7 on desktop) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6 order-1 lg:order-2">
          <div className="space-y-4">
            {/* Technical Sub-identifier */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#12151B] border border-white/10 text-[10px] font-mono uppercase tracking-widest text-[#F59E0B]">
              <span>SYSTEM ARCHITECTURE</span>
              <span className="text-white/20">|</span>
              <span className="text-[#94A3B8]">AI // DATA</span>
            </div>

            {/* Authoritative Name (H1) */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-sans font-bold tracking-tight text-[#F1F5F9] leading-tight">
              {name}
            </h1>

            {/* Machine Learning Engineer Title */}
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-6 bg-[#F59E0B]" />
              <p className="text-lg sm:text-xl lg:text-2xl font-mono font-semibold text-[#F59E0B] tracking-wide">
                {role}
              </p>
            </div>

            {settings?.subtitle && (
              <p className="text-xs sm:text-sm font-mono text-[#94A3B8] tracking-wide">
                {settings.subtitle}
              </p>
            )}

            {/* Short Introduction */}
            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-2xl font-sans pt-2">
              {summary}
            </p>
          </div>

          {/* Structured Action Dock */}
          <div className="space-y-6 pt-4 border-t border-white/[0.08]">
            <div className="flex flex-wrap items-center gap-3">
              {primaryCta?.label && primaryCta?.anchor && (
                <a
                  href={primaryCta.anchor}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#08090B] font-mono text-xs uppercase tracking-wider font-bold transition-all min-h-[42px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B]"
                >
                  <span>{primaryCta.label}</span>
                  <span className="ml-2 font-mono">→</span>
                </a>
              )}

              {secondaryCta?.label && secondaryCta?.anchor && (
                <a
                  href={secondaryCta.anchor}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-sm border border-white/20 hover:border-[#F59E0B] bg-[#12151B] text-[#F1F5F9] font-mono text-xs uppercase tracking-wider font-semibold transition-all min-h-[42px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B]"
                >
                  {secondaryCta.label}
                </a>
              )}
            </div>

            {/* Social Links Dock */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] mr-2">
                  CHANNELS:
                </span>
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target={link.url.startsWith('mailto:') ? '_self' : '_blank'}
                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#12151B] border border-white/10 hover:border-[#F59E0B] text-[11px] text-[#94A3B8] hover:text-[#F1F5F9] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B]"
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
