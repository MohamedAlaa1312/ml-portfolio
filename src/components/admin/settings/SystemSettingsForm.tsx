'use client';

import React from 'react';
import type { SiteSettings } from '@/lib/supabase/types';

interface SystemSettingsFormProps {
  settings: Partial<SiteSettings>;
  onChange: (field: keyof SiteSettings, value: any) => void;
}

export const SystemSettingsForm: React.FC<SystemSettingsFormProps> = ({
  settings,
  onChange,
}) => {
  const itemsPerPage = settings.default_items_per_page || 10;
  const enableContact = settings.enable_contact_form !== false;
  const analyticsEnabled = Boolean(settings.analytics_enabled);

  return (
    <div className="space-y-6">
      {/* Safe Environment Secrets Guarantee Banner */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
        <div className="flex items-center gap-2 font-bold font-mono">
          <span>🛡️</span> Security & Credentials Isolation
        </div>
        <p className="text-[11px] text-emerald-200/90 leading-relaxed">
          Sensitive server credentials (such as Supabase service-role keys, database passwords, JWT secrets, and OAuth secrets) are strictly managed via server environment variables (<code>.env.local</code>) and are never exposed to or editable via client forms.
        </p>
      </div>

      <div className="space-y-4">
        {/* 1. Default Items Per Page */}
        <div className="p-4 rounded-xl bg-[#080B11] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-slate-200 block">
              Default Items Per Page
            </span>
            <p className="text-[11px] text-slate-400 max-w-lg">
              Controls the default pagination limit for administrative lists and data tables (Projects, Certifications, Experience, Media).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[10, 25, 50].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => onChange('default_items_per_page', count)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  itemsPerPage === count
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-[#0D111A] border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {count} / page
              </button>
            ))}
          </div>
        </div>

        {/* 2. Public Contact Form Message Submissions */}
        <div className="p-4 rounded-xl bg-[#080B11] border border-white/10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-slate-200 block">
              Enable Public Contact Messaging
            </span>
            <p className="text-[11px] text-slate-400 max-w-lg">
              Allows visitors on the public portfolio to submit direct inquiries through the interactive contact section form.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enableContact}
            onClick={() => onChange('enable_contact_form', !enableContact)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[#080B11] ${
              enableContact ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                enableContact ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3. Analytics & Telemetry */}
        <div className="p-4 rounded-xl bg-[#080B11] border border-white/10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-slate-200 block">
              Enable Visitor Telemetry / Web Vitals
            </span>
            <p className="text-[11px] text-slate-400 max-w-lg">
              Collects anonymous Next.js Core Web Vitals and load performance metrics for system optimization.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={analyticsEnabled}
            onClick={() => onChange('analytics_enabled', !analyticsEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[#080B11] ${
              analyticsEnabled ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                analyticsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
