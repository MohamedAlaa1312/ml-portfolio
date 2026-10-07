import React from 'react';
import { redirect } from 'next/navigation';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/admin';
import { MediaManager } from '@/components/admin/media';

export const dynamic = 'force-dynamic';

export default async function AdminMediaPage() {
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

  // 3. Fetch Initial Media and Aggregate Statistics for Server-Side Rendering
  const [initialMedia, initialStats] = await Promise.all([
    AdminService.getAllMedia({ sort: 'newest' }),
    AdminService.getMediaStats(),
  ]);

  return (
    <AdminLayout
      title="Media"
      subtitle="Centralized media repository, asset metadata, and usage reference tracking."
      adminEmail={adminEmail}
    >
      <MediaManager initialMedia={initialMedia} initialStats={initialStats} />
    </AdminLayout>
  );
}
