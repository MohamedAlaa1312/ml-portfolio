'use client';

import React, { useState, useEffect } from 'react';
import type { ThemeNavigationProps } from '../../types';

export const EditorialNavbar: React.FC<ThemeNavigationProps> = ({
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
    { label: 'ABOUT', href: '#about', index: '01' },
    { label: 'EXPERIENCE', href: '#experience', index: '02' },
    { label: 'SKILLS', href: '#skills', index: '03' },
    { label: 'PROJECTS', href: '#projects', index: '04' },
    { label: 'CREDENTIALS', href: '#certifications', index: '05' },
    { label: 'CONTACT', href: '#contact', index: '06' },
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
            else if (s.type === 'certifications') label = 'CREDENTIALS';
            else if (s.type === 'contact') label = 'CONTACT';

            const numStr = String(idx + 1).padStart(2, '0');
            return {
              label,
              href: `#${s.slug || s.type}`,
              index: numStr,
            };
          })
      : defaultNavLinks;

  return (
    <header className="sticky top-0 z-50 bg-[#0C0D0E]/95 backdrop-blur-md border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand Monogram & Persona */}
        <a
          href="#hero"
          className="flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C25E34] rounded-lg p-1 group min-h-[44px]"
          aria-label={`${name} — ${role} Home`}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={siteName || name}
              className="w-9 h-9 rounded object-contain border border-white/10 group-hover:border-[#C25E34]/50 transition-colors"
            />
          ) : (
            <div className="w-9 h-9 rounded bg-[#17191E] border border-white/15 flex items-center justify-center font-mono font-semibold text-[#EDEDEC] text-xs group-hover:border-[#C25E34] transition-colors">
              MK
            </div>
          )}
          <div className="text-left">
            <span className="block font-semibold text-sm tracking-tight text-[#EDEDEC] group-hover:text-white transition-colors">
              {name}
            </span>
            <span className="block text-[10px] font-mono tracking-widest uppercase text-[#71717A] group-hover:text-[#A1A1AA] transition-colors">
              {role}
            </span>
          </div>
        </a>

        {/* Desktop Editorial Navigation Links */}
        <nav
          aria-label="Main Editorial Navigation"
          className="hidden lg:flex items-center gap-6 xl:gap-8"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group inline-flex items-center gap-1.5 py-1 text-xs font-mono tracking-wider text-[#A1A1AA] hover:text-[#EDEDEC] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C25E34] rounded"
            >
              <span className="text-[10px] text-[#71717A] group-hover:text-[#C25E34] transition-colors">
                {link.index}.
              </span>
              <span>{link.label}</span>
            </a>
          ))}
        </nav>

        {/* Editorial Action / CV Link */}
        <div className="hidden sm:flex items-center gap-4">
          {resumeUrl && (
            <a
              href={resumeUrl}
              target={resumeUrl.startsWith('http') || resumeUrl.endsWith('.pdf') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-3.5 py-1.5 rounded border border-white/15 hover:border-[#C25E34] bg-transparent hover:bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-[#EDEDEC] hover:text-white transition-all min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C25E34]"
            >
              Resume ↓
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="editorial-mobile-nav"
          className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#EDEDEC] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C25E34] rounded cursor-pointer"
        >
          {mobileMenuOpen ? (
            <span className="text-xl font-mono leading-none">✕</span>
          ) : (
            <span className="text-xl font-mono leading-none">☰</span>
          )}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="editorial-mobile-nav"
          className="lg:hidden bg-[#121417]/98 backdrop-blur-xl border-b border-white/10 px-6 py-6 space-y-4"
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col divide-y divide-white/[0.06]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 flex items-center justify-between text-xs font-mono tracking-wider text-[#A1A1AA] hover:text-[#EDEDEC] min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C25E34]"
              >
                <span>{link.label}</span>
                <span className="text-[10px] text-[#71717A]">{link.index}</span>
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
                className="block text-center w-full py-2.5 rounded border border-white/15 bg-white/[0.04] text-xs font-mono uppercase tracking-wider text-[#EDEDEC] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C25E34]"
              >
                Download Resume ↓
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
