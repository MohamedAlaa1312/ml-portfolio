'use client';

import React from 'react';
import type { ThemeAboutProps } from '../../types';

export const MonochromeAbout: React.FC<ThemeAboutProps> = ({ content, settings, sectionIndex }) => {
  const heading = content?.heading ?? 'Turning Data Into Intelligent Solutions';
  const description =
    content?.description ??
    settings?.bio ??
    'I am a Machine Learning Engineer with a passion for designing scalable AI systems that solve real-world problems. Focused on high-efficiency model training, rigorous mathematical formulation, and production engineering.';

  const pillars = content?.pillars || [];
  const avatarUrl =
    content?.avatarUrl ||
    settings?.profile_image_url ||
    settings?.profile_image ||
    '/images/about-profile.jpg';

  const secNum = String((sectionIndex ?? 1)).padStart(2, '0');

  return (
    <section
      id="about"
      className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.15]"
    >
      {/* Stark Section Label */}
      <div className="pb-6 mb-12 sm:mb-16 border-b border-white/[0.12] flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#737373]">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">{secNum}</span>
          <span>—</span>
          <span className="text-white font-bold tracking-widest">ABOUT</span>
        </div>
        <span>ARCHIVE // BIOGRAPHY</span>
      </div>

      {/* Main Typographic Section Body */}
      <div className="space-y-12">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-tight max-w-4xl">
          {heading}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start pt-6 border-t border-white/[0.10]">
          {/* Biography Column (col-7) */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-lg sm:text-xl text-[#A3A3A3] font-sans leading-relaxed">
              {description}
            </p>

            {/* Principles / Pillars in stark typographic rows */}
            {pillars.length > 0 && (
              <div className="pt-8 space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#737373] block">
                  {'// CORE PRINCIPLES'}
                </span>
                <div className="divide-y divide-white/10 border-t border-b border-white/10">
                  {pillars.map((pillar, i) => (
                    <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#737373]">0{i + 1} —</span>
                        <h3 className="text-base font-bold text-white uppercase tracking-tight">
                          {pillar.title}
                        </h3>
                      </div>
                      <p className="text-sm text-[#A3A3A3] max-w-md">
                        {pillar.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Secondary Photo Frame (col-5) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm border border-white/20 p-2 bg-[#0A0A0A]">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#121212] border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt={settings?.name ? `${settings.name} — Machine Learning Engineer` : 'About Mohamed Alaa'}
                  className="w-full h-full object-cover object-center filter grayscale contrast-125"
                  loading="lazy"
                />
              </div>
              <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-[#737373] flex items-center justify-between">
                <span>IDENTITY DOSSIER</span>
                <span className="text-white">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
