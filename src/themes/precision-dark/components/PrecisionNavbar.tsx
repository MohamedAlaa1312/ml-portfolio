'use client';

import React, { useState, useEffect } from 'react';
import type { ThemeNavigationProps } from '../../types';

export const PrecisionNavbar: React.FC<ThemeNavigationProps> = ({
  name = 'Mohamed Khaled',
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
    { label: 'ABOUT', href: '#about', code: 'SEC.01' },
    { label: 'EXPERIENCE', href: '#experience', code: 'SEC.02' },
    { label: 'SKILLS', href: '#skills', code: 'SEC.03' },
    { label: 'PROJECTS', href: '#projects', code: 'SEC.04' },
    { label: 'CREDENTIALS', href: '#certifications', code: 'SEC.05' },
    { label: 'CONTACT', href: '#contact', code: 'SEC.06' },
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
              code: `SEC.${numStr}`,
            };
          })
      : defaultNavLinks;

  return (
    <header className="sticky top-0 z-50 bg-[#08090B]/95 backdrop-blur-md border-t-2 border-t-[#F59E0B] border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand System Node */}
        <a
          href="#hero"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B] rounded p-1 group min-h-[44px]"
          aria-label={`${name} — ${role} Architecture`}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={siteName || name}
              className="w-7 h-7 rounded-sm object-contain border border-white/15 group-hover:border-[#F59E0B] transition-colors"
            />
          ) : (
            <div className="w-7 h-7 rounded-sm bg-[#12151B] border border-white/20 flex items-center justify-center font-mono font-bold text-[#F1F5F9] text-[10px] group-hover:border-[#F59E0B] transition-colors">
              MK
            </div>
          )}
          <div className="text-left font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs tracking-wider text-[#F1F5F9] group-hover:text-white uppercase transition-colors">
                {name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="System Operational" />
            </div>
            <span className="block text-[9px] tracking-widest uppercase text-[#64748B]">
              SYS.ML // {role}
            </span>
          </div>
        </a>

        {/* Desktop Architectural Navigation Links */}
        <nav
          aria-label="Precision Architectural Navigation"
          className="hidden lg:flex items-center gap-1 xl:gap-2 text-[11px] font-mono tracking-wider"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group px-3 py-1.5 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/[0.04] border border-transparent hover:border-white/10 rounded-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B]"
            >
              <span className="text-[#64748B] group-hover:text-[#F59E0B] mr-1.5 text-[9px]">
                {link.code}
              </span>
              <span>{link.label}</span>
            </a>
          ))}
        </nav>

        {/* Compact Terminal Action */}
        <div className="hidden sm:flex items-center gap-3">
          {resumeUrl && (
            <a
              href={resumeUrl}
              target={resumeUrl.startsWith('http') || resumeUrl.endsWith('.pdf') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-3 py-1 rounded-sm border border-white/20 hover:border-[#F59E0B] bg-[#12151B] text-[11px] font-mono uppercase tracking-wider text-[#F1F5F9] hover:text-[#F59E0B] transition-all min-h-[34px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B]"
            >
              <span>SYS.DOCS // CV</span>
              <span className="ml-1 text-[#F59E0B]">↓</span>
            </a>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close System Menu' : 'Open System Menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="precision-mobile-nav"
          className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#F1F5F9] hover:text-white border border-white/10 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B] cursor-pointer"
        >
          {mobileMenuOpen ? (
            <span className="text-sm font-mono leading-none">✕</span>
          ) : (
            <span className="text-sm font-mono leading-none">☰</span>
          )}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="precision-mobile-nav"
          className="lg:hidden bg-[#0E1014]/98 backdrop-blur-xl border-b border-white/15 px-6 py-5 space-y-4"
        >
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] pb-2 border-b border-white/[0.06]">
            SYSTEM NAVIGATION DIRECTORY
          </div>
          <nav aria-label="Mobile System Navigation" className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-sm bg-[#12151B] border border-white/[0.06] flex items-center justify-between text-xs font-mono tracking-wider text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#F59E0B]/40 min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B]"
              >
                <span>{link.label}</span>
                <span className="text-[10px] text-[#F59E0B] font-mono">{link.code}</span>
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
                className="block text-center w-full py-2.5 rounded-sm border border-[#F59E0B]/40 bg-[#12151B] text-xs font-mono uppercase tracking-wider text-[#F1F5F9] hover:text-[#F59E0B] min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B]"
              >
                DOWNLOAD SPECIFICATION // CV ↓
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
