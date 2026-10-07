'use client';

import React from 'react';
import type { SiteSettings } from '@/lib/supabase/types';
import { Badge } from '@/components/ui/Badge';

interface SettingsSummaryProps {
  settings: SiteSettings;
}

export const SettingsSummary: React.FC<SettingsSummaryProps> = ({ settings }) => {
  const siteName = settings.site_name || settings.name || 'Not Configured';
  const hasLogo = Boolean(settings.logo_url || settings.logo);
  const hasFavicon = Boolean(settings.favicon_url || settings.favicon);
  const hasResume = Boolean(settings.resume_url || settings.resume);
  const hasOgImage = Boolean(settings.og_image_url || settings.og_image);
  const indexing = settings.allow_indexing !== false;

  return (
    <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
              Site Configuration Overview
            </h2>
            <Badge variant="outline" className="text-[10px] font-mono uppercase text-amber-400 border-amber-500/30">
              Phase 15
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Authoritative global website defaults, search engine metadata, and technical preferences.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Theme:</span>
          <Badge variant="outline" className="text-[11px] capitalize text-slate-300">
            {settings.theme_preference || 'dark'}
          </Badge>
          <span className="text-slate-400 ml-1">Accent:</span>
          <Badge variant="outline" className="text-[11px] capitalize text-amber-400 border-amber-500/30">
            {settings.accent_color || 'amber'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-white/5">
        {/* Site Name */}
        <div className="bg-[#080B11] border border-white/5 rounded-xl p-3">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Site Name</span>
          <span className="text-xs font-semibold text-slate-200 truncate block mt-0.5" title={siteName}>
            {siteName}
          </span>
        </div>

        {/* Brand Logo */}
        <div className="bg-[#080B11] border border-white/5 rounded-xl p-3">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Brand Logo</span>
          <span className="text-xs font-semibold flex items-center gap-1.5 mt-0.5">
            {hasLogo ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span>✓</span> Configured
              </span>
            ) : (
              <span className="text-slate-500">Monogram Fallback</span>
            )}
          </span>
        </div>

        {/* Favicon */}
        <div className="bg-[#080B11] border border-white/5 rounded-xl p-3">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Favicon</span>
          <span className="text-xs font-semibold flex items-center gap-1.5 mt-0.5">
            {hasFavicon ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span>✓</span> Active
              </span>
            ) : (
              <span className="text-slate-500">Default</span>
            )}
          </span>
        </div>

        {/* Social / OG Image */}
        <div className="bg-[#080B11] border border-white/5 rounded-xl p-3">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Social Preview</span>
          <span className="text-xs font-semibold flex items-center gap-1.5 mt-0.5">
            {hasOgImage ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span>✓</span> Configured
              </span>
            ) : (
              <span className="text-amber-400/90">Profile Fallback</span>
            )}
          </span>
        </div>

        {/* Resume Reference */}
        <div className="bg-[#080B11] border border-white/5 rounded-xl p-3">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Resume / CV</span>
          <span className="text-xs font-semibold flex items-center gap-1.5 mt-0.5">
            {hasResume ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span>✓</span> Linked
              </span>
            ) : (
              <span className="text-slate-500">None</span>
            )}
          </span>
        </div>

        {/* Search Engine Indexing */}
        <div className="bg-[#080B11] border border-white/5 rounded-xl p-3">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">SEO Indexing</span>
          <span className="text-xs font-semibold flex items-center gap-1.5 mt-0.5">
            {indexing ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span>🟢</span> Allowed
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <span>🔴</span> Disallowed
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
