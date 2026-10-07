import React from 'react';
import { redirect } from 'next/navigation';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/admin';
import { ThemesManager, type AdminThemeItem } from '@/components/admin/themes';
import { ThemeService, ThemeRegistry } from '@/themes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * ==============================================================================
 * ADMIN THEMES MANAGEMENT PAGE (/admin/themes)
 * ==============================================================================
 * Central control plane for portfolio visual themes.
 * Guarded strictly for authorized administrators only.
 * Enables theme inspection, draft staging, preview, and safe publication.
 */
export default async function AdminThemesPage() {
  // 1. Defense-in-depth Server-Side Authorization Check
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    redirect('/admin/login?error=unauthorized');
  }

  // 2. Fetch authenticated admin email
  let adminEmail = 'mohamed@example.com';
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      adminEmail = user.email;
    }
  } catch {
    // Fallback email
  }

  // 3. Load active theme and staged drafts from authoritative sources
  const activeTheme = await ThemeService.getActiveTheme();
  const allDrafts = await AdminService.getAllDrafts().catch(() => []);
  const themeDraft = allDrafts.find((d) => d.entity_type === 'theme');

  // 4. Map registered themes with contract validation
  const availableThemes: AdminThemeItem[] = ThemeService.getAvailableThemes().map((t) => {
    const validation = ThemeRegistry.validate(t);
    const isActive = t.id.toLowerCase() === activeTheme.id.toLowerCase();
    const isDraft = themeDraft?.data?.active_theme?.toLowerCase() === t.id.toLowerCase();

    let state: 'active' | 'draft' | 'available' | 'unavailable' = 'available';
    if (!validation.valid) {
      state = 'unavailable';
    } else if (isActive) {
      state = 'active';
    } else if (isDraft) {
      state = 'draft';
    }

    return {
      id: t.id,
      name: t.name,
      description: t.description,
      version: t.version,
      previewMetadata: t.previewMetadata,
      layout: t.layout,
      isValid: validation.valid,
      validationErrors: validation.errors,
      isAvailable: validation.valid,
      isActive,
      isDraft,
      state,
    };
  });

  return (
    <AdminLayout
      title="Themes"
      subtitle="Inspect, stage, preview, and publish presentation themes for the public portfolio."
      adminEmail={adminEmail}
    >
      <ThemesManager
        initialActiveTheme={{
          id: activeTheme.id,
          name: activeTheme.name,
          description: activeTheme.description,
          version: activeTheme.version,
        }}
        initialDraftTheme={
          themeDraft
            ? {
                id: themeDraft.id,
                themeId: themeDraft.data?.active_theme,
                title: themeDraft.title,
                updatedAt: themeDraft.updated_at,
              }
            : null
        }
        initialAvailableThemes={availableThemes}
      />
    </AdminLayout>
  );
}
