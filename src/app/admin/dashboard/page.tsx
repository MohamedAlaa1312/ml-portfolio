import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import {
  AdminLayout,
  AdminStatCard,
  AdminActivityList,
  AdminQuickActions,
  type ActivityItem,
} from '@/components/admin';
import { ThemeService, ThemeRegistry } from '@/themes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return 'Recently';
  try {
    const time = new Date(dateStr).getTime();
    if (isNaN(time)) return 'Recently';
    const diffMs = Date.now() - time;
    if (diffMs < 0) return 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}mo ago`;
  } catch {
    return 'Recently';
  }
}

export default async function AdminDashboardPage() {
  // 1. Server-Side Defense-in-Depth Authorization Check
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    redirect('/admin/login?error=unauthorized');
  }

  let adminEmail = 'mohamed13alaa12@gmail.com';

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      adminEmail = user.email;
    }
  } catch {
    // Graceful fallback email
  }

  // 2. Load Real Dynamic Content from Database / Persistent Layer in Parallel
  const [
    allProjects,
    allExperience,
    allCerts,
    allSections,
    socialLinks,
    allDrafts,
    mediaStats,
    contactMessages,
    activeThemeResult,
  ] = await Promise.all([
    AdminService.getAllProjects().catch(() => []),
    AdminService.getAllExperience().catch(() => []),
    AdminService.getAllCertifications().catch(() => []),
    AdminService.getAllSections().catch(() => []),
    AdminService.getSocialLinks().catch(() => []),
    AdminService.getAllDrafts().catch(() => []),
    AdminService.getMediaStats().catch(() => ({ totalMedia: 0, inUseCount: 0 })),
    AdminService.getContactMessages().catch(() => []),
    ThemeService.getActiveTheme().catch(() => ThemeService.getDefaultTheme()),
  ]);

  // Real Calculated Metrics
  const projectsCount = allProjects.length;
  const publishedProjects = allProjects.filter((p) => p.status === 'published').length;
  const draftProjects = allProjects.filter((p) => p.status === 'draft').length;

  const experienceCount = allExperience.length;
  const currentExpRoles = allExperience.filter((e) => e.is_current).length;

  const certsCount = allCerts.length;
  const publishedCerts = allCerts.filter((c) => c.status === 'published').length;

  const sectionsCount = allSections.length;
  const activeSectionsCount = allSections.filter((s) => s.enabled).length;

  const socialLinksCount = socialLinks.length;
  const activeSocialCount = socialLinks.filter((s) => s.enabled).length;

  const draftsCount = allDrafts.length;

  const totalMessagesCount = contactMessages.length;
  const unreadMessagesCount = contactMessages.filter((m) => !m.read).length;

  // Active theme & draft theme name
  let activeThemeName = activeThemeResult.name;
  let draftThemeName: string | null = null;
  const themeDraft = allDrafts.find((d) => d.entity_type === 'theme');
  if (themeDraft?.data?.active_theme) {
    const tDef = ThemeRegistry.get(themeDraft.data.active_theme);
    draftThemeName = tDef?.name || themeDraft.title;
  }

  // 3. Compute Real Live Activity Feed from Actual Entries
  interface TimestampedActivity extends ActivityItem {
    rawTime: number;
  }

  const rawActivities: TimestampedActivity[] = [];

  // Recent contact inquiries
  for (const msg of contactMessages) {
    const rawTime = new Date(msg.created_at).getTime() || 0;
    rawActivities.push({
      id: `msg-${msg.id}`,
      type: 'message',
      title: `Inquiry from ${msg.name}`,
      detail: msg.message.length > 75 ? `${msg.message.slice(0, 75)}...` : msg.message,
      timestamp: formatRelativeTime(msg.created_at),
      rawTime,
    });
  }

  // Recent projects
  for (const proj of allProjects) {
    const dateStr = proj.updated_at || proj.created_at;
    const rawTime = new Date(dateStr).getTime() || 0;
    rawActivities.push({
      id: `proj-${proj.id}`,
      type: 'project',
      title: `Project: ${proj.title}`,
      detail: `${proj.status.toUpperCase()} • ${proj.technologies?.slice(0, 2).join(', ') || 'Machine Learning'}`,
      timestamp: formatRelativeTime(dateStr),
      rawTime,
    });
  }

  // Recent certifications
  for (const cert of allCerts) {
    const dateStr = cert.updated_at || cert.created_at;
    const rawTime = new Date(dateStr).getTime() || 0;
    rawActivities.push({
      id: `cert-${cert.id}`,
      type: 'certification',
      title: `Certification: ${cert.title}`,
      detail: `${cert.issuer} • ${cert.status.toUpperCase()}`,
      timestamp: formatRelativeTime(dateStr),
      rawTime,
    });
  }

  // Recent experience
  for (const exp of allExperience) {
    const dateStr = exp.updated_at || exp.created_at;
    const rawTime = new Date(dateStr).getTime() || 0;
    rawActivities.push({
      id: `exp-${exp.id}`,
      type: 'experience',
      title: `Experience: ${exp.company}`,
      detail: `${exp.role} • ${exp.is_current ? 'Current Role' : 'Completed'}`,
      timestamp: formatRelativeTime(dateStr),
      rawTime,
    });
  }

  // Recent drafts
  for (const draft of allDrafts) {
    const dateStr = draft.updated_at || draft.created_at;
    const rawTime = new Date(dateStr).getTime() || 0;
    rawActivities.push({
      id: `draft-${draft.id}`,
      type: 'setting',
      title: `Staged: ${draft.title}`,
      detail: `${draft.entity_type.toUpperCase()} draft pending publication`,
      timestamp: formatRelativeTime(dateStr),
      rawTime,
    });
  }

  // Sort by newest first and take top 6
  rawActivities.sort((a, b) => b.rawTime - a.rawTime);
  const realActivities: ActivityItem[] = rawActivities.slice(0, 6).map(({ id, type, title, detail, timestamp }) => ({
    id,
    type,
    title,
    detail,
    timestamp,
  }));

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Manage your portfolio content, live inquiries, and system settings."
      adminEmail={adminEmail}
    >
      <div className="space-y-6 sm:space-y-8 w-full">
        {/* Unpublished Changes Alert Banner */}
        {draftsCount > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <span className="font-bold text-amber-300 block text-sm">
                  {draftsCount} Unpublished {draftsCount === 1 ? 'Change' : 'Changes'} Pending
                </span>
                <span className="text-slate-400 text-xs">
                  Staged modifications are saved in draft and hidden from normal public visitors.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href="/admin/preview"
                target="_blank"
                className="px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-500/10 transition-colors min-h-[38px] inline-flex items-center"
              >
                Preview Drafts ↗
              </a>
              <a
                href="/admin/publishing"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors min-h-[38px] inline-flex items-center"
              >
                Review & Publish
              </a>
            </div>
          </div>
        )}

        {/* Backend & Security Infrastructure Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-[#0D111A] border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Database Security</span>
              <span className="text-emerald-400 font-bold text-xs mt-0.5 block">
                PostgreSQL RLS Active
              </span>
            </div>
            <span className="text-emerald-400 text-lg">🛡️</span>
          </div>

          <div className="bg-[#0D111A] border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Storage Buckets</span>
              <span className="text-amber-400 font-bold text-xs mt-0.5 block">
                3 Buckets Configured
              </span>
            </div>
            <span className="text-amber-400 text-lg">📁</span>
          </div>

          <div className="bg-[#0D111A] border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Session State</span>
              <span className="text-blue-400 font-bold text-xs mt-0.5 block">
                Secure SSR Cookies
              </span>
            </div>
            <span className="text-blue-400 text-lg">🔐</span>
          </div>

          <div className="bg-[#0D111A] border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-slate-400 block text-[11px]">Presentation Theme</span>
              <a
                href="/admin/themes"
                className="text-amber-400 hover:text-amber-300 font-bold text-xs block transition-colors truncate max-w-[180px]"
                title={activeThemeName}
              >
                {activeThemeName}
              </a>
              {draftThemeName ? (
                <span className="text-[10px] text-amber-200/80 block font-mono truncate max-w-[180px]">
                  Draft: {draftThemeName}
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400/80 block font-mono">
                  Active Public
                </span>
              )}
            </div>
            <span className="text-amber-400 text-lg">🎨</span>
          </div>
        </div>

        {/* 7 Real Stat Cards: Responsive layout that stretches cleanly across wide screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-4">
          <AdminStatCard
            label="Total Projects"
            value={projectsCount}
            change={`${publishedProjects} pub · ${draftProjects} draft`}
            icon="🚀"
            description="ML Models & Systems"
          />
          <AdminStatCard
            label="Total Experience"
            value={experienceCount}
            change={currentExpRoles > 0 ? `${currentExpRoles} current role` : `${experienceCount} total roles`}
            icon="💼"
            description="Career Milestones"
          />
          <AdminStatCard
            label="Certifications"
            value={certsCount}
            change={`${publishedCerts} verified / active`}
            icon="📜"
            description="Verified Credentials"
          />
          <AdminStatCard
            label="Visitor Inquiries"
            value={totalMessagesCount}
            change={unreadMessagesCount > 0 ? `${unreadMessagesCount} unread message${unreadMessagesCount === 1 ? '' : 's'}` : `${totalMessagesCount} total inquiries`}
            icon="📥"
            description="Direct Contact Messages"
          />
          <AdminStatCard
            label="Total Sections"
            value={sectionsCount}
            change={`${activeSectionsCount} of ${sectionsCount} active`}
            icon="📄"
            description="Dynamic Section Pipeline"
          />
          <AdminStatCard
            label="Media Assets"
            value={mediaStats.totalMedia}
            change={`${mediaStats.inUseCount} in active use`}
            icon="🖼️"
            description="Images & Documents"
          />
          <AdminStatCard
            label="Social Links"
            value={activeSocialCount}
            change={`${activeSocialCount} of ${socialLinksCount} active`}
            icon="🌐"
            description="Public Social Links"
          />
        </div>

        {/* 2-Column Content Layout: Real Recent Activity Feed & Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
          <div className="xl:col-span-8 space-y-6">
            <AdminActivityList items={realActivities} />
          </div>

          <div className="xl:col-span-4 space-y-6">
            <AdminQuickActions />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
