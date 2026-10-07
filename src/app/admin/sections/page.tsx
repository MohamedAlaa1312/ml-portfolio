import React from 'react';
import { redirect } from 'next/navigation';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/admin';
import { SectionsManager } from '@/components/admin/sections';

export const dynamic = 'force-dynamic';

export default async function AdminSectionsPage() {
  // 1. Defense-in-Depth Server-Side Authorization Check
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    redirect('/admin/login?error=unauthorized');
  }

  // 2. Fetch session and sections in parallel
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

  const sections = await AdminService.getAllSections().catch(() => []);

  return (
    <AdminLayout
      title="Sections"
      subtitle="Manage the order and visibility of the public portfolio sections."
      adminEmail={adminEmail}
    >
      <SectionsManager initialSections={sections} />
    </AdminLayout>
  );
}
