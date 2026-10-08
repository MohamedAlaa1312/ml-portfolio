'use client';

import React, { useState, useEffect } from 'react';
import type { ThemeNavigationProps } from '../../types';

export const MonochromeNavbar: React.FC<ThemeNavigationProps> = ({
  name = 'Mohamed Alaa',
  role = 'Machine Learning Engineer',
  resumeUrl = '/documents/resume.pdf',
  logoUrl,
  siteName,
  sections,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Dynamic Navigation Resolution from CMS sections
  const defaultNavLinks = [
    { label: 'ABOUT', href: '#about', num: '01' },
    { label: 'EXPERIENCE', href: '#experience', num: '02' },
    { label: 'SKILLS', href: '#skills', num: '03' },
    { label: 'PROJECTS', href: '#projects', num: '04' },
    { label: 'CERTIFICATIONS', href: '#certifications', num: '05' },
    { label: 'CONTACT', href: '#contact', num: '06' },
  ];

  const navLinks =
    sections && sections.length > 0
      ? sections
          .filter((s) => s.enabled && s.status === 'published' && s.type !== 'hero')
          .sort((a, b) => a.display_order - b.display_order)
          .map((s, idx) => {
            let label = s.title.toUpperCase();
            if (s.type === 'about') label = 'ABOUT';
            else if (s.type === 'experience') label = 'EXPERIENCE';
            else if (s.type === 'skills') label = 'SKILLS';
            else if (s.type === 'projects') label = 'PROJECTS';
            else if (s.type === 'certifications') label = 'CERTIFICATIONS';
            else if (s.type === 'contact') label = 'CONTACT';

            const numStr = String(idx + 1).padStart(2, '0');
            return {
              label,
              href: `#${s.slug || s.type}`,
              num: numStr,
            };
          })
      : defaultNavLinks;

  return (
    <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-white/[0.12] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Minimal Stark Brand Monogram */}
        <a
          href="#hero"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white p-1 group min-h-[44px]"
          aria-label={`${name} — ${role} Portfolio`}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={siteName || name}
              className="w-6 h-6 object-contain filter grayscale contrast-125"
            />
          ) : (
            <span className="font-mono font-black text-sm tracking-tighter text-white group-hover:text-neutral-300 transition-colors">
              M.K.
            </span>
          )}
          <span className="hidden sm:inline-block font-mono text-[11px] tracking-widest uppercase text-[#737373]">
            / ML.ENGINEER
          </span>
        </a>

        {/* Desktop Minimal Navigation Links */}
        <nav
          aria-label="Monochrome Navigation"
          className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-mono tracking-widest"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-[#A3A3A3] hover:text-white transition-colors py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              <span>{link.label}</span>
              <span className="text-[10px] text-[#737373] ml-1.5 select-none">{link.num}</span>
            </a>
          ))}
        </nav>

        {/* Minimal Action / Resume */}
        <div className="hidden sm:flex items-center gap-4">
          {resumeUrl && (
            <a
              href={resumeUrl}
              target={resumeUrl.startsWith('http') || resumeUrl.endsWith('.pdf') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-3 py-1 border border-white/30 hover:border-white text-xs font-mono uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all min-h-[36px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              RESUME [PDF]
            </a>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="monochrome-mobile-nav"
          className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-neutral-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white cursor-pointer"
        >
          {mobileMenuOpen ? (
            <span className="text-base font-mono leading-none">CLOSE</span>
          ) : (
            <span className="text-base font-mono leading-none">MENU</span>
          )}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="monochrome-mobile-nav"
          className="lg:hidden bg-[#050505] border-b border-white/20 px-6 py-6 space-y-4"
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col divide-y divide-white/10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#A3A3A3] hover:text-white min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                <span>{link.label}</span>
                <span className="text-[10px] text-[#737373]">{link.num}</span>
              </a>
            ))}
          </nav>

          {resumeUrl && (
            <div className="pt-2">
              <a
                href={resumeUrl}
                target={resumeUrl.startsWith('http') || resumeUrl.endsWith('.pdf') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 border border-white text-xs font-mono uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                DOWNLOAD RESUME [PDF]
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
