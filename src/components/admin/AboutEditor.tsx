'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import type { Section, AboutContent, AboutPillar, PublishStatus, SiteSettings } from '@/lib/supabase/types';

interface AboutEditorProps {
  initialSection: Section | null;
  siteSettings?: SiteSettings | null;
}

export const AboutEditor: React.FC<AboutEditorProps> = ({
  initialSection,
  siteSettings,
}) => {
  const content = (initialSection?.content as AboutContent) || null;

  // Form State
  const [title, setTitle] = useState(initialSection?.title || 'About Me');
  const [badge, setBadge] = useState(content?.badge || 'About Me');
  const [heading, setHeading] = useState(content?.heading || '');
  const [description, setDescription] = useState(content?.description || '');
  const [avatarUrl, setAvatarUrl] = useState(
    content?.avatarUrl || siteSettings?.profile_image_url || siteSettings?.profile_image || ''
  );
  const [enabled, setEnabled] = useState(
    initialSection ? initialSection.enabled : true
  );
  const [status, setStatus] = useState<PublishStatus>(
    initialSection?.status || 'published'
  );

  // Pillars State
  const [pillars, setPillars] = useState<AboutPillar[]>(
    content?.pillars && content.pillars.length > 0 ? content.pillars : []
  );

  // Interaction States
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mark dirty
  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
    if (feedback) setFeedback(null);
  };

  // Prevent accidental navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Handle Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFeedback({
        type: 'error',
        message: 'Invalid image format. Supported formats: JPEG, PNG, WEBP.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        type: 'error',
        message: 'Image size exceeds 5MB limit. Please choose a smaller file.',
      });
      return;
    }

    setIsUploadingImage(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'portfolio-images');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      setAvatarUrl(data.url);
      markDirty();
      setFeedback({
        type: 'success',
        message: 'Image uploaded successfully. Remember to save your changes.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image upload failed';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Pillar Management
  const addPillar = () => {
    setPillars([...pillars, { title: '', description: '', icon: '✦' }]);
    markDirty();
  };

  const updatePillar = (index: number, field: keyof AboutPillar, value: string) => {
    const updated = [...pillars];
    updated[index] = { ...updated[index], [field]: value };
    setPillars(updated);
    markDirty();
  };

  const removePillar = (index: number) => {
    setPillars(pillars.filter((_, i) => i !== index));
    markDirty();
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const payload = {
        title,
        badge,
        heading,
        description,
        avatarUrl,
        pillars,
        enabled,
        status,
      };

      const res = await fetch('/api/admin/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save changes.');
      }

      setIsDirty(false);
      setFeedback({
        type: 'success',
        message: 'About section updated and published to the public portfolio.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save changes';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const isFormEmpty = !heading && !description && pillars.length === 0;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Action Header & Unsaved Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0D111A] border border-white/10 p-4 sm:p-5 rounded-2xl sticky top-2 z-20 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg shrink-0">
            📝
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-100">About Section Editor</h2>
              {isDirty ? (
                <Badge variant="accent" dot>
                  Unsaved Changes
                </Badge>
              ) : (
                <Badge variant="success" dot>
                  Saved
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Live updates directly sync with the public portfolio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            disabled={!isDirty || isSaving}
            className="min-h-[44px]"
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs font-mono leading-relaxed border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? '✔ ' : '✖ '}
          {feedback.message}
        </div>
      )}

      {/* Empty State Banner (if no content exists yet) */}
      {isFormEmpty && (
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
          <span className="text-amber-400 text-lg">💡</span>
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-bold text-slate-100">About section is currently unpopulated</p>
            <p className="text-slate-400">
              Provide your personal professional summary, headline, and core capabilities below.
              No synthetic biography will be automatically inserted.
            </p>
          </div>
        </div>
      )}

      {/* Grid: 2 Columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Content & Pillars (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card variant="standard" className="bg-[#0D111A] border-white/10">
            <CardHeader className="p-5 sm:p-6 pb-2 sm:pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold text-slate-100">
                Primary Content
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Section Title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    markDirty();
                  }}
                  helperText="Internal display title (e.g. About Me)"
                  required
                />
                <Input
                  label="Badge Tag"
                  value={badge}
                  onChange={(e) => {
                    setBadge(e.target.value);
                    markDirty();
                  }}
                  helperText="Accent pill badge (e.g. About Me)"
                />
              </div>

              <Input
                label="Headline"
                value={heading}
                onChange={(e) => {
                  setHeading(e.target.value);
                  markDirty();
                }}
                placeholder="Turning Data Into Intelligent Solutions"
                helperText="Bold summary headline above the main description"
              />

              <Textarea
                label="About Content / Body"
                rows={6}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  markDirty();
                }}
                placeholder="Enter your professional background, engineering philosophy, and machine learning focus..."
                helperText="Displayed prominently on the public portfolio."
              />
            </CardContent>
          </Card>

          {/* Core Pillars / Capability Cards */}
          <Card variant="standard" className="bg-[#0D111A] border-white/10">
            <CardHeader className="p-5 sm:p-6 pb-2 sm:pb-3 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-100">
                  Core Pillars & Highlights
                </CardTitle>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Supporting capability cards displayed beneath the main bio
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPillar}
                className="text-xs min-h-[36px]"
              >
                + Add Pillar
              </Button>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              {pillars.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-mono">No pillars added yet.</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addPillar}
                    className="mt-2 text-xs text-amber-400 hover:text-amber-300"
                  >
                    + Add your first pillar card
                  </Button>
                </div>
              ) : (
                pillars.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#131926] border border-white/10 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-amber-400">
                        Pillar #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePillar(idx)}
                        className="text-slate-400 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-white/5 transition-colors focus-ring"
                        aria-label={`Remove pillar ${idx + 1}`}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-1">
                        <Input
                          label="Icon / Symbol"
                          value={pillar.icon || ''}
                          onChange={(e) => updatePillar(idx, 'icon', e.target.value)}
                          placeholder="⚡, 🧠, 🤝"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Input
                          label="Title"
                          value={pillar.title}
                          onChange={(e) => updatePillar(idx, 'title', e.target.value)}
                          placeholder="Problem Solver"
                          required
                        />
                      </div>
                    </div>

                    <Input
                      label="Description"
                      value={pillar.description}
                      onChange={(e) => updatePillar(idx, 'description', e.target.value)}
                      placeholder="Finds effective engineering solutions for real-world applications"
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Avatar Media & Visibility Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Section Visibility & Status */}
          <Card variant="standard" className="bg-[#0D111A] border-white/10">
            <CardHeader className="p-5 border-b border-white/5">
              <CardTitle className="text-sm font-bold text-slate-100">
                Section Visibility & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#131926] border border-white/5">
                <div>
                  <label htmlFor="about-enabled-toggle" className="text-xs font-bold text-slate-200 block cursor-pointer">
                    Enable Section
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    {enabled ? 'Visible on public portfolio' : 'Hidden from public visitors'}
                  </span>
                </div>
                <input
                  id="about-enabled-toggle"
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => {
                    setEnabled(e.target.checked);
                    markDirty();
                  }}
                  className="w-5 h-5 rounded bg-[#0D111A] border border-white/20 text-amber-500 focus:ring-amber-500/20 cursor-pointer"
                />
              </div>

              <Select
                label="Publication Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as PublishStatus);
                  markDirty();
                }}
                options={[
                  { value: 'published', label: 'Published (Public)' },
                  { value: 'draft', label: 'Draft (Admin Only)' },
                  { value: 'archived', label: 'Archived (Hidden)' },
                ]}
                helperText="Only published and enabled sections appear on the homepage."
              />
            </CardContent>
          </Card>

          {/* About Section Avatar / Portrait */}
          <Card variant="standard" className="bg-[#0D111A] border-white/10">
            <CardHeader className="p-5 border-b border-white/5">
              <CardTitle className="text-sm font-bold text-slate-100">
                Portrait / Media Frame
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-full max-w-[200px] aspect-[4/5] rounded-xl overflow-hidden bg-[#131926] border border-white/15 relative group">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="About portrait preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono p-4 text-center">
                      <span className="text-2xl mb-2">👤</span>
                      <span>No image set</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs min-h-[36px]"
                    isLoading={isUploadingImage}
                    disabled={isUploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-red-400 hover:text-red-300 min-h-[36px]"
                      onClick={() => {
                        setAvatarUrl('');
                        markDirty();
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <Input
                label="Custom Image URL"
                value={avatarUrl}
                onChange={(e) => {
                  setAvatarUrl(e.target.value);
                  markDirty();
                }}
                placeholder="https://example.com/portrait.jpg"
                helperText="Or provide a direct image link"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
};
