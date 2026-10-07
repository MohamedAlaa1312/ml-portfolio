import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card, CardContent } from '@/components/ui/Card';
import { TextLink } from '@/components/ui/TextLink';
import type { Certification, CertificationsContent } from '@/lib/supabase/types';

interface CertificationsSectionProps {
  content?: CertificationsContent;
  certificationsList?: Certification[];
}

import { EmptyState } from '@/components/ui/EmptyState';
import { MediaFrame } from '@/components/ui/MediaFrame';

const issuerIcons: Record<string, string> = {
  Coursera: '🎓',
  Udemy: '⚡',
  DataCamp: '📊',
  Microsoft: '☁️',
  AWS: '☁️',
  Google: '🌐',
  Stanford: '🏛️',
  DeepLearning: '🧠',
  'DeepLearning.AI': '🧠',
  NVIDIA: '🟢',
  Kaggle: '🏅',
};

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  content,
  certificationsList,
}) => {
  const badge = content?.badge || 'Credentials';
  const title = content?.title || 'Certifications';
  const subtitle =
    content?.subtitle ||
    'Relevant certifications that validate my skills and knowledge.';

  // Source of truth: CMS data (no synthetic fallback if DB returns empty list)
  const list = (certificationsList !== undefined ? certificationsList : [])
    .filter((cert) => cert.status === 'published' && cert.enabled !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <section id="certifications" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/5">
      <SectionHeading badge={badge} title={title} subtitle={subtitle} />

      {list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 sm:mt-10">
          {list.map((cert) => (
            <Card
              key={cert.id}
              variant="standard"
              className="bg-[#0D111A] border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Issuer Badge/Certificate Media */}
                  <div className="w-12 h-12 rounded-xl bg-[#131926] border border-white/10 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                    {cert.image_url || cert.image ? (
                      <MediaFrame
                        src={cert.image_url || cert.image}
                        alt={`Badge for ${cert.title}`}
                        aspectRatio="1/1"
                        fallbackIcon={issuerIcons[cert.issuer] || '📜'}
                        className="w-full h-full rounded-none border-0"
                      />
                    ) : (
                      <span role="img" aria-hidden="true">
                        {issuerIcons[cert.issuer] || '📜'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-100 leading-snug">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-amber-500/90 font-mono mt-0.5">
                      {cert.issuer}
                      <span className="text-slate-500 ml-2">
                        • Issued: {cert.issue_date}
                        {cert.expiration_date ? ` • Expires: ${cert.expiration_date}` : ''}
                      </span>
                    </p>
                    {cert.credential_id && (
                      <p className="text-[11px] font-mono text-slate-400 mt-1">
                        Credential ID: <span className="text-slate-300">{cert.credential_id}</span>
                      </p>
                    )}
                    {cert.description && (
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {cert.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>

              {/* Verification Link */}
              {cert.credential_url &&
                (cert.credential_url.startsWith('http://') ||
                  cert.credential_url.startsWith('https://') ||
                  cert.credential_url.startsWith('/')) && (
                  <div className="px-6 pb-5 pt-0 flex justify-end text-xs font-mono">
                    <TextLink
                      href={cert.credential_url}
                      isExternal
                      variant="amber"
                      aria-label={`Verify credential for ${cert.title}`}
                    >
                      Verify Credential ↗
                    </TextLink>
                  </div>
                )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto mt-8 sm:mt-10">
          <EmptyState
            title="No Certifications Available"
            description="Certifications and industry credentials will be shown here once configured in the CMS."
            icon="📜"
          />
        </div>
      )}
    </section>
  );
};
