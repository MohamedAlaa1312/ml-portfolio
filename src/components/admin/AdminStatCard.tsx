import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface AdminStatCardProps {
  label: string;
  value: number | string;
  change?: string;
  icon: string;
  description?: string;
  loading?: boolean;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  label,
  value,
  change,
  icon,
  description,
  loading = false,
}) => {
  return (
    <Card variant="standard" className="bg-[#0D111A] border-white/10 hover:border-amber-500/30 transition-colors">
      <CardContent className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 font-medium">{label}</span>
          <div className="w-8 h-8 rounded-lg bg-[#131926] border border-white/10 flex items-center justify-center text-base" aria-hidden="true">
            {icon}
          </div>
        </div>

        <div>
          {loading ? (
            <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
          ) : (
            <span className="text-3xl font-extrabold text-slate-100 tracking-tight block">
              {value}
            </span>
          )}

          {change && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[11px] font-mono font-medium text-amber-400/90">
                {change}
              </span>
            </div>
          )}

          {description && (
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
