'use client';

import React from 'react';
import type { ThemeCertificationsProps } from '../../types';

export const EditorialCertifications: React.FC<ThemeCertificationsProps> = ({
  content,
  certificationsList = [],
}) => {
  const badge = content?.badge || 'CREDENTIALS // 05';
  const title = content?.title || 'Certifications & Accreditations';
  const subtitle =
    content?.subtitle ||
    'Formal qualifications, advanced specializations, and industry-standard machine learning accreditations.';

  const list = certificationsList
    .filter((c) => c.status === 'published' && c.enabled !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <section
      id="certifications"
      className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.08]"
    >
      {/* Editorial Section Header */}
      <div className="pb-8 mb-12 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#71717A]">
        <div className="flex items-center gap-2">
          <span className="text-[#C25E34]">05</span>
          <span>/</span>
          <span>CREDENTIALS</span>
        </div>
        <span>{badge}</span>
      </div>

      <div className="space-y-4 mb-16">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#EDEDEC] leading-tight font-sans">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base text-[#A1A1AA] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map((cert) => {
            const certImage = cert.image_url || cert.image;
            const hasVerifyLink =
              cert.credential_url &&
              (cert.credential_url.startsWith('http://') ||
                cert.credential_url.startsWith('https://') ||
                cert.credential_url.startsWith('/'));

            return (
              <div
                key={cert.id}
                className="p-6 sm:p-7 rounded bg-[#121417] border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    {/* Badge / Issuer frame */}
                    {certImage ? (
                      <div className="w-12 h-12 rounded bg-[#17191E] border border-white/10 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={certImage}
                          alt={`${cert.issuer} credential`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-[#17191E] border border-white/10 shrink-0 flex items-center justify-center font-mono text-xs text-[#A1A1AA] uppercase">
                        {cert.issuer.slice(0, 2)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
                        <span className="text-[#C25E34]">{cert.issuer}</span>
                        {cert.issue_date && <span>{cert.issue_date}</span>}
                      </div>

                      <h3 className="text-base font-semibold text-[#EDEDEC] leading-snug">
                        {cert.title}
                      </h3>

                      {cert.credential_id && (
                        <p className="text-xs font-mono text-[#71717A] mt-1.5">
                          ID: <span className="text-[#A1A1AA]">{cert.credential_id}</span>
                        </p>
                      )}

                      {cert.description && (
                        <p className="text-xs text-[#A1A1AA] mt-2.5 leading-relaxed">
                          {cert.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {hasVerifyLink && (
                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex justify-end">
                    <a
                      href={cert.credential_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#EDEDEC] hover:text-[#C25E34] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C25E34] rounded inline-flex items-center gap-1"
                      aria-label={`Verify credential for ${cert.title}`}
                    >
                      <span>VERIFY CREDENTIAL</span>
                      <span>↗</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded bg-[#121417] border border-white/[0.08] text-center text-xs font-mono text-[#71717A]">
          NO CERTIFICATION RECORDS REGISTERED
        </div>
      )}
    </section>
  );
};
