'use client';

import React from 'react';
import type { SiteSettings } from '@/lib/supabase/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface GeneralSettingsFormProps {
  settings: Partial<SiteSettings>;
  onChange: (field: keyof SiteSettings, value: any) => void;
  onOpenMediaSelector: (field: 'logo' | 'favicon' | 'resume') => void;
}

export const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({
  settings,
  onChange,
  onOpenMediaSelector,
}) => {
  return (
    <div className="space-y-6">
      {/* Informational Banner on Source-of-Truth Separation */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
        <div className="flex items-center gap-2 font-bold font-mono">
          <span>ℹ️</span> Single Source of Truth
        </div>
        <p className="text-[11px] text-amber-200/90 leading-relaxed">
          Personal identity fields (such as your personal name, professional headline, biography, and profile headshot) are authoritatively owned by{' '}
          <strong className="underline">Profile CMS</strong>. This section configures global website-level branding and metadata.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Site Name */}
        <div className="md:col-span-2">
          <Input
            label="Website Name"
            helperText="The global brand or site title (e.g. 'Mohamed Alaa Portfolio' or 'MA AI Lab')."
            type="text"
            value={settings.site_name || ''}
            onChange={(e) => onChange('site_name', e.target.value)}
            placeholder="e.g. Mohamed Alaa Portfolio"
            required
          />
        </div>

        {/* Global Site Description */}
        <div className="md:col-span-2">
          <Textarea
            label="Global Site Description"
            helperText="General site summary used as a fallback for document metadata and SEO."
            rows={3}
            value={settings.site_description || ''}
            onChange={(e) => onChange('site_description', e.target.value)}
            placeholder="e.g. Portfolio of Mohamed Alaa, Machine Learning Engineer specializing in AI, Deep Learning, and data-driven systems."
          />
        </div>

        {/* Default Language */}
        <div>
          <Input
            label="Default Language"
            helperText="HTML lang attribute and localization code."
            type="text"
            value={settings.default_language || 'en'}
            onChange={(e) => onChange('default_language', e.target.value)}
            placeholder="en"
          />
        </div>

        {/* Timezone */}
        <div>
          <Input
            label="Timezone"
            helperText="Default time standard for log timestamps and schedules."
            type="text"
            value={settings.timezone || 'UTC'}
            onChange={(e) => onChange('timezone', e.target.value)}
            placeholder="UTC"
          />
        </div>
      </div>

      {/* Global Media Assets Section */}
      <div className="pt-6 border-t border-white/10 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
          Global Media References
        </h3>
        <p className="text-xs text-slate-400">
          Select assets from your centralized Media Library. Removing a reference here will not delete the file from the media library.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Brand Logo */}
          <div className="p-4 rounded-xl bg-[#080B11] border border-white/10 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-200 block">Brand Logo</span>
              <p className="text-[11px] text-slate-400">
                Custom graphic displayed in the website header. If unconfigured, the MK monogram is used.
              </p>
              {settings.logo_url ? (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-black/40 border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.logo_url}
                    alt="Site Logo"
                    className="w-10 h-10 object-contain rounded border border-white/10"
                  />
                  <div className="truncate flex-1">
                    <span className="text-[11px] font-mono text-slate-300 truncate block">
                      {settings.logo_url.split('/').pop()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-12 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-[11px] text-slate-500 font-mono">
                  No custom logo selected
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenMediaSelector('logo')}
                className="text-xs font-mono flex-1"
              >
                {settings.logo_url ? 'Replace Logo' : 'Select Logo'}
              </Button>
              {settings.logo_url && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onChange('logo', null);
                    onChange('logo_url', null);
                  }}
                  className="text-xs font-mono text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                >
                  ✕
                </Button>
              )}
            </div>
          </div>

          {/* 2. Browser Favicon */}
          <div className="p-4 rounded-xl bg-[#080B11] border border-white/10 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-200 block">Browser Favicon</span>
              <p className="text-[11px] text-slate-400">
                Tab icon displayed by web browsers (ICO, PNG, or SVG).
              </p>
              {settings.favicon_url ? (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-black/40 border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.favicon_url}
                    alt="Favicon"
                    className="w-8 h-8 object-contain rounded border border-white/10"
                  />
                  <div className="truncate flex-1">
                    <span className="text-[11px] font-mono text-slate-300 truncate block">
                      {settings.favicon_url.split('/').pop()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-12 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-[11px] text-slate-500 font-mono">
                  Default favicon.ico
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenMediaSelector('favicon')}
                className="text-xs font-mono flex-1"
              >
                {settings.favicon_url ? 'Replace Favicon' : 'Select Favicon'}
              </Button>
              {settings.favicon_url && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onChange('favicon', null);
                    onChange('favicon_url', null);
                  }}
                  className="text-xs font-mono text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                >
                  ✕
                </Button>
              )}
            </div>
          </div>

          {/* 3. Resume / Curriculum Vitae */}
          <div className="p-4 rounded-xl bg-[#080B11] border border-white/10 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-200 block">Resume / CV Document</span>
              <p className="text-[11px] text-slate-400">
                PDF document downloaded via the &ldquo;Download CV&rdquo; action on the public site.
              </p>
              {settings.resume_url ? (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-2xl">📄</span>
                  <div className="truncate flex-1">
                    <span className="text-[11px] font-mono text-slate-300 truncate block">
                      {settings.resume_url.split('/').pop()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-12 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-[11px] text-slate-500 font-mono">
                  No resume linked
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenMediaSelector('resume')}
                className="text-xs font-mono flex-1"
              >
                {settings.resume_url ? 'Replace Document' : 'Select Document'}
              </Button>
              {settings.resume_url && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onChange('resume', null);
                    onChange('resume_url', null);
                  }}
                  className="text-xs font-mono text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                >
                  ✕
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
