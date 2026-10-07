'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { isValidEmail, isValidUrl } from '@/lib/social-utils';
import type { ContactContent, PublishStatus, Section, SiteSettings } from '@/lib/supabase/types';

interface ContactFormProps {
  initialSettings: SiteSettings | null;
  initialSection: Section | null;
  onSaveSuccess?: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  initialSettings,
  initialSection,
  onSaveSuccess,
}) => {
  const content = (initialSection?.content as ContactContent) || {};

  // Form State: Direct Contact Details (Stored in site_settings)
  const [email, setEmail] = useState(initialSettings?.email || '');
  const [phone, setPhone] = useState(initialSettings?.phone || '');
  const [location, setLocation] = useState(initialSettings?.location || '');

  // Form State: Section Content (Stored in dynamic sections)
  const [badge, setBadge] = useState(content.badge || 'Contact');
  const [title, setTitle] = useState(content.title || initialSection?.title || 'Get In Touch');
  const [subtitle, setSubtitle] = useState(content.subtitle || '');
  const [description, setDescription] = useState(content.description || '');
  const [ctaText, setCtaText] = useState(content.ctaText || '');
  const [ctaUrl, setCtaUrl] = useState(content.ctaUrl || '');
  const [availabilityText, setAvailabilityText] = useState(content.availabilityText || '');
  const [submitButtonText, setSubmitButtonText] = useState(content.submitButtonText || 'Send Message');
  const [successMessage, setSuccessMessage] = useState(
    content.successMessage || 'Thank you for reaching out! I will review your inquiry and get back to you shortly.'
  );

  // Form State: Section Status & Visibility
  const [status, setStatus] = useState<PublishStatus>(initialSection?.status || 'published');
  const [enabled, setEnabled] = useState<boolean>(initialSection ? initialSection.enabled : true);

  // Interaction States
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Mark form as dirty when any field changes
  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
    if (feedback) setFeedback(null);
  };

  // Prevent accidental navigation when form has unsaved modifications
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

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // 1. Email validation (Requirement 10)
    if (email.trim() && !isValidEmail(email.trim())) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid email address.',
      });
      return;
    }

    // 2. CTA URL validation (Requirement 18 & 19)
    if (ctaUrl.trim() && !isValidUrl(ctaUrl.trim())) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid CTA destination URL (e.g. https://... or mailto:...).',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        contactInfo: {
          email: email.trim(),
          phone: phone.trim() ? phone.trim() : null,
          location: location.trim(),
        },
        sectionContent: {
          badge: badge.trim(),
          title: title.trim(),
          subtitle: subtitle.trim(),
          description: description.trim(),
          ctaText: ctaText.trim(),
          ctaUrl: ctaUrl.trim(),
          availabilityText: availabilityText.trim(),
          submitButtonText: submitButtonText.trim(),
          successMessage: successMessage.trim(),
          enabled,
          status,
        },
      };

      const res = await fetch('/api/admin/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update contact settings.');
      }

      setIsDirty(false);
      setFeedback({
        type: 'success',
        message: 'Contact information updated successfully.',
      });

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save contact settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to original values
  const handleReset = () => {
    setEmail(initialSettings?.email || '');
    setPhone(initialSettings?.phone || '');
    setLocation(initialSettings?.location || '');
    setBadge(content.badge || 'Contact');
    setTitle(content.title || initialSection?.title || 'Get In Touch');
    setSubtitle(content.subtitle || '');
    setDescription(content.description || '');
    setCtaText(content.ctaText || '');
    setCtaUrl(content.ctaUrl || '');
    setAvailabilityText(content.availabilityText || '');
    setSubmitButtonText(content.submitButtonText || 'Send Message');
    setSuccessMessage(content.successMessage || 'Thank you for reaching out!');
    setStatus(initialSection?.status || 'published');
    setEnabled(initialSection ? initialSection.enabled : true);
    setIsDirty(false);
    setFeedback(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          role="alert"
          aria-live="polite"
          className={`p-4 rounded-xl text-xs font-mono flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === 'success' ? '✔' : '⚠️'}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="hover:opacity-75 focus-ring rounded p-1"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Direct Contact Details (Stored in Site Settings) */}
      <Card variant="standard" className="bg-[#0D111A] border-white/10">
        <CardHeader className="p-5 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm text-amber-400">
              📞
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-100">
                Contact Information
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Primary contact endpoints rendered on the public contact section and across the portfolio.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Email */}
            <div>
              <label
                htmlFor="contact-email"
                className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
              >
                Primary Email <span className="text-amber-400">*</span>
              </label>
              <Input
                id="contact-email"
                type="email"
                placeholder="mohamed@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  markDirty();
                }}
                required
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Used for email links and message inquiries.
              </p>
            </div>

            {/* Phone (Optional) */}
            <div>
              <label
                htmlFor="contact-phone"
                className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
              >
                Phone Number <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <Input
                id="contact-phone"
                type="text"
                placeholder="+20 100 123 4567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  markDirty();
                }}
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Leave empty to hide the phone row publicly.
              </p>
            </div>

            {/* Location (Optional) */}
            <div>
              <label
                htmlFor="contact-location"
                className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
              >
                Location / Base <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <Input
                id="contact-location"
                type="text"
                placeholder="Cairo, Egypt (or Remote)"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  markDirty();
                }}
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Free-text location representation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Contact Section Presentation & Copy (Dynamic Section) */}
      <Card variant="standard" className="bg-[#0D111A] border-white/10">
        <CardHeader className="p-5 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm text-amber-400">
              📝
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-100">
                Contact Section Content
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Headings, intro description, CTA button, and real-time availability indicator.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section Badge */}
            <div>
              <label
                htmlFor="contact-badge"
                className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
              >
                Section Badge
              </label>
              <Input
                id="contact-badge"
                placeholder="Contact"
                value={badge}
                onChange={(e) => {
                  setBadge(e.target.value);
                  markDirty();
                }}
              />
            </div>

            {/* Section Title */}
            <div>
              <label
                htmlFor="contact-title"
                className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
              >
                Section Title <span className="text-amber-400">*</span>
              </label>
              <Input
                id="contact-title"
                placeholder="Get In Touch"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  markDirty();
                }}
                required
              />
            </div>
          </div>

          {/* Subtitle / Tagline */}
          <div>
            <label
              htmlFor="contact-subtitle"
              className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
            >
              Section Subtitle / Tagline
            </label>
            <Input
              id="contact-subtitle"
              placeholder="Feel free to reach out for collaborations, opportunities or just to say hello!"
              value={subtitle}
              onChange={(e) => {
                setSubtitle(e.target.value);
                markDirty();
              }}
            />
          </div>

          {/* Supporting Description */}
          <div>
            <label
              htmlFor="contact-description"
              className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
            >
              Supporting Intro Description <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <Textarea
              id="contact-description"
              rows={2}
              placeholder="Brief supplementary narrative to invite prospective collaborators or recruiters..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                markDirty();
              }}
            />
          </div>

          {/* Availability Status Text */}
          <div>
            <label
              htmlFor="contact-availability"
              className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
            >
              Availability Status Text <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <Input
              id="contact-availability"
              placeholder="Available for Machine Learning roles & AI consulting"
              value={availabilityText}
              onChange={(e) => {
                setAvailabilityText(e.target.value);
                markDirty();
              }}
            />
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Displayed as a prominent availability badge on the contact card.
            </p>
          </div>

          {/* CTA Label & Destination URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div>
              <label
                htmlFor="contact-cta-text"
                className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
              >
                CTA Button Text <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <Input
                id="contact-cta-text"
                placeholder="e.g. Schedule a 1:1 Call"
                value={ctaText}
                onChange={(e) => {
                  setCtaText(e.target.value);
                  markDirty();
                }}
              />
            </div>

            <div>
              <label
                htmlFor="contact-cta-url"
                className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
              >
                CTA Destination URL <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <Input
                id="contact-cta-url"
                placeholder="https://cal.com/your-calendar or mailto:..."
                value={ctaUrl}
                onChange={(e) => {
                  setCtaUrl(e.target.value);
                  markDirty();
                }}
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Only rendered if both CTA label and URL are set.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Section Visibility & Publishing Controls */}
      <Card variant="standard" className="bg-[#0D111A] border-white/10">
        <CardHeader className="p-5 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm text-amber-400">
              ⚙️
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-100">
                Publishing & Visibility
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Controls whether the Contact section is visible to public visitors.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact-status"
                className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
              >
                Publish Status
              </label>
              <Select
                id="contact-status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as PublishStatus);
                  markDirty();
                }}
                options={[
                  { value: 'published', label: 'Published (Live)' },
                  { value: 'draft', label: 'Draft (Admin Only)' },
                  { value: 'archived', label: 'Archived (Hidden)' },
                ]}
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#131926] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => {
                    setEnabled(e.target.checked);
                    markDirty();
                  }}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/20"
                />
                <div>
                  <span className="text-xs font-medium text-slate-200 block">
                    Section Enabled
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {enabled ? 'Active in public pipeline' : 'Completely disabled'}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-[#0D111A]/95 border border-white/15 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          {isDirty ? (
            <span className="flex items-center gap-2 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Unsaved changes pending
            </span>
          ) : (
            <span className="text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              All changes saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
              className="text-xs font-mono min-h-[40px]"
            >
              Discard Changes
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            disabled={!isDirty || isSaving}
            className="text-xs font-mono font-semibold px-6 min-h-[40px]"
          >
            Save Contact Settings
          </Button>
        </div>
      </div>
    </form>
  );
};
