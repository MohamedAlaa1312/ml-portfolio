'use client';

import React, { useState } from 'react';
import type { ThemeContactProps } from '../../types';
import { parseSocialLinks, getPlatformIcon } from '@/lib/social-utils';

export const MonochromeContact: React.FC<ThemeContactProps> = ({
  content,
  settings,
  sectionIndex,
}) => {
  const title = content?.title || 'Initiate Dialogue';
  const subtitle =
    content?.subtitle ||
    'Direct engineering consultations, machine learning initiatives, and technical leadership engagements.';
  const description = content?.description || '';
  const availabilityText = content?.availabilityText || '';
  const ctaText = content?.ctaText || '';
  const ctaUrl = content?.ctaUrl || '';
  const submitButtonText = content?.submitButtonText || 'TRANSMIT INQUIRY →';
  const successMessage =
    content?.successMessage ||
    'Inquiry transmitted successfully. Direct response will be dispatched to your provided coordinates.';

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
    }, 400);
  };

  const hasDirectDetails = Boolean(email || phone || location || availabilityText || (ctaText && ctaUrl));
  const secNum = String(sectionIndex ?? 6).padStart(2, '0');

  return (
    <section
      id="contact"
      className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.15]"
    >
      {/* Stark Section Label */}
      <div className="pb-6 mb-12 sm:mb-16 border-b border-white/[0.12] flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#737373]">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">{secNum}</span>
          <span>—</span>
          <span className="text-white font-bold tracking-widest">CONTACT</span>
        </div>
        <span>COMMUNICATION // ENGAGEMENT</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Bold Typographic Statement & Metadata (col-6) */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-tight">
              {title}
            </h2>
            <p className="text-base text-[#A3A3A3] leading-relaxed">
              {subtitle}
            </p>
          </div>

          {description && (
            <p className="text-sm text-[#A3A3A3] p-4 border border-white/15 font-mono leading-relaxed bg-[#0A0A0A]">
              {description}
            </p>
          )}

          {/* Availability Status */}
          {availabilityText && (
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 border border-white/20 text-xs font-mono uppercase text-white bg-[#0A0A0A]">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>CURRENT STATUS: {availabilityText}</span>
            </div>
          )}

          {/* Communication Coordinates */}
          {hasDirectDetails && (
            <div className="border-t border-b border-white/[0.15] divide-y divide-white/[0.15] text-xs font-mono">
              {email && (
                <div className="py-3 flex items-baseline justify-between gap-4">
                  <span className="text-[#737373] uppercase tracking-wider">EMAIL</span>
                  <a
                    href={`mailto:${email}`}
                    className="text-white font-bold hover:underline underline-offset-4 decoration-white/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                  >
                    {email}
                  </a>
                </div>
              )}

              {phone && (
                <div className="py-3 flex items-baseline justify-between gap-4">
                  <span className="text-[#737373] uppercase tracking-wider">TELEPHONE</span>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="text-white font-bold hover:underline underline-offset-4 decoration-white/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                  >
                    {phone}
                  </a>
                </div>
              )}

              {location && (
                <div className="py-3 flex items-baseline justify-between gap-4">
                  <span className="text-[#737373] uppercase tracking-wider">LOCATION</span>
                  <span className="text-[#A3A3A3]">{location}</span>
                </div>
              )}

              {ctaText && ctaUrl && (
                <div className="py-3">
                  <a
                    href={ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white font-bold hover:text-neutral-300 underline underline-offset-4 decoration-white/40 hover:decoration-white uppercase tracking-wider focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                  >
                    <span>{ctaText}</span>
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Social Links Ledger */}
          {socialLinks.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#737373] block">
                EXTERNAL CHANNELS
              </span>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono uppercase">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target={link.url.startsWith('mailto:') ? '_self' : '_blank'}
                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="inline-flex items-center gap-1.5 text-[#A3A3A3] hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                    aria-label={`${link.platform} channel`}
                  >
                    <span>{link.icon || getPlatformIcon(link.platform)}</span>
                    <span>{link.label || link.platform}</span>
                    <span>↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dispatch Form (col-6) */}
        <div className="lg:col-span-6 p-6 sm:p-8 border border-white/20 bg-[#0A0A0A]">
          {submitted ? (
            <div role="status" aria-live="polite" className="py-12 text-center space-y-4 font-mono">
              <div className="w-10 h-10 border border-white text-white mx-auto flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                TRANSMISSION ACKNOWLEDGED
              </h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-sm mx-auto">
                {successMessage}
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 border border-white text-xs font-mono uppercase tracking-wider text-white hover:bg-white hover:text-black transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                SUBMIT ANOTHER INQUIRY
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
              <div className="text-xs uppercase tracking-widest text-[#737373] pb-3 border-b border-white/10 font-bold">
                DIRECT INQUIRY INTERFACE
              </div>

              <div className="space-y-1.5">
                <label htmlFor="m-name" className="block text-xs text-[#A3A3A3] uppercase tracking-wider">
                  NAME / AFFILIATION *
                </label>
                <input
                  id="m-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full Name or Organization"
                  className="w-full px-3 py-2.5 bg-[#050505] border border-white/20 focus:border-white text-white text-xs font-sans placeholder-[#525252] focus-visible:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="m-email" className="block text-xs text-[#A3A3A3] uppercase tracking-wider">
                  EMAIL ADDRESS *
                </label>
                <input
                  id="m-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@organization.com"
                  className="w-full px-3 py-2.5 bg-[#050505] border border-white/20 focus:border-white text-white text-xs font-sans placeholder-[#525252] focus-visible:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="m-msg" className="block text-xs text-[#A3A3A3] uppercase tracking-wider">
                  MESSAGE / SCOPE *
                </label>
                <textarea
                  id="m-msg"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detail your engineering engagement or inquiry..."
                  className="w-full px-3 py-2.5 bg-[#050505] border border-white/20 focus:border-white text-white text-xs font-sans placeholder-[#525252] focus-visible:outline-none transition-colors resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-mono text-xs uppercase tracking-widest font-black transition-all min-h-[44px] cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
              >
                {loading ? 'TRANSMITTING...' : submitButtonText}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
