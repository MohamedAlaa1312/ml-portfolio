'use client';

import React, { useState } from 'react';
import type { ThemeContactProps } from '../../types';
import { parseSocialLinks, getPlatformIcon } from '@/lib/social-utils';

export const PrecisionContact: React.FC<ThemeContactProps> = ({
  content,
  settings,
  sectionIndex,
}) => {
  const title = content?.title || 'System Communication Endpoint';
  const subtitle =
    content?.subtitle ||
    'Direct engineering inquiries, collaboration requests, and technical consultations.';
  const description = content?.description || '';
  const availabilityText = content?.availabilityText || '';
  const ctaText = content?.ctaText || '';
  const ctaUrl = content?.ctaUrl || '';
  const submitButtonText = content?.submitButtonText || 'TRANSMIT MESSAGE →';
  const successMessage =
    content?.successMessage ||
    'Transmission acknowledged. Message delivered to engineering queue.';

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
    }, 500);
  };

  const hasDirectDetails = Boolean(email || phone || location || availabilityText || (ctaText && ctaUrl));
  const secNum = String((sectionIndex ?? 6)).padStart(2, '0');

  return (
    <section
      id="contact"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.10]"
    >
      {/* Precision Dynamic Section Header */}
      <div className="flex items-center justify-between pb-4 mb-8 sm:mb-12 border-b border-white/[0.08] text-xs font-mono tracking-wider text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className="text-[#F59E0B] font-bold">{`[${secNum}]`}</span>
          <span className="text-white/20">{'//'}</span>
          <span className="text-[#F1F5F9] uppercase font-bold tracking-widest">CONTACT</span>
        </div>
        <span className="text-[10px] text-[#94A3B8]">DISPATCH: DIRECT_COMMS</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Direct Inquiries & Telemetry (col-6) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
              {title}
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              {subtitle}
            </p>
          </div>

          {description && (
            <p className="text-xs text-[#94A3B8] p-3 rounded-sm bg-[#0E1014] border-l-2 border-[#F59E0B] font-mono">
              {description}
            </p>
          )}

          {/* Availability Status */}
          {availabilityText && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#12151B] border border-emerald-500/30 text-xs font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>STATUS: {availabilityText.toUpperCase()}</span>
            </div>
          )}

          {/* Direct Details Matrix (rendered strictly when data exists in CMS) */}
          {hasDirectDetails && (
            <div className="p-4 rounded-sm bg-[#0E1014] border border-white/[0.08] space-y-3 text-xs font-mono">
              <div className="text-[10px] uppercase text-[#64748B] tracking-wider pb-1 border-b border-white/[0.06]">
                COMMUNICATION NODES
              </div>

              {email && (
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[#64748B]">DIRECT EMAIL</span>
                  <a
                    href={`mailto:${email}`}
                    className="text-[#F1F5F9] hover:text-[#F59E0B] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B] rounded-sm"
                  >
                    {email}
                  </a>
                </div>
              )}

              {phone && (
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[#64748B]">DIRECT LINE</span>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="text-[#F1F5F9] hover:text-[#F59E0B] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B] rounded-sm"
                  >
                    {phone}
                  </a>
                </div>
              )}

              {location && (
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[#64748B]">BASE LOCATION</span>
                  <span className="text-[#94A3B8]">{location}</span>
                </div>
              )}

              {ctaText && ctaUrl && (
                <div className="pt-2">
                  <a
                    href={ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#12151B] hover:bg-white/[0.08] border border-[#F59E0B]/40 text-[#F59E0B] text-xs font-mono uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B]"
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
            <div className="pt-4 border-t border-white/[0.08] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] block">
                EXTERNAL NETWORKS
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target={link.url.startsWith('mailto:') ? '_self' : '_blank'}
                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#0E1014] border border-white/[0.08] hover:border-[#F59E0B] text-[#94A3B8] hover:text-[#F1F5F9] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B]"
                    aria-label={`${link.platform} node`}
                  >
                    <span>{link.icon || getPlatformIcon(link.platform)}</span>
                    <span>{link.label || link.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Transmission Console (col-6) */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-sm bg-[#0E1014] border border-white/[0.08]">
          {submitted ? (
            <div role="status" aria-live="polite" className="py-8 text-center space-y-3 font-mono">
              <div className="w-8 h-8 rounded-sm bg-[#12151B] border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center text-xs">
                ✓
              </div>
              <h3 className="text-sm font-bold text-[#F1F5F9] uppercase tracking-wider">
                TRANSMISSION LOGGED
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
                {successMessage}
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-3 px-3 py-1.5 rounded-sm border border-white/20 bg-[#12151B] text-[11px] font-mono uppercase tracking-wider text-[#F1F5F9] hover:text-[#F59E0B] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B]"
              >
                DISPATCH NEW PACKET
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="text-[10px] uppercase tracking-widest text-[#64748B] pb-2 border-b border-white/[0.06]">
                SECURE TRANSMISSION INTERFACE
              </div>

              <div className="space-y-1">
                <label htmlFor="p-name" className="block text-[11px] text-[#94A3B8] uppercase">
                  NAME // IDENTITY *
                </label>
                <input
                  id="p-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Entity / Name"
                  className="w-full px-3 py-2 rounded-sm bg-[#12151B] border border-white/[0.12] focus:border-[#F59E0B] text-[#F1F5F9] text-xs font-sans placeholder-[#64748B] focus-visible:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="p-email" className="block text-[11px] text-[#94A3B8] uppercase">
                  RETURN ADDRESS // EMAIL *
                </label>
                <input
                  id="p-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@domain.com"
                  className="w-full px-3 py-2 rounded-sm bg-[#12151B] border border-white/[0.12] focus:border-[#F59E0B] text-[#F1F5F9] text-xs font-sans placeholder-[#64748B] focus-visible:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="p-msg" className="block text-[11px] text-[#94A3B8] uppercase">
                  PAYLOAD // MESSAGE *
                </label>
                <textarea
                  id="p-msg"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Specify system parameters, scope, or inquiry..."
                  className="w-full px-3 py-2 rounded-sm bg-[#12151B] border border-white/[0.12] focus:border-[#F59E0B] text-[#F1F5F9] text-xs font-sans placeholder-[#64748B] focus-visible:outline-none transition-colors resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#08090B] font-mono text-xs uppercase tracking-wider font-bold transition-all min-h-[40px] cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B]"
              >
                {loading ? 'ENCRYPTING & SENDING...' : submitButtonText}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
