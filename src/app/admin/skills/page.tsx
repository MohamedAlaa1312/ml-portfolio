import React from 'react';
import { redirect } from 'next/navigation';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/admin';
import { SkillsManager } from '@/components/admin/skills/SkillsManager';
import type { Skill, SkillCategory } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function AdminSkillsPage() {
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

  // 3. Load All Skills & Categories in parallel
  const [skills, categories] = await Promise.all([
    AdminService.getAllSkills().catch(() => [] as Skill[]),
    AdminService.getSkillCategories().catch(() => [] as SkillCategory[]),
  ]);

  return (
    <AdminLayout adminEmail={adminEmail} title="Skills CMS">
      <SkillsManager initialSkills={skills} initialCategories={categories} />
    </AdminLayout>
  );
}
