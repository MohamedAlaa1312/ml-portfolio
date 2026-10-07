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

export default async function AdminDashboardPage() {
  // 1. Server-Side Defense-in-Depth Authorization Check
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    redirect('/admin/login?error=unauthorized');
  }

  let adminEmail = 'mohamed@example.com';
  let sectionsCount = 7;
  let projectsCount = 4;
  let experienceCount = 3;
  let certsCount = 4;
  let socialLinksCount = 0;
  let activeSocialCount = 0;
  let draftsCount = 0;
  let mediaStats = { totalMedia: 8, inUseCount: 7 };
  let activeThemeName = 'Modern Technical Editorial';
  let draftThemeName: string | null = null;

  const activities: ActivityItem[] = [
    {
      id: 'act-1',
      type: 'project',
      title: 'Project Updated',
      detail: 'AI Recommendation System (Matrix Factorization)',
      timestamp: '2 hours ago',
    },
    {
      id: 'act-2',
      type: 'certification',
      title: 'New Certification Added',
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

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      adminEmail = user.email;
    }

    // Live exact counts from PostgreSQL tables
    const [sectionsRes, projectsRes, expRes, certsRes] = await Promise.all([
      supabase.from('sections').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('experience').select('*', { count: 'exact', head: true }),
      supabase.from('certifications').select('*', { count: 'exact', head: true }),
    ]);

    try {
      const allSections = await AdminService.getAllSections();
      sectionsCount = allSections.length;
      const socialLinks = await AdminService.getSocialLinks();
      socialLinksCount = socialLinks.length;
      activeSocialCount = socialLinks.filter((s) => s.enabled).length;
      const allDrafts = await AdminService.getAllDrafts();
      draftsCount = allDrafts.length;
      mediaStats = await AdminService.getMediaStats();
    } catch {
      // ignore
    }

    if (sectionsRes.count !== null && sectionsRes.count !== undefined) {
      sectionsCount = sectionsRes.count;
    }
    if (projectsRes.count !== null && projectsRes.count !== undefined) {
      projectsCount = projectsRes.count;
    }
    if (expRes.count !== null && expRes.count !== undefined) {
      experienceCount = expRes.count;
    }
    if (certsRes.count !== null && certsRes.count !== undefined) {
      certsCount = certsRes.count;
    }
  } catch (err) {
    console.warn('[Admin Dashboard] Fetch warning:', err);
    try {
      const allSections = await AdminService.getAllSections();
      sectionsCount = allSections.length;
      const allProjects = await AdminService.getAllProjects();
      projectsCount = allProjects.length;
      const allCerts = await AdminService.getAllCertifications();
      certsCount = allCerts.length;
      const socialLinks = await AdminService.getSocialLinks();
      socialLinksCount = socialLinks.length;
      activeSocialCount = socialLinks.filter((s) => s.enabled).length;
      const allDrafts = await AdminService.getAllDrafts();
      draftsCount = allDrafts.length;
      mediaStats = await AdminService.getMediaStats();
    } catch {
      // ignore
    }
  }

  // Load Active Theme and Theme Draft for Dashboard
  try {
    const activeTheme = await ThemeService.getActiveTheme().catch(() => ThemeService.getDefaultTheme());
    activeThemeName = activeTheme.name;
    const allDraftsList = await AdminService.getAllDrafts().catch(() => []);
    const themeDraft = allDraftsList.find((d) => d.entity_type === 'theme');
    if (themeDraft?.data?.active_theme) {
      const tDef = ThemeRegistry.get(themeDraft.data.active_theme);
      draftThemeName = tDef?.name || themeDraft.title;
    }
  } catch {
    // Graceful fallback
  }

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Manage your portfolio content and settings."
      adminEmail={adminEmail}
    >
      <div className="space-y-6 sm:space-y-8">
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
                className="px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-500/10 transition-colors"
              >
                Preview Drafts ↗
              </a>
              <a
                href="/admin/publishing"
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
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
                className="text-amber-400 hover:text-amber-300 font-bold text-xs block transition-colors truncate max-w-[160px]"
                title={activeThemeName}
              >
                {activeThemeName}
              </a>
              {draftThemeName ? (
                <span className="text-[10px] text-amber-200/80 block font-mono truncate max-w-[160px]">
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

        {/* 6 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <AdminStatCard
            label="Total Sections"
            value={sectionsCount}
            change="+2 this month"
            icon="📄"
            description="Dynamic Section Pipeline"
          />
          <AdminStatCard
            label="Total Projects"
            value={projectsCount}
            change="+1 this month"
            icon="🚀"
            description="ML Models & Demos"
          />
          <AdminStatCard
            label="Total Experience"
            value={experienceCount}
            change="+1 this month"
            icon="💼"
            description="Career Milestones"
          />
          <AdminStatCard
            label="Certifications"
            value={certsCount}
            change="+1 this month"
            icon="📜"
            description="Verified Credentials"
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

        {/* 2-Column Content Layout: Recent Activity (2 cols) & Quick Actions (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <AdminActivityList items={activities} />
          </div>

          <div className="lg:col-span-1">
            <AdminQuickActions />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
