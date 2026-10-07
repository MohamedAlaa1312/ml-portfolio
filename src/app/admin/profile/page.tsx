import React from 'react';
import { redirect } from 'next/navigation';
import { AuthServerService } from '@/services/auth.server';
import { CmsService } from '@/services/cms.service';
import { AdminService } from '@/services/admin.service';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/admin';
import { ProfileHeroEditor } from '@/components/admin/ProfileHeroEditor';
import type { Section } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
  // 1. Server-Side Defense-in-Depth Authorization Check
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    redirect('/admin/login?error=unauthorized');
  }

  // 2. Load Session Info for Admin Layout
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

  // 3. Load Current Profile & Hero Settings
  const [siteSettings, sections] = await Promise.all([
    CmsService.getSiteSettings().catch(() => null),
    AdminService.getAllSections().catch(() => [] as Section[]),
  ]);

  const heroSection = sections.find((s) => s.type === 'hero' || s.slug === 'hero') || null;

  return (
    <AdminLayout adminEmail={adminEmail} title="Profile & Hero">
      <div className="space-y-6">
        <ProfileHeroEditor
          initialSettings={siteSettings}
          initialHeroSection={heroSection}
        />
      </div>
    </AdminLayout>
  );
}
