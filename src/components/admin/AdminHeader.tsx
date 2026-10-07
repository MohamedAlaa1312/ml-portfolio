'use client';

import React from 'react';
import Link from 'next/link';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  adminEmail?: string;
  onMobileMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title = 'Dashboard',
  subtitle = 'Manage your portfolio content and settings.',
  adminEmail = 'Admin',
  onMobileMenuToggle,
  mobileMenuOpen = false,
}) => {
  const emailInitial = adminEmail.slice(0, 1).toUpperCase() || 'A';

  return (
    <header className="sticky top-0 z-40 bg-[#080B11]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumb/Title */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 focus-ring min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            {mobileMenuOpen ? (
              <span className="text-lg font-mono">✕</span>
            ) : (
              <span className="text-lg font-mono">☰</span>
            )}
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Admin</span>
            <span className="text-xs font-mono text-slate-600">/</span>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Security Pill & Account Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Security Badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>AUTHORIZED</span>
        </div>

        {/* Authenticated Draft Preview */}
        <Link
          href="/admin/preview"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono text-amber-300 transition-colors"
          title="Open authenticated preview with staged draft changes"
        >
          <span>Preview Draft</span>
          <span>↗</span>
        </Link>

        {/* View Live Public Site */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          title="Open live public portfolio"
        >
          <span>Live Site</span>
          <span>↗</span>
        </Link>

        {/* Admin User Pill */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 sm:border-l sm:border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-black font-bold text-xs flex items-center justify-center shadow-md shadow-amber-500/20">
            {emailInitial}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-bold text-slate-200 leading-tight max-w-[140px] truncate">
              {adminEmail}
            </span>
            <span className="block text-[10px] text-amber-500/90 font-mono">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};
