'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AdminPlaceholderModal } from './AdminPlaceholderModal';

interface QuickAction {
  label: string;
  icon: string;
  description: string;
  targetPhase?: string;
  href?: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Edit Profile & Hero',
    icon: '👤',
    description: 'Update your display name, headline, bio, contact info, and hero showcase.',
    href: '/admin/profile',
  },
  {
    label: 'Edit About Section',
    icon: '📝',
    description: 'Manage professional summary, headline, capabilities, and pillar cards.',
    href: '/admin/about',
  },
  {
    label: 'Manage Experience',
    icon: '💼',
    description: 'Record professional career roles, achievements, and tech stack tags.',
    href: '/admin/experience',
  },
  {
    label: 'Manage Skills',
    icon: '🛠️',
    description: 'Organize technical capabilities, categories, proficiencies, and ordering.',
    href: '/admin/skills',
  },
  {
    label: 'Manage Projects',
    icon: '🚀',
    description: 'Add and publish machine learning projects, models, and repositories.',
    href: '/admin/projects',
  },
  {
    label: 'Manage Certifications',
    icon: '📜',
    description: 'Add and organize verified certifications, specializations, and credentials.',
    href: '/admin/certifications',
  },
  {
    label: 'Manage Contact & Social',
    icon: '✉️',
    description: 'Configure public contact details, section copy, and social network links.',
    href: '/admin/contact',
  },
  {
    label: 'Manage Section Order & Visibility',
    icon: '📑',
    description: 'Reorder portfolio sections and toggle visibility for public visitors.',
    href: '/admin/sections',
  },
  {
    label: 'Publishing & Preview Hub',
    icon: '🌐',
    description: 'Review staged drafts, preview changes, and publish to the live site.',
    href: '/admin/publishing',
  },
  {
    label: 'Media Library',
    icon: '🖼️',
    description: 'Manage images, documents, asset metadata, and usage references.',
    href: '/admin/media',
  },
  {
    label: 'Global Settings',
    icon: '⚙️',
    description: 'Configure site branding, default SEO metadata, and system preferences.',
    href: '/admin/settings',
  },
];

export const AdminQuickActions: React.FC = () => {
  const [activeModal, setActiveModal] = useState<QuickAction | null>(null);

  return (
    <>
      <Card variant="standard" className="bg-[#0D111A] border-white/10">
        <CardHeader className="p-5 sm:p-6 pb-2 sm:pb-3 border-b border-white/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-100">
              Quick Actions
            </CardTitle>
            <span className="text-[11px] font-mono text-slate-500">Shortcuts</span>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-3">
          {quickActions.map((action) => {
            const content = (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform" aria-hidden="true">
                    {action.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">
                      {action.href ? 'Available Now ⚡' : `Activates in ${action.targetPhase}`}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-slate-500 group-hover:text-amber-400 transition-colors font-mono pl-2">
                  {action.href ? '→' : '+'}
                </span>
              </div>
            );

            if (action.href) {
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="w-full text-left p-3.5 rounded-xl bg-[#131926] border border-white/5 hover:border-amber-500/30 hover:bg-[#161E31] transition-all flex items-center justify-between group cursor-pointer focus-ring min-h-[44px]"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={action.label}
                type="button"
                onClick={() => setActiveModal(action)}
                className="w-full text-left p-3.5 rounded-xl bg-[#131926] border border-white/5 hover:border-amber-500/30 hover:bg-[#161E31] transition-all flex items-center justify-between group cursor-pointer focus-ring min-h-[44px]"
              >
                {content}
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Modal on Click */}
      {activeModal && (
        <AdminPlaceholderModal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          title={activeModal.label}
          moduleName={activeModal.label}
          targetPhase={activeModal.targetPhase}
          description={activeModal.description}
        />
      )}
    </>
  );
};
