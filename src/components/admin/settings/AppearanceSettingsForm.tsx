'use client';

import React from 'react';
import type { SiteSettings } from '@/lib/supabase/types';

interface AppearanceSettingsFormProps {
  settings: Partial<SiteSettings>;
  onChange: (field: keyof SiteSettings, value: any) => void;
}

const ACCENT_PRESETS = [
  {
    id: 'amber',
    label: 'Warm Amber (Default)',
    description: 'Phase 2 signature design palette. High-contrast energetic engineering aesthetic.',
    primaryBg: 'bg-amber-500',
    ringColor: 'ring-amber-500',
    borderClass: 'border-amber-500/40',
  },
  {
    id: 'emerald',
    label: 'Deep Emerald',
    description: 'Clean data science & production health palette with vibrant green highlights.',
    primaryBg: 'bg-emerald-500',
    ringColor: 'ring-emerald-500',
    borderClass: 'border-emerald-500/40',
  },
  {
    id: 'cyan',
    label: 'Electric Cyan',
    description: 'Modern AI infrastructure & cloud pipeline visual palette with crisp accents.',
    primaryBg: 'bg-cyan-500',
    ringColor: 'ring-cyan-500',
    borderClass: 'border-cyan-500/40',
  },
  {
    id: 'indigo',
    label: 'Deep Indigo',
    description: 'Sophisticated deep learning research and high-performance neural computing theme.',
    primaryBg: 'bg-indigo-500',
    ringColor: 'ring-indigo-500',
    borderClass: 'border-indigo-500/40',
  },
];

export const AppearanceSettingsForm: React.FC<AppearanceSettingsFormProps> = ({
  settings,
  onChange,
}) => {
  const currentTheme = settings.theme_preference || 'dark';
  const currentAccent = settings.accent_color || 'amber';

  return (
    <div className="space-y-6">
      {/* Design System Integrity Guarantee */}
      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 space-y-1">
        <div className="flex items-center gap-2 font-bold font-mono">
          <span>🎨</span> Phase 2 Design System Presets
        </div>
        <p className="text-[11px] text-purple-200/90 leading-relaxed">
          To maintain typographic balance, WCAG contrast standards, and state-of-the-art aesthetics, styling is controlled through curated tokens. Raw CSS and arbitrary color injection are disallowed to protect visual integrity.
        </p>
      </div>

      {/* 1. Theme Mode Selection */}
      <div className="space-y-3">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block">
          Interface Theme Mode
        </label>
        <p className="text-xs text-slate-400">
          Choose whether the portfolio defaults to high-contrast dark mode or adapts to the client system preference.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Dark Mode */}
          <div
            onClick={() => onChange('theme_preference', 'dark')}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3.5 ${
              currentTheme === 'dark'
                ? 'bg-[#0E131F] border-amber-500/50 ring-1 ring-amber-500/50'
                : 'bg-[#080B11] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-2xl pt-0.5">🌙</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100 font-mono">Dark Space Mode</span>
                {currentTheme === 'dark' && (
                  <span className="text-[10px] font-mono text-amber-400 font-semibold">Active</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Deep black (#080B11) obsidian background with high-contrast amber glowing accents.
              </p>
            </div>
          </div>

          {/* System Preference */}
          <div
            onClick={() => onChange('theme_preference', 'system')}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3.5 ${
              currentTheme === 'system'
                ? 'bg-[#0E131F] border-amber-500/50 ring-1 ring-amber-500/50'
                : 'bg-[#080B11] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-2xl pt-0.5">💻</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100 font-mono">System Adaptive</span>
                {currentTheme === 'system' && (
                  <span className="text-[10px] font-mono text-amber-400 font-semibold">Active</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Automatically matches the user browser and operating system appearance setting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Curated Accent Color Presets */}
      <div className="pt-6 border-t border-white/10 space-y-3">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block">
          Global Accent Palette Token
        </label>
        <p className="text-xs text-slate-400">
          Select an architectural accent color preset. All tokens are WCAG AA contrast calibrated for high readability.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {ACCENT_PRESETS.map((preset) => {
            const isSelected = currentAccent === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => onChange('accent_color', preset.id as any)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                  isSelected
                    ? `bg-[#0E131F] ${preset.borderClass} ring-1 ${preset.ringColor}`
                    : 'bg-[#080B11] border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-5 h-5 rounded-full ${preset.primaryBg} shrink-0 mt-0.5 shadow-md`} />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 font-mono">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-mono text-amber-400 font-bold">✓ Selected</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
