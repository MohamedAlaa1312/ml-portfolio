'use client';

import React from 'react';
import type { ThemeFooterProps } from '../../types';

export const EditorialFooter: React.FC<ThemeFooterProps> = ({
  name = 'Mohamed Khaled',
  role = 'Machine Learning Engineer',
  sections,
}) => {
  const defaultNavLinks = [
    { label: '00. TOP', href: '#hero' },
    { label: '01. ABOUT', href: '#about' },
    { label: '02. EXP', href: '#experience' },
    { label: '03. SKILLS', href: '#skills' },
    { label: '04. WORKS', href: '#projects' },
    { label: '05. CRED', href: '#certifications' },
    { label: '06. CONTACT', href: '#contact' },
  ];

  const navLinks =
    sections && sections.length > 0
      ? [
          { label: '00. TOP', href: '#hero' },
          ...sections
            .filter((s) => s.enabled && s.status === 'published' && s.type !== 'hero')
            .sort((a, b) => a.display_order - b.display_order)
            .map((s, idx) => {
              let tag = s.title.toUpperCase();
              if (s.type === 'about') tag = 'ABOUT';
              else if (s.type === 'experience') tag = 'EXP';
              else if (s.type === 'skills') tag = 'SKILLS';
              else if (s.type === 'projects') tag = 'WORKS';
              else if (s.type === 'certifications') tag = 'CRED';
              else if (s.type === 'contact') tag = 'CONTACT';

              const numStr = String(idx + 1).padStart(2, '0');
              return {
                label: `${numStr}. ${tag}`,
                href: `#${s.slug || s.type}`,
              };
            }),
        ]
      : defaultNavLinks;

  return (
    <footer className="bg-[#0C0D0E] border-t border-white/[0.08] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand Colophon */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded bg-[#17191E] border border-white/15 flex items-center justify-center font-mono text-[10px] text-[#EDEDEC]">
              MK
            </span>
            <span className="font-semibold text-sm text-[#EDEDEC]">
              {name}
            </span>
          </div>
          <p className="text-xs font-mono text-[#71717A]">
            {role} {'//'} PORTFOLIO ARCHIVE
          </p>
        </div>

        {/* Quick Nav Anchors */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-[#71717A]">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#EDEDEC] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Colophon & Theme Metadata */}
        <div className="text-left md:text-right text-[11px] font-mono text-[#71717A] space-y-1">
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
          <p className="text-[#A1A1AA]/60">THEME: MODERN TECHNICAL EDITORIAL v1.0.0</p>
        </div>
      </div>
    </footer>
  );
};
