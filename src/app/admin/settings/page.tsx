import React from 'react';
import { redirect } from 'next/navigation';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/admin';
import { SettingsManager } from '@/components/admin/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminSettingsPage() {
  // 1. Defense-in-Depth Server-Side Authorization Check
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    redirect('/admin/login?error=unauthorized');
  }

  // 2. Resolve Admin Email
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

  // 3. Fetch Initial Authoritative Site Settings for Server-Side Rendering
  const initialSettings = await AdminService.getSiteSettings();
  if (!initialSettings) {
    throw new Error('Failed to load authoritative site settings record.');
  }

  return (
    <AdminLayout
      title="Settings"
      subtitle="Global website configuration, SEO defaults, branding, and system preferences."
      adminEmail={adminEmail}
    >
      <SettingsManager initialSettings={initialSettings} />
    </AdminLayout>
  );
}
