import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import type { AboutContent, SiteSettings } from '@/lib/supabase/types';

interface AboutSectionProps {
  content?: AboutContent;
  settings?: SiteSettings | null;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ content, settings }) => {
  const badge = content?.badge || 'About Me';
  const heading = content?.heading ?? 'Turning Data Into Intelligent Solutions';
  const description =
    content?.description ??
    settings?.bio ??
    'I am a Machine Learning Engineer with a passion for building AI systems that solve real-world problems. I enjoy working with data, designing models, and turning complex ideas into practical solutions.';

  const defaultPillars = [
    { title: 'Problem Solver', description: 'Finds effective solutions', icon: '⚡' },
    { title: 'Continuous Learner', description: 'Always exploring modern architectures', icon: '🧠' },
    { title: 'Team Player', description: 'Builds great products in production', icon: '🤝' },
  ];

  const pillars = content?.pillars !== undefined ? content.pillars : defaultPillars;
  const avatarUrl =
    content?.avatarUrl ||
    settings?.profile_image_url ||
    settings?.profile_image ||
    '/images/about-profile.jpg';

  return (
    <section id="about" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Text & Pillars */}
        <div className="lg:col-span-7 space-y-6">
          <Badge variant="accent" dot>
            {badge}
          </Badge>

          {heading && (
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-100 leading-tight">
              {heading}
            </h2>
          )}

          {description && (
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}

          {/* Pillar Cards (if configured) */}
          {pillars.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {pillars.map((pillar, i) => (
                <Card key={i} variant="standard" className="border-white/10 bg-[#0D111A]">
                  <CardContent className="p-5 space-y-2">
                    <div className="text-xl mb-1">{pillar.icon || '✦'}</div>
                    <h3 className="text-sm font-bold text-slate-100">{pillar.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Secondary Portrait Frame with subtle border */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative group max-w-xs sm:max-w-sm w-full">
            <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-2xl blur-sm opacity-60" />
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#131926] border border-white/15 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={settings?.name ? `${settings.name} — Machine Learning Engineer` : 'About Mohamed Khaled'}
                className="w-full h-full object-cover object-center filter contrast-105"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
