'use client';

import React from 'react';
import type { SiteSettings } from '@/lib/supabase/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface SEOSettingsFormProps {
  settings: Partial<SiteSettings>;
  onChange: (field: keyof SiteSettings, value: any) => void;
  onOpenMediaSelector: (field: 'og_image') => void;
}

export const SEOSettingsForm: React.FC<SEOSettingsFormProps> = ({
  settings,
  onChange,
  onOpenMediaSelector,
}) => {
  const allowIndexing = settings.allow_indexing !== false;

  return (
    <div className="space-y-6">
      {/* Informational Banner on Global SEO Scope */}
      <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 space-y-1">
        <div className="flex items-center gap-2 font-bold font-mono">
          <span>🌐</span> Global Search Engine & Social Defaults
        </div>
        <p className="text-[11px] text-sky-200/90 leading-relaxed">
          These settings serve as the default metadata across search engines, browser headers, and social media platforms (Open Graph, Twitter Cards).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* SEO Default Title */}
        <div className="md:col-span-2">
          <Input
            label="Default Document Title (<title>)"
            helperText="Appears in the browser tab and search results (recommended length: 50-60 characters)."
            type="text"
            value={settings.seo_title || ''}
            onChange={(e) => onChange('seo_title', e.target.value)}
            placeholder="e.g. Mohamed Alaa | Machine Learning Engineer Portfolio"
            required
          />
        </div>

        {/* SEO Meta Description */}
        <div className="md:col-span-2">
          <Textarea
            label="Default Meta Description"
            helperText="Search snippet displayed under your title in search engine results (recommended: 120-160 characters)."
            rows={3}
            value={settings.seo_description || ''}
            onChange={(e) => onChange('seo_description', e.target.value)}
            placeholder="e.g. Portfolio of Mohamed Alaa, Machine Learning Engineer specializing in AI, Deep Learning, and data-driven systems."
            required
          />
        </div>

        {/* Canonical Base URL */}
        <div className="md:col-span-2">
          <Input
            label="Canonical / Base Website URL"
            helperText="The authoritative base URL of your live site (e.g. 'https://mohamedkhaled.dev'). Prevents duplicate content penalties."
            type="url"
            value={settings.canonical_url || ''}
            onChange={(e) => onChange('canonical_url', e.target.value)}
            placeholder="https://mohamedkhaled.dev"
          />
        </div>
      </div>

      {/* Social Preview / Open Graph Image */}
      <div className="pt-6 border-t border-white/10 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
          Social Sharing Preview Image (Open Graph)
        </h3>
        <p className="text-xs text-slate-400">
          The primary preview graphic displayed when links to your portfolio are shared on LinkedIn, X / Twitter, WhatsApp, and Slack.
        </p>

        <div className="p-4 rounded-xl bg-[#080B11] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {settings.og_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.og_image_url}
                alt="Open Graph preview"
                className="w-24 h-14 object-cover rounded-lg border border-white/10"
              />
            ) : (
              <div className="w-24 h-14 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-[10px] text-slate-500 font-mono text-center p-1">
                Profile Photo Fallback
              </div>
            )}
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold text-slate-200 block">
                {settings.og_image_url ? settings.og_image_url.split('/').pop() : 'Default /images/profile.jpg'}
              </span>
              <span className="text-[11px] text-slate-400 block">
                Recommended dimension: 1200 × 630 px (1.91:1 aspect ratio)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenMediaSelector('og_image')}
              className="text-xs font-mono"
            >
              {settings.og_image_url ? 'Replace Image' : 'Select From Media'}
            </Button>
            {settings.og_image_url && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange('og_image', null);
                  onChange('og_image_url', null);
                }}
                className="text-xs font-mono text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              >
                ✕
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search Engine Robots Indexing Preference */}
      <div className="pt-6 border-t border-white/10 space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
          Search Engine Robots & Indexing
        </h3>

        <div className="p-4 rounded-xl bg-[#080B11] border border-white/10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-slate-200 block">
              Allow Search Engine Indexing
            </span>
            <p className="text-[11px] text-slate-400 max-w-lg">
              Controls the <code>&lt;meta name=&quot;robots&quot;&gt;</code> tag. When enabled, Google and other crawlers index your pages. Disable if this instance is staging or private.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={allowIndexing}
            onClick={() => onChange('allow_indexing', !allowIndexing)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[#080B11] ${
              allowIndexing ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                allowIndexing ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
