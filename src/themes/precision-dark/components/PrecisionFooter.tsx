'use client';

import React from 'react';
import type { ThemeFooterProps } from '../../types';

export const PrecisionFooter: React.FC<ThemeFooterProps> = ({
  name = 'Mohamed Khaled',
  role = 'Machine Learning Engineer',
  sections,
}) => {
  const defaultNavLinks = [
    { label: 'TOP', href: '#hero' },
    { label: 'ABOUT', href: '#about' },
    { label: 'EXP', href: '#experience' },
    { label: 'SKILLS', href: '#skills' },
    { label: 'SYSTEMS', href: '#projects' },
    { label: 'CRED', href: '#certifications' },
    { label: 'DISPATCH', href: '#contact' },
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
              else if (s.type === 'experience') tag = 'EXP';
              else if (s.type === 'skills') tag = 'SKILLS';
              else if (s.type === 'projects') tag = 'SYSTEMS';
              else if (s.type === 'certifications') tag = 'CRED';
              else if (s.type === 'contact') tag = 'DISPATCH';

              return {
                label: tag,
                href: `#${s.slug || s.type}`,
              };
            }),
        ]
      : defaultNavLinks;

  return (
    <footer className="bg-[#08090B] border-t border-white/[0.10] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 font-mono">
        {/* Architectural Identity Badge */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-sm bg-[#12151B] border border-white/20 flex items-center justify-center text-[10px] text-[#F1F5F9] font-bold">
              MK
            </span>
            <span className="font-bold text-xs tracking-wider text-[#F1F5F9] uppercase">
              {name}
            </span>
          </div>
          <p className="text-[10px] text-[#64748B]">
            {role} {'//'} ARCHITECTURE REPOSITORY
          </p>
        </div>

        {/* Quick Nav Anchor Coordinates */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#64748B]">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#F1F5F9] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* System Ledger & Active Theme Metadata */}
        <div className="text-left md:text-right text-[10px] text-[#64748B] space-y-0.5">
          <p>© {new Date().getFullYear()} {name.toUpperCase()}. ALL RIGHTS RESERVED.</p>
          <p className="text-[#F59E0B]">THEME: PRECISION DARK v1.0.0</p>
        </div>
      </div>
    </footer>
  );
};
