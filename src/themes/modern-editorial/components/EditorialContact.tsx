'use client';

import React, { useState } from 'react';
import type { ThemeContactProps } from '../../types';
import { parseSocialLinks, getPlatformIcon } from '@/lib/social-utils';

export const EditorialContact: React.FC<ThemeContactProps> = ({ content, settings }) => {
  const badge = content?.badge || 'INQUIRIES // 06';
  const title = content?.title || 'Initiate Contact';
  const subtitle =
    content?.subtitle ||
    'Available for machine learning engineering roles, AI consulting, and applied research collaborations.';
  const description = content?.description || '';
  const availabilityText = content?.availabilityText || '';
  const ctaText = content?.ctaText || '';
  const ctaUrl = content?.ctaUrl || '';
  const submitButtonText = content?.submitButtonText || 'Transmit Inquiry →';
  const successMessage =
    content?.successMessage ||
    'Your inquiry has been logged. I will review and reply via email within one business day.';

  const email = settings?.email?.trim() || '';
  const phone = settings?.phone?.trim() || '';
  const location = settings?.location?.trim() || '';

  const socialLinks = parseSocialLinks(settings?.social_links).filter(
    (link) => link.enabled && link.status !== 'archived'
  );

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }, 600);
  };

  const hasDirectDetails = Boolean(email || phone || location || availabilityText || (ctaText && ctaUrl));

  return (
    <section
      id="contact"
      className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.08]"
    >
      {/* Editorial Section Header */}
      <div className="pb-8 mb-12 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#71717A]">
        <div className="flex items-center gap-2">
          <span className="text-[#C25E34]">06</span>
          <span>/</span>
          <span>CONTACT</span>
        </div>
        <span>{badge}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Narrative, Details, Social (col-6) */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#EDEDEC] leading-tight font-sans">
              {title}
            </h2>
            <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed">
              {subtitle}
            </p>
          </div>

          {description && (
            <p className="text-sm text-[#71717A] italic border-l-2 border-[#C25E34] pl-4 py-1">
              &ldquo;{description}&rdquo;
            </p>
          )}

          {/* Availability Indicator */}
          {availabilityText && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#17191E] border border-emerald-500/20 text-xs font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>STATUS: {availabilityText.toUpperCase()}</span>
            </div>
          )}

          {/* Direct Details (strictly rendered when data exists) */}
          {hasDirectDetails && (
            <div className="space-y-4 pt-2 text-xs font-mono">
              {email && (
                <div className="flex items-baseline gap-3">
                  <span className="text-[#71717A] uppercase w-20 shrink-0">EMAIL //</span>
                  <a
                    href={`mailto:${email}`}
                    className="text-[#EDEDEC] hover:text-[#C25E34] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C25E34] rounded"
                  >
                    {email}
                  </a>
                </div>
              )}

              {phone && (
                <div className="flex items-baseline gap-3">
                  <span className="text-[#71717A] uppercase w-20 shrink-0">TEL //</span>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="text-[#EDEDEC] hover:text-[#C25E34] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C25E34] rounded"
                  >
                    {phone}
                  </a>
                </div>
              )}

              {location && (
                <div className="flex items-baseline gap-3">
                  <span className="text-[#71717A] uppercase w-20 shrink-0">BASE //</span>
                  <span className="text-[#A1A1AA]">{location}</span>
                </div>
              )}

              {ctaText && ctaUrl && (
                <div className="pt-2">
                  <a
                    href={ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#17191E] hover:bg-[#1E2128] border border-white/15 text-[#EDEDEC] text-xs font-mono uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C25E34]"
                  >
                    <span>{ctaText}</span>
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* CMS Social Links */}
          {socialLinks.length > 0 && (
            <div className="pt-6 border-t border-white/[0.06] space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#71717A] block">
                CORRESPONDENCE CHANNELS //
              </span>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-mono">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target={link.url.startsWith('mailto:') ? '_self' : '_blank'}
                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="inline-flex items-center gap-1.5 text-[#A1A1AA] hover:text-[#EDEDEC] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C25E34] rounded"
                    aria-label={`${link.platform} account`}
                  >
                    <span>{link.icon || getPlatformIcon(link.platform)}</span>
                    <span>{link.label || link.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Inquiry Form (col-6) */}
        <div className="lg:col-span-6 p-7 sm:p-9 rounded bg-[#121417] border border-white/[0.08]">
          {submitted ? (
            <div role="status" aria-live="polite" className="py-10 text-center space-y-4">
              <div className="w-10 h-10 rounded bg-[#17191E] border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center font-mono text-sm">
                ✓
              </div>
              <h3 className="text-base font-semibold text-[#EDEDEC]">
                Dispatch Acknowledged
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-sm mx-auto font-mono">
                {successMessage}
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 rounded border border-white/15 bg-transparent hover:bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-[#EDEDEC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C25E34]"
              >
                Send Additional Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-xs font-mono uppercase tracking-widest text-[#71717A] pb-2 border-b border-white/[0.06]">
                TRANSMISSION FORM // DIRECT
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA]"
                >
                  Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name or organization"
                  className="w-full px-3.5 py-2.5 rounded bg-[#17191E] border border-white/[0.12] focus:border-[#C25E34] text-[#EDEDEC] text-sm font-sans placeholder-[#71717A] focus-visible:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA]"
                >
                  Email Address *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2.5 rounded bg-[#17191E] border border-white/[0.12] focus:border-[#C25E34] text-[#EDEDEC] text-sm font-sans placeholder-[#71717A] focus-visible:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA]"
                >
                  Brief / Inquiry *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Outline project scope, timeline, or engineering inquiry..."
                  className="w-full px-3.5 py-2.5 rounded bg-[#17191E] border border-white/[0.12] focus:border-[#C25E34] text-[#EDEDEC] text-sm font-sans placeholder-[#71717A] focus-visible:outline-none transition-colors resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded bg-[#EDEDEC] hover:bg-white text-[#0C0D0E] font-mono text-xs uppercase tracking-wider font-semibold transition-all min-h-[44px] cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C25E34]"
              >
                {loading ? 'Transmitting...' : submitButtonText}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
