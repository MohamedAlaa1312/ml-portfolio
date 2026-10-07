'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SiteSettings, MediaItemWithUsage } from '@/lib/supabase/types';
import { Button } from '@/components/ui/Button';
import { MediaSelectorModal } from '@/components/admin/media/MediaSelectorModal';
import { SettingsSummary } from './SettingsSummary';
import { GeneralSettingsForm } from './GeneralSettingsForm';
import { SEOSettingsForm } from './SEOSettingsForm';
import { AppearanceSettingsForm } from './AppearanceSettingsForm';
import { SystemSettingsForm } from './SystemSettingsForm';

type SettingsTab = 'general' | 'seo' | 'appearance' | 'system';

interface SettingsManagerProps {
  initialSettings: SiteSettings;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ initialSettings }) => {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Media selector modal state
  const [mediaTarget, setMediaTarget] = useState<'logo' | 'favicon' | 'resume' | 'og_image' | null>(
    null
  );

  // Notification feedback
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Warn on browser unload if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleMediaSelect = (media: MediaItemWithUsage) => {
    if (!mediaTarget) return;

    if (mediaTarget === 'logo') {
      handleChange('logo', media.public_url);
      handleChange('logo_url', media.public_url);
    } else if (mediaTarget === 'favicon') {
      handleChange('favicon', media.public_url);
      handleChange('favicon_url', media.public_url);
    } else if (mediaTarget === 'resume') {
      handleChange('resume', media.public_url);
      handleChange('resume_url', media.public_url);
    } else if (mediaTarget === 'og_image') {
      handleChange('og_image', media.public_url);
      handleChange('og_image_url', media.public_url);
    }

    setMediaTarget(null);
    showNotification(`Selected ${media.title || media.file_name} from Media Library.`);
  };

  // Save Direct to Live (Production Publish)
  const handleSaveLive = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings.');
      }

      setSettings(data.settings);
      setHasUnsavedChanges(false);
      showNotification('Global settings published live successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving settings';
      showNotification(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save into Draft Staging (Phase 13 Draft Lifecycle)
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const res = await fetch('/api/admin/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: 'site_settings',
          entity_id: 'singleton',
          title: `Settings Draft (${settings.site_name || 'Global'})`,
          data: settings,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to stage draft.');
      }

      setHasUnsavedChanges(false);
      showNotification('Settings saved as Draft! Review changes in Preview Mode.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error staging draft';
      showNotification(msg, 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {feedback && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border text-xs font-mono font-semibold flex items-center gap-3 backdrop-blur-md transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}
        >
          <span>{feedback.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. Configuration Overview Header Summary */}
      <SettingsSummary settings={settings} />

      {/* 2. Main Content Card with Navigation Tabs */}
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 pt-4 bg-[#080B11]/50 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'general', label: 'General', icon: '🌐' },
              { id: 'seo', label: 'SEO & Social', icon: '🔍' },
              { id: 'appearance', label: 'Appearance', icon: '🎨' },
              { id: 'system', label: 'System', icon: '⚙️' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-mono font-bold border-b-2 transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-white/10'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Unsaved changes badge */}
          {hasUnsavedChanges && (
            <span className="text-[11px] font-mono text-amber-400 font-semibold hidden md:inline-block animate-pulse">
              ● Unsaved Changes
            </span>
          )}
        </div>

        {/* Tab Panel Body */}
        <div className="p-6">
          {activeTab === 'general' && (
            <GeneralSettingsForm
              settings={settings}
              onChange={handleChange}
              onOpenMediaSelector={setMediaTarget}
            />
          )}

          {activeTab === 'seo' && (
            <SEOSettingsForm
              settings={settings}
              onChange={handleChange}
              onOpenMediaSelector={setMediaTarget}
            />
          )}

          {activeTab === 'appearance' && (
            <AppearanceSettingsForm settings={settings} onChange={handleChange} />
          )}

          {activeTab === 'system' && (
            <SystemSettingsForm settings={settings} onChange={handleChange} />
          )}
        </div>

        {/* Action Toolbar Footer */}
        <div className="p-5 sm:p-6 border-t border-white/10 bg-[#080B11]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link
              href="/admin/preview"
              target="_blank"
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>👁️</span> Open Preview Mode ↗
            </Link>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving || isSavingDraft}
              onClick={handleSaveDraft}
              className="font-mono text-xs"
            >
              {isSavingDraft ? 'Staging...' : 'Save Draft'}
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isSaving || isSavingDraft}
              onClick={handleSaveLive}
              className="font-mono text-xs font-bold"
            >
              {isSaving ? 'Publishing...' : 'Save & Publish Live'}
            </Button>
          </div>
        </div>
      </div>

      {/* Reusable Media Selector Modal */}
      <MediaSelectorModal
        isOpen={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        onSelect={handleMediaSelect}
        allowedTypes={mediaTarget === 'resume' ? ['document'] : ['image']}
        title={`Select Asset for ${
          mediaTarget === 'logo'
            ? 'Brand Logo'
            : mediaTarget === 'favicon'
            ? 'Browser Favicon'
            : mediaTarget === 'resume'
            ? 'Resume / CV Document'
            : 'Social Preview Image'
        }`}
      />
    </div>
  );
};
