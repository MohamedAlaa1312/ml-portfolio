'use client';

import React from 'react';
import type { ThemeAboutProps } from '../../types';

export const EditorialAbout: React.FC<ThemeAboutProps> = ({ content, settings }) => {
  const badge = content?.badge || 'DOSSIER // 01';
  const heading = content?.heading ?? 'Turning Data Into Intelligent Solutions';
  const description =
    content?.description ??
    settings?.bio ??
    'I am a Machine Learning Engineer focused on developing robust AI architectures, designing deep learning models, and building reliable data pipelines for complex production challenges.';

  const pillars = content?.pillars || [];
  const avatarUrl =
    content?.avatarUrl ||
    settings?.profile_image_url ||
    settings?.profile_image ||
    '/images/about-profile.jpg';

  return (
    <section
      id="about"
      className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.08]"
    >
      {/* Editorial Section Header */}
      <div className="pb-8 mb-12 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#71717A]">
        <div className="flex items-center gap-2">
          <span className="text-[#C25E34]">01</span>
          <span>/</span>
          <span>ABOUT</span>
        </div>
        <span>{badge}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Heading, Biography, Pillars (col-7) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#EDEDEC] leading-tight font-sans">
              {heading}
            </h2>
            <div className="w-12 h-0.5 bg-[#C25E34]" />
          </div>

          <div className="prose prose-invert max-w-none text-[#A1A1AA] text-base sm:text-lg leading-relaxed space-y-4">
            <p>{description}</p>
          </div>

          {/* Pillars / Technical Philosophies (if configured in CMS) */}
          {pillars.length > 0 && (
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {pillars.map((pillar, i) => (
                <div
                  key={i}
                  className="p-5 rounded bg-[#121417] border border-white/[0.08] hover:border-white/[0.18] transition-colors"
                >
                  <div className="text-lg text-[#C25E34] mb-2">{pillar.icon || '✦'}</div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#EDEDEC] font-semibold">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#71717A] mt-1.5 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Editorial Secondary Portrait / Focus Frame (col-5) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-sm">
            <div className="p-2 rounded bg-[#121417] border border-white/[0.10]">
              <div className="relative aspect-[4/5] rounded overflow-hidden bg-[#17191E]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt={settings?.name ? `${settings.name} — Machine Learning Engineer` : 'About Mohamed Alaa'}
                  className="w-full h-full object-cover object-center filter contrast-[1.02]"
                  loading="lazy"
                />
              </div>
              <div className="p-3 text-[11px] font-mono uppercase tracking-widest text-[#71717A] flex items-center justify-between">
                <span>IDENTITY // ARCHIVE</span>
                <span className="text-[#C25E34]">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
