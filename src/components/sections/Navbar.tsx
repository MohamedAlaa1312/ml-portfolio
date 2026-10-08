'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

import type { Section } from '@/lib/supabase/types';

interface NavbarProps {
  name?: string;
  role?: string;
  resumeUrl?: string | null;
  logoUrl?: string | null;
  siteName?: string;
  sections?: Section[];
}

export const Navbar: React.FC<NavbarProps> = ({
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

  // Dynamic Navigation Resolution (Requirement 25, 26, 27)
  const defaultNavLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Certifications', href: '#certifications' },
    { label: 'Contact', href: '#contact' },
  ];

  const navLinks =
    sections && sections.length > 0
      ? sections
          .filter((s) => s.enabled && s.status === 'published')
          .sort((a, b) => a.display_order - b.display_order)
          .map((s) => {
            let label = s.title;
            if (s.type === 'hero') label = 'Home';
            else if (s.type === 'about') label = 'About';
            else if (s.type === 'experience') label = 'Experience';
            else if (s.type === 'skills') label = 'Skills';
            else if (s.type === 'projects') label = 'Projects';
            else if (s.type === 'certifications') label = 'Certifications';
            else if (s.type === 'contact') label = 'Contact';

            return {
              label,
              href: `#${s.slug || s.type}`,
            };
          })
      : defaultNavLinks;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#080B11]/90 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Monogram & Persona */}
        <Link
          href="#hero"
          className="flex items-center gap-3 focus-ring rounded-xl p-1 group min-h-[44px]"
          aria-label={`${name} — ${role} Homepage`}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={siteName || name}
              className="w-10 h-10 rounded-xl object-contain border border-white/10 group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              MK
            </div>
          )}
          <div className="text-left">
            <span className="block font-bold text-slate-100 leading-tight group-hover:text-amber-400 transition-colors">
              {name}
            </span>
            <span className="block text-[11px] text-amber-500/90 font-mono">
              {role}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm text-slate-300 font-medium"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-amber-400 focus-ring rounded-lg px-2 py-1.5 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="hidden sm:flex items-center gap-4">
          <a
            href={resumeUrl || '#contact'}
            target={resumeUrl?.startsWith('http') || resumeUrl?.endsWith('.pdf') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="focus-ring rounded-xl"
          >
            <Button variant="outline" size="sm" className="font-mono text-xs min-h-[40px]">
              Download CV ↓
            </Button>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
          className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white focus-ring rounded-xl cursor-pointer"
        >
          {mobileMenuOpen ? (
            <span className="text-xl font-mono leading-none">✕</span>
          ) : (
            <span className="text-xl font-mono leading-none">☰</span>
          )}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden bg-[#0D111A]/95 backdrop-blur-lg border-b border-white/10 px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200"
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1 text-sm font-medium text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-amber-400 hover:bg-white/5 px-3 py-3 rounded-lg border-b border-white/5 flex items-center min-h-[44px] transition-colors focus-ring"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2">
            <a
              href={resumeUrl || '#contact'}
              target={resumeUrl?.startsWith('http') || resumeUrl?.endsWith('.pdf') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="block w-full focus-ring rounded-xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="primary" size="md" className="w-full text-xs font-mono min-h-[44px]">
                Download CV ↓
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
