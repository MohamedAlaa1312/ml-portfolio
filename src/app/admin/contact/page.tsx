import React from 'react';
import { redirect } from 'next/navigation';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/admin';
import { ContactSocialManager } from '@/components/admin/contact';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminContactPage() {
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

  // 3. Load Contact and Social Data in Parallel
  const [siteSettings, contactSection, socialLinks] = await Promise.all([
    AdminService.getSiteSettings(),
    AdminService.getContactSection(),
    AdminService.getSocialLinks(),
  ]);

  return (
    <AdminLayout adminEmail={adminEmail} title="Contact & Social CMS">
      <ContactSocialManager
        initialSettings={siteSettings}
        initialSection={contactSection}
        initialSocialLinks={socialLinks}
      />
    </AdminLayout>
  );
}
