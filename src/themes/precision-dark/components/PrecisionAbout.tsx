'use client';

import React from 'react';
import type { ThemeAboutProps } from '../../types';

export const PrecisionAbout: React.FC<ThemeAboutProps> = ({ content, settings, sectionIndex }) => {
  const heading = content?.heading ?? 'Turning Data Into Intelligent Solutions';
  const description =
    content?.description ??
    settings?.bio ??
    'Machine Learning Engineer specializing in designing robust model architectures, optimizing mathematical objective functions, and shipping high-throughput AI pipelines into scalable production clouds.';

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
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.10]"
    >
      {/* Precision Dynamic Section Header */}
      <div className="flex items-center justify-between pb-4 mb-8 sm:mb-12 border-b border-white/[0.08] text-xs font-mono tracking-wider text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className="text-[#F59E0B] font-bold">{`[${secNum}]`}</span>
          <span className="text-white/20">{'//'}</span>
          <span className="text-[#F1F5F9] uppercase font-bold tracking-widest">ABOUT</span>
        </div>
        <span className="text-[10px] text-[#94A3B8]">MODULE: PROFILE_SPEC</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Heading & Biography (col-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#F59E0B] block">
              ENGINEERING PHILOSOPHY & CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9] leading-snug">
              {heading}
            </h2>
          </div>

          <div className="p-5 rounded-sm bg-[#0E1014] border border-white/[0.08] text-sm text-[#94A3B8] leading-relaxed font-sans space-y-3">
            <p>{description}</p>
          </div>

          {/* Structured Technical Spec Matrix / Pillars */}
          {pillars.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {pillars.map((pillar, i) => (
                <div
                  key={i}
                  className="p-4 rounded-sm bg-[#12151B] border border-white/[0.08] hover:border-[#F59E0B]/40 transition-colors"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-[10px] font-mono text-[#64748B]">
                    <span>ATTR.0{i + 1}</span>
                    <span className="text-[#F59E0B]">{pillar.icon || '✦'}</span>
                  </div>
                  <h3 className="text-xs font-mono font-bold text-[#F1F5F9] uppercase tracking-wider">
                    {pillar.title}
                  </h3>
                  <p className="text-[11px] text-[#94A3B8] mt-1.5 leading-normal">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Architectural Secondary Specification Node (col-5) */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
          <div className="w-full max-w-sm rounded-sm bg-[#0E1014] border border-white/[0.10] p-3 shadow-lg">
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-[#12151B] border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={settings?.name ? `${settings.name} — Machine Learning Engineer` : 'About Mohamed Khaled'}
                className="w-full h-full object-cover object-center filter contrast-[1.03]"
                loading="lazy"
              />
            </div>

            <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
              <span className="text-[#F1F5F9] font-bold">CORE ARCHIVE</span>
              <span className="text-[#F59E0B]">STATUS: VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
