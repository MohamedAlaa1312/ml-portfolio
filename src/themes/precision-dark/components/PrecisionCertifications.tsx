'use client';

import React from 'react';
import type { ThemeCertificationsProps } from '../../types';

export const PrecisionCertifications: React.FC<ThemeCertificationsProps> = ({
  content,
  certificationsList = [],
  sectionIndex,
}) => {
  const title = content?.title || 'Professional Credentials & Standards';
  const subtitle =
    content?.subtitle ||
    'Validated technical credentials, industry certifications, and standardized specializations.';

  const list = certificationsList
    .filter((c) => c.status === 'published' && c.enabled !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const secNum = String((sectionIndex ?? 5)).padStart(2, '0');

  return (
    <section
      id="certifications"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.10]"
    >
      {/* Precision Dynamic Section Header */}
      <div className="flex items-center justify-between pb-4 mb-8 sm:mb-12 border-b border-white/[0.08] text-xs font-mono tracking-wider text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className="text-[#F59E0B] font-bold">{`[${secNum}]`}</span>
          <span className="text-white/20">{'//'}</span>
          <span className="text-[#F1F5F9] uppercase font-bold tracking-widest">CREDENTIALS</span>
        </div>
        <span className="text-[10px] text-[#94A3B8]">RECORD: ACCREDITATIONS</span>
      </div>

      <div className="space-y-3 mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {list.length > 0 ? (
        <div className="space-y-4">
          {list.map((cert, idx) => {
            const certImage = cert.image_url || cert.image;
            const certCode = `CRED.${String(idx + 1).padStart(2, '0')}`;
            const hasVerifyLink =
              cert.credential_url &&
              (cert.credential_url.startsWith('http://') ||
                cert.credential_url.startsWith('https://') ||
                cert.credential_url.startsWith('/'));

            return (
              <div
                key={cert.id}
                className="p-5 rounded-sm bg-[#0E1014] border border-white/[0.08] hover:border-[#F59E0B]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                <div className="flex items-start gap-4">
                  {/* Issuer Frame */}
                  {certImage ? (
                    <div className="w-10 h-10 rounded-sm bg-[#12151B] border border-white/10 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={certImage}
                        alt={`${cert.issuer} verification badge`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-sm bg-[#12151B] border border-white/10 shrink-0 flex items-center justify-center font-mono text-xs text-[#F1F5F9] font-bold">
                      {cert.issuer.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#64748B]">
                      <span className="text-[#F59E0B] font-bold">{certCode}</span>
                      <span>{'//'}</span>
                      <span className="text-[#F1F5F9] font-semibold">{cert.issuer}</span>
                      {cert.issue_date && (
                        <>
                          <span>•</span>
                          <span>ISSUED: {cert.issue_date}</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-white transition-colors">
                      {cert.title}
                    </h3>

                    {cert.credential_id && (
                      <p className="text-[11px] font-mono text-[#64748B]">
                        ID: <span className="text-[#94A3B8]">{cert.credential_id}</span>
                      </p>
                    )}
                  </div>
                </div>

                {hasVerifyLink && (
                  <div className="pt-2 md:pt-0 shrink-0">
                    <a
                      href={cert.credential_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#12151B] border border-white/15 hover:border-[#F59E0B] text-xs font-mono uppercase tracking-wider text-[#F1F5F9] hover:text-[#F59E0B] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F59E0B]"
                      aria-label={`Verify credential for ${cert.title}`}
                    >
                      <span>VERIFY ACCREDITATION</span>
                      <span className="text-[#F59E0B]">↗</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-sm bg-[#0E1014] border border-white/[0.08] text-center text-xs font-mono text-[#64748B]">
          NO ACCREDITATION RECORDS RECORDED
        </div>
      )}
    </section>
  );
};
