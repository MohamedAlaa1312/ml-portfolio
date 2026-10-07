'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MediaFrame } from '@/components/ui/MediaFrame';
import { TextLink } from '@/components/ui/TextLink';
import type { Certification } from '@/lib/supabase/types';

interface CertificationListProps {
  certifications: Certification[];
  onEdit: (cert: Certification) => void;
  onDelete: (cert: Certification) => void;
  onToggleEnabled: (cert: Certification) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  isReordering?: boolean;
}

const ISSUER_ICONS: Record<string, string> = {
  Coursera: '🎓',
  Udemy: '⚡',
  DataCamp: '📊',
  Microsoft: '☁️',
  AWS: '☁️',
  Google: '🌐',
  'Google Cloud': '🌐',
  Stanford: '🏛️',
  'Stanford Online': '🏛️',
  DeepLearning: '🧠',
  'DeepLearning.AI': '🧠',
  NVIDIA: '🟢',
  Kaggle: '🏅',
};

export const CertificationList: React.FC<CertificationListProps> = ({
  certifications,
  onEdit,
  onDelete,
  onToggleEnabled,
  onReorder,
  isReordering = false,
}) => {
  const sorted = [...certifications].sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0)
  );

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const newSorted = [...sorted];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSorted[index];
    newSorted[index] = newSorted[targetIndex];
    newSorted[targetIndex] = temp;

    const orderedIds = newSorted.map((c) => c.id);
    await onReorder(orderedIds);
  };

  if (certifications.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 border border-dashed border-white/10 rounded-2xl bg-[#0D111A]">
        <p className="text-base font-semibold text-slate-200">No certifications yet.</p>
        <p className="text-xs text-slate-400 mt-1">
          Add your real credentials and specializations using the Add Certification button above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((cert, index) => {
        const isEnabled = cert.enabled ?? (cert.status === 'published');
        const fallbackEmoji = ISSUER_ICONS[cert.issuer] || '📜';

        return (
          <Card
            key={cert.id}
            variant="standard"
            className={`bg-[#0D111A] border-white/10 hover:border-white/20 transition-all ${
              !isEnabled || cert.status === 'draft' ? 'opacity-75' : ''
            }`}
          >
            <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Media Badge & Certification Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
                {/* Badge/Media Preview */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 bg-[#131926] flex items-center justify-center">
                  {cert.image_url || cert.image ? (
                    <MediaFrame
                      src={cert.image_url || cert.image}
                      alt={`Badge for ${cert.title}`}
                      aspectRatio="1/1"
                      fallbackIcon={fallbackEmoji}
                      className="w-full h-full rounded-none border-0"
                    />
                  ) : (
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {fallbackEmoji}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-100 text-base truncate">
                      {cert.title}
                    </h3>

                    {/* Status Badge */}
                    {cert.status === 'published' ? (
                      <Badge variant="success" dot className="text-[10px]">
                        Published
                      </Badge>
                    ) : cert.status === 'draft' ? (
                      <Badge variant="accent" dot className="text-[10px]">
                        Draft
                      </Badge>
                    ) : (
                      <Badge variant="default" dot className="text-[10px]">
                        Archived
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-amber-400 font-mono">
                    {cert.issuer}
                    <span className="text-slate-500 ml-2">
                      • Issued: {cert.issue_date}
                      {cert.expiration_date ? ` • Expires: ${cert.expiration_date}` : ''}
                    </span>
                  </p>

                  {cert.credential_id && (
                    <p className="text-[11px] font-mono text-slate-400">
                      ID: <span className="text-slate-300">{cert.credential_id}</span>
                    </p>
                  )}

                  {cert.description && (
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {cert.description}
                    </p>
                  )}

                  {cert.credential_url && (
                    <div className="pt-1">
                      <TextLink
                        href={cert.credential_url}
                        isExternal
                        variant="subtle"
                        className="text-[11px] font-mono"
                      >
                        Verify Credential ↗
                      </TextLink>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Controls & Ordering */}
              <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 pt-2 md:pt-0">
                {/* Reorder Buttons */}
                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0 || isReordering}
                    aria-label={`Move ${cert.title} up`}
                    className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 px-1 select-none">
                    #{cert.display_order ?? index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === sorted.length - 1 || isReordering}
                    aria-label={`Move ${cert.title} down`}
                    className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Down"
                  >
                    ▼
                  </button>
                </div>

                {/* Inline Toggle Button */}
                <button
                  type="button"
                  onClick={() => onToggleEnabled(cert)}
                  className={`p-1.5 px-2.5 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                    isEnabled
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                  title={isEnabled ? 'Click to disable' : 'Click to enable'}
                >
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </button>

                {/* Edit Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(cert)}
                >
                  Edit
                </Button>

                {/* Delete Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(cert)}
                  className="text-red-400 hover:text-red-300 hover:border-red-500/30"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
