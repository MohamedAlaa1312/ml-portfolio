import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export interface ActivityItem {
  id: string;
  type: 'project' | 'experience' | 'certification' | 'setting' | 'media';
  title: string;
  detail: string;
  timestamp: string;
}

interface AdminActivityListProps {
  items?: ActivityItem[];
}

const typeIcons: Record<ActivityItem['type'], string> = {
  project: '🚀',
  experience: '💼',
  certification: '📜',
  setting: '⚙️',
  media: '🖼️',
};

const defaultActivities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'project',
    title: 'Project Updated',
    detail: 'Fake News Detection (Transformer models)',
    timestamp: '2 hours ago',
  },
  {
    id: 'act-2',
    type: 'certification',
    title: 'Certification Added',
    detail: 'Deep Learning with PyTorch (Udemy)',
    timestamp: '5 hours ago',
  },
  {
    id: 'act-3',
    type: 'experience',
    title: 'Experience Updated',
    detail: 'Google — Machine Learning Engineer',
    timestamp: '1 day ago',
  },
  {
    id: 'act-4',
    type: 'media',
    title: 'Media Uploaded',
    detail: 'profile-image.jpg (High-res portrait)',
    timestamp: '1 day ago',
  },
];

export const AdminActivityList: React.FC<AdminActivityListProps> = ({ items = defaultActivities }) => {
  return (
    <Card variant="standard" className="bg-[#0D111A] border-white/10">
      <CardHeader className="p-5 sm:p-6 pb-2 sm:pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>Recent Activity</span>
          </CardTitle>
          <span className="text-[11px] font-mono text-amber-500/90">Audit Feed</span>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-4">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#131926] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm shrink-0 mt-0.5" aria-hidden="true">
                    {typeIcons[item.type] || '⚡'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.detail}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap pt-1">
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-xs font-mono text-slate-500">No recent activity logged</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
