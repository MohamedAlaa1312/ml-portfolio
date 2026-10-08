'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TextLink } from '@/components/ui/TextLink';
import { parseSocialLinks } from '@/lib/social-utils';
import type { HeroContent, SiteSettings } from '@/lib/supabase/types';

interface HeroSectionProps {
  content?: HeroContent;
  settings?: SiteSettings | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content, settings }) => {
  const greeting = content?.greeting || "Hello, I'm";
  const name = settings?.name || 'Mohamed Alaa';
  const role = settings?.professional_title || 'Machine Learning Engineer';
  const summary =
    content?.summary ||
    settings?.bio ||
    'I build intelligent systems using data, machine learning and modern technologies. Passionate about solving real-world problems and creating impactful solutions.';
  const primaryCta = content?.primaryCta || { label: 'View My Projects', anchor: '#projects' };
  const secondaryCta = content?.secondaryCta || { label: 'Contact Me', anchor: '#contact' };
  const avatarUrl = settings?.profile_image_url || settings?.profile_image || '/images/profile.jpg';

  const socialLinks = parseSocialLinks(settings?.social_links).filter(
    (s) => s.enabled && s.status !== 'archived'
  );

  return (
    <section id="hero" className="relative w-full py-12 sm:py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Subtle Technical Radial Ambient Lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Desktop Composition (>= lg): Photo Left (col-5), Text Right (col-7) */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Large Prominent Portrait Frame */}
        <div className="lg:col-span-5 flex justify-start">
          <div className="relative group">
            {/* Ambient Gold Glow Halo */}
            <div className="absolute -inset-2 bg-gradient-to-br from-amber-500/30 via-amber-600/10 to-transparent rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative w-80 h-96 rounded-2xl overflow-hidden bg-[#0D111A] border-2 border-white/15 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={`Portrait of ${name} — ${role}`}
                className="w-full h-full object-cover object-top filter contrast-105"
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* Identity & Headline Text */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
          <span className="text-amber-500 font-mono text-sm tracking-wide">
            {greeting}
          </span>

          <h1 className="text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
            {name}
          </h1>

          <p className="text-2xl font-semibold text-amber-400/95 font-mono">
            {role}
          </p>

          {settings?.subtitle && (
            <p className="text-lg font-medium text-amber-200/90 font-mono">
              {settings.subtitle}
            </p>
          )}

          <p className="text-base text-slate-300 max-w-xl leading-relaxed">
            {summary}
          </p>

          {/* Action CTAs */}
          <div className="flex items-center gap-4 pt-2">
            <a href={primaryCta.anchor} className="focus-ring rounded-xl">
              <Button variant="primary" size="md" className="font-semibold text-xs font-mono tracking-wide min-h-[44px]">
                {primaryCta.label}
              </Button>
            </a>
            <a href={secondaryCta.anchor} className="focus-ring rounded-xl">
              <Button variant="outline" size="md" className="text-xs font-mono tracking-wide min-h-[44px]">
                {secondaryCta.label}
              </Button>
            </a>
          </div>

          {/* CMS-Driven Dynamic Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 text-slate-400 text-xs font-mono">
              {socialLinks.map((link, idx) => (
                <React.Fragment key={link.id}>
                  <TextLink
                    href={link.url}
                    isExternal={!link.url.startsWith('mailto:')}
                    variant="amber"
                    aria-label={`${name} on ${link.platform}`}
                  >
                    {link.label || link.platform}
                  </TextLink>
                  {idx < socialLinks.length - 1 && <span>•</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Composition (< lg): Strict Hierarchy */}
      {/* 1. Name -> 2. ML Engineer -> 3. Intro -> 4. Large Photo -> 5. CTAs -> 6. Social Links */}
      <div className="lg:hidden flex flex-col items-center text-center space-y-6 relative z-10">
        {/* 1. Greeting & Name */}
        <div className="space-y-2">
          <span className="text-amber-500 font-mono text-xs sm:text-sm tracking-wide block">
            {greeting}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 leading-tight">
            {name}
          </h1>
        </div>

        {/* 2. Machine Learning Engineer */}
        <p className="text-lg sm:text-xl md:text-2xl font-semibold text-amber-400/95 font-mono">
          {role}
        </p>

        {settings?.subtitle && (
          <p className="text-xs sm:text-sm font-mono text-amber-200/90">
            {settings.subtitle}
          </p>
        )}

        {/* 3. Introduction */}
        <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-lg leading-relaxed px-2">
          {summary}
        </p>

        {/* 4. Large Profile Photo */}
        <div className="py-2">
          <div className="relative group mx-auto">
            <div className="absolute -inset-2 bg-gradient-to-br from-amber-500/30 via-amber-600/10 to-transparent rounded-3xl blur-md opacity-75" />
            <div className="relative w-60 h-72 sm:w-68 sm:h-80 md:w-76 md:h-88 rounded-2xl overflow-hidden bg-[#0D111A] border-2 border-white/15 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={`Portrait of ${name} — ${role}`}
                className="w-full h-full object-cover object-top filter contrast-105"
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* 5. Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full max-w-xs sm:max-w-sm">
          <a href={primaryCta.anchor} className="w-full sm:w-auto flex-1 focus-ring rounded-xl">
            <Button variant="primary" size="md" className="w-full font-semibold text-xs font-mono tracking-wide min-h-[44px]">
              {primaryCta.label}
            </Button>
          </a>
          <a href={secondaryCta.anchor} className="w-full sm:w-auto flex-1 focus-ring rounded-xl">
            <Button variant="outline" size="md" className="w-full text-xs font-mono tracking-wide min-h-[44px]">
              {secondaryCta.label}
            </Button>
          </a>
        </div>

        {/* 6. CMS-Driven Dynamic Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 text-slate-400 text-xs font-mono">
            {socialLinks.map((link, idx) => (
              <React.Fragment key={link.id}>
                <TextLink
                  href={link.url}
                  isExternal={!link.url.startsWith('mailto:')}
                  variant="amber"
                  aria-label={`${name} on ${link.platform}`}
                >
                  {link.label || link.platform}
                </TextLink>
                {idx < socialLinks.length - 1 && <span>•</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Subtle Technical Scroll Indicator */}
      <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-500">
        <span className="text-amber-500">01 / 07</span>
        <span className="hidden sm:inline-block tracking-widest uppercase">
          Scroll to explore ↓
        </span>
        <Badge variant="outline" className="text-[10px]">
          ML Engine v3.0
        </Badge>
      </div>
    </section>
  );
};
