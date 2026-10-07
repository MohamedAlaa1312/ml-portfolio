'use client';

import React from 'react';
import type { ThemeCertificationsProps } from '../../types';

export const MonochromeCertifications: React.FC<ThemeCertificationsProps> = ({
  content,
  certificationsList = [],
  sectionIndex,
}) => {
  const title = content?.title || 'Credentials & Accreditations';
  const subtitle =
    content?.subtitle ||
    'Formal certifications, professional accreditations, and specialized technical validations.';

  const list = certificationsList
    .filter((c) => c.status === 'published' && c.enabled !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const secNum = String(sectionIndex ?? 5).padStart(2, '0');

  return (
    <section
      id="certifications"
      className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.15]"
    >
      {/* Stark Section Label */}
      <div className="pb-6 mb-12 sm:mb-16 border-b border-white/[0.12] flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#737373]">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">{secNum}</span>
          <span>—</span>
          <span className="text-white font-bold tracking-widest">CERTIFICATIONS</span>
        </div>
        <span>CREDENTIALS // STANDARDS</span>
      </div>

      <div className="space-y-4 mb-16">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base text-[#A3A3A3] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Structured Minimalist Credentials Ledger */}
      {list.length > 0 ? (
        <div className="divide-y divide-white/[0.15] border-t border-b border-white/[0.15]">
          {list.map((cert, idx) => {
            const certImage = cert.image_url || cert.image;
            const certIndex = String(idx + 1).padStart(2, '0');
            const hasVerifyLink =
              cert.credential_url &&
              (cert.credential_url.startsWith('http://') ||
                cert.credential_url.startsWith('https://') ||
                cert.credential_url.startsWith('/'));

            return (
              <div
                key={cert.id}
                className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline group"
              >
                {/* Index & Issuer Column (col-4) */}
                <div className="md:col-span-4 space-y-1">
                  <div className="flex items-center gap-3 text-xs font-mono uppercase text-[#737373]">
                    <span className="text-white font-bold">{certIndex}</span>
                    <span>/</span>
                    <span className="text-[#A3A3A3] font-medium">{cert.issuer}</span>
                  </div>
                  {cert.issue_date && (
                    <div className="text-xs font-mono text-[#737373] uppercase tracking-wider">
                      ISSUED {cert.issue_date}
                    </div>
                  )}
                </div>

                {/* Credential Details Column (col-6) */}
                <div className="md:col-span-6 space-y-2">
                  <div className="flex items-start gap-4">
                    {/* Optional Real Media Reference Only */}
                    {certImage && (
                      <div className="w-12 h-12 border border-white/20 bg-[#0A0A0A] shrink-0 p-1 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={certImage}
                          alt={`${cert.issuer} credential mark`}
                          className="w-full h-full object-contain filter grayscale contrast-125"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight group-hover:text-neutral-300 transition-colors">
                        {cert.title}
                      </h3>
                      {cert.credential_id && (
                        <p className="text-xs font-mono text-[#737373] uppercase tracking-wider">
                          ID: <span className="text-[#A3A3A3]">{cert.credential_id}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Action (col-2) */}
                <div className="md:col-span-2 md:text-right">
                  {hasVerifyLink && (
                    <a
                      href={cert.credential_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-white hover:text-neutral-400 underline underline-offset-4 decoration-white/40 hover:decoration-white transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                      aria-label={`Verify accreditation for ${cert.title}`}
                    >
                      <span>VERIFY</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 border border-white/10 text-center text-xs font-mono text-[#737373]">
          NO ACCREDITATION RECORDS RECORDED
        </div>
      )}
    </section>
  );
};
