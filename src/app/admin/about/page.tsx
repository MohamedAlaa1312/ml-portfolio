import React from 'react';
import { redirect } from 'next/navigation';
import { AuthServerService } from '@/services/auth.server';
import { CmsService } from '@/services/cms.service';
import { AdminService } from '@/services/admin.service';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/admin';
import { AboutEditor } from '@/components/admin/AboutEditor';
import type { Section } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminAboutPage() {
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

  // 3. Load Current About Section & Site Settings
  const [sections, siteSettings] = await Promise.all([
    AdminService.getAllSections().catch(() => [] as Section[]),
    AdminService.getSiteSettings().catch(() => null),
  ]);

  const aboutSection =
    sections.find((s) => s.type === 'about' || s.slug === 'about') || null;

  return (
    <AdminLayout adminEmail={adminEmail} title="About Section CMS">
      <AboutEditor initialSection={aboutSection} siteSettings={siteSettings} />
    </AdminLayout>
  );
}
