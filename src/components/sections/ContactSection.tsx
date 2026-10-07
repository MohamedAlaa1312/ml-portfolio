'use client';

import React, { useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { parseSocialLinks, getPlatformIcon } from '@/lib/social-utils';
import type { ContactContent, SiteSettings } from '@/lib/supabase/types';

interface ContactSectionProps {
  content?: ContactContent;
  settings?: SiteSettings | null;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ content, settings }) => {
  const badge = content?.badge || 'Contact';
  const title = content?.title || 'Get In Touch';
  const subtitle =
    content?.subtitle ||
    'Feel free to reach out for collaborations, opportunities or just to say hello!';
  const description = content?.description || '';
  const availabilityText = content?.availabilityText || '';
  const ctaText = content?.ctaText || '';
  const ctaUrl = content?.ctaUrl || '';
  const submitButtonText = content?.submitButtonText || 'Send Message';
  const successMessage =
    content?.successMessage ||
    'Thank you for reaching out. I will review your inquiry and get back to you shortly.';

  // CMS Contact fields (Strict Requirement 28: No fake placeholders, only render when data exists)
  const email = settings?.email?.trim() || '';
  const phone = settings?.phone?.trim() || '';
  const location = settings?.location?.trim() || '';

  // CMS-driven dynamic social links (Strict Requirement 25, 26, 31: One single authoritative source)
  const socialLinks = parseSocialLinks(settings?.social_links).filter(
    (link) => link.enabled && link.status !== 'archived'
  );

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending message
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }, 800);
  };

  const hasDirectDetails = Boolean(email || phone || location || availabilityText || (ctaText && ctaUrl));

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/5">
      <SectionHeading badge={badge} title={title} subtitle={subtitle} />

      {/* Supporting Narrative / Description (if provided by CMS) */}
      {description && (
        <div className="max-w-2xl mx-auto text-center mt-3 mb-6">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
            &ldquo;{description}&rdquo;
          </p>
        </div>
      )}

      {/* Availability Pill (if provided by CMS) */}
      {availabilityText && (
        <div className="flex justify-center mt-4 mb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{availabilityText}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8 sm:mt-10 items-start">
        {/* Left Column: Direct Contact Details & CMS Social Links */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-6">
            {/* Email (Render only when configured) */}
            {email && (
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg shrink-0"
                  aria-hidden="true"
                >
                  ✉️
                </div>
                <div>
                  <p className="text-xs font-mono text-slate-400">Email</p>
                  <a
                    href={`mailto:${email}`}
                    className="text-sm font-semibold text-slate-100 hover:text-amber-400 transition-colors focus-ring rounded"
                    aria-label={`Send email to ${email}`}
                  >
                    {email}
                  </a>
                </div>
              </div>
            )}

            {/* Phone (Render ONLY when actual data exists — Requirement 28) */}
            {phone && (
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg shrink-0"
                  aria-hidden="true"
                >
                  📞
                </div>
                <div>
                  <p className="text-xs font-mono text-slate-400">Phone</p>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="text-sm font-semibold text-slate-100 hover:text-amber-400 transition-colors focus-ring rounded"
                    aria-label={`Call phone number ${phone}`}
                  >
                    {phone}
                  </a>
                </div>
              </div>
            )}

            {/* Location (Render ONLY when actual data exists — Requirement 28) */}
            {location && (
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg shrink-0"
                  aria-hidden="true"
                >
                  📍
                </div>
                <div>
                  <p className="text-xs font-mono text-slate-400">Location</p>
                  <p className="text-sm font-semibold text-slate-100">{location}</p>
                </div>
              </div>
            )}

            {/* CMS-Driven Call to Action (if configured) */}
            {ctaText && ctaUrl && (
              <div className="pt-2">
                <a
                  href={ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono transition-colors shadow-lg shadow-amber-500/20 focus-ring"
                >
                  <span>{ctaText}</span>
                  <span>↗</span>
                </a>
              </div>
            )}

            {!hasDirectDetails && (
              <div className="p-4 rounded-xl bg-[#0D111A] border border-white/5 text-xs font-mono text-slate-400">
                Contact information is currently being updated.
              </div>
            )}
          </div>

          {/* Social Links (CMS-Driven, strictly respects admin order and enabled status) */}
          {socialLinks.length > 0 && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-mono text-slate-500 mb-3 uppercase tracking-wider">
                Connect Online
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono">
                {socialLinks.map((link, idx) => (
                  <React.Fragment key={link.id}>
                    <TextLink
                      href={link.url}
                      isExternal={!link.url.startsWith('mailto:')}
                      variant="amber"
                      aria-label={`${link.platform} profile`}
                    >
                      <span className="mr-1">{link.icon || getPlatformIcon(link.platform)}</span>
                      <span>{link.label || link.platform}</span>
                    </TextLink>
                    {idx < socialLinks.length - 1 && (
                      <span className="text-slate-600 select-none">•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Form */}
        <div className="lg:col-span-7 bg-[#0D111A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
          {submitted ? (
            <div role="status" aria-live="polite" className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-2xl mx-auto flex items-center justify-center">
                ✔
              </div>
              <h3 className="text-lg font-bold text-slate-100">Message Received</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                {successMessage}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-mono min-h-[40px]"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Name"
                  placeholder="Your name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <Textarea
                label="Message"
                placeholder="Write your message here..."
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full text-xs font-mono font-semibold tracking-wide min-h-[44px]"
              >
                {submitButtonText}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
