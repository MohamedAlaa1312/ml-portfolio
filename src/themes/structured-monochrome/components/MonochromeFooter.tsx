'use client';

import React from 'react';
import type { ThemeFooterProps } from '../../types';

export const MonochromeFooter: React.FC<ThemeFooterProps> = ({
  name = 'Mohamed Khaled',
  role = 'Machine Learning Engineer',
  sections,
}) => {
  const defaultNavLinks = [
    { label: 'TOP', href: '#hero' },
    { label: 'ABOUT', href: '#about' },
    { label: 'EXPERIENCE', href: '#experience' },
    { label: 'SKILLS', href: '#skills' },
    { label: 'PROJECTS', href: '#projects' },
    { label: 'CREDENTIALS', href: '#certifications' },
    { label: 'CONTACT', href: '#contact' },
  ];

  const navLinks =
    sections && sections.length > 0
      ? [
          { label: 'TOP', href: '#hero' },
          ...sections
            .filter((s) => s.enabled && s.status === 'published' && s.type !== 'hero')
            .sort((a, b) => a.display_order - b.display_order)
            .map((s) => {
              let tag = s.title.toUpperCase();
              if (s.type === 'about') tag = 'ABOUT';
              else if (s.type === 'experience') tag = 'EXPERIENCE';
              else if (s.type === 'skills') tag = 'SKILLS';
              else if (s.type === 'projects') tag = 'PROJECTS';
              else if (s.type === 'certifications') tag = 'CREDENTIALS';
              else if (s.type === 'contact') tag = 'CONTACT';

              return {
                label: tag,
                href: `#${s.slug || s.type}`,
              };
            }),
        ]
      : defaultNavLinks;

  return (
    <footer className="bg-[#050505] border-t border-white/[0.15] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 font-mono text-xs">
        {/* Architectural Monogram & Name */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 border border-white flex items-center justify-center text-[10px] text-white font-bold">
              MK
            </span>
            <span className="font-bold tracking-widest text-white uppercase">
              {name}
            </span>
          </div>
          <p className="text-[11px] text-[#737373] uppercase tracking-wider">
            {role}
          </p>
        </div>

        {/* Minimal Anchor Registry */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-[#737373] uppercase tracking-widest">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* System Ledger & Active Theme Stamp */}
        <div className="text-left md:text-right text-[11px] text-[#737373] space-y-0.5">
          <p>© {new Date().getFullYear()} {name.toUpperCase()}.</p>
          <p className="text-white/60">THEME: STRUCTURED MONOCHROME v1.0.0</p>
        </div>
      </div>
    </footer>
  );
};
