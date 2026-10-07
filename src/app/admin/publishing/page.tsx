import React from 'react';
import { redirect } from 'next/navigation';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/admin';
import { PublishingManager } from '@/components/admin/publishing';

export const dynamic = 'force-dynamic';

export default async function AdminPublishingPage() {
  // 1. Defense-in-Depth Server-Side Authorization Check
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    redirect('/admin/login?error=unauthorized');
  }

  // 2. Fetch session and active drafts
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

  const drafts = await AdminService.getAllDrafts().catch(() => []);

  return (
    <AdminLayout
      title="Publishing"
      subtitle="Review, preview, and publish staged draft changes to the public portfolio."
      adminEmail={adminEmail}
    >
      <PublishingManager initialDrafts={drafts} />
    </AdminLayout>
  );
}
