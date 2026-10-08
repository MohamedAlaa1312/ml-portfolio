import React from 'react';
import { redirect } from 'next/navigation';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/admin';
import { ProjectsManager } from '@/components/admin/projects/ProjectsManager';
import type { Project, Skill } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminProjectsPage() {
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

  // 3. Load Projects and Skills for Technology Selection
  const [projects, skills] = await Promise.all([
    AdminService.getAllProjects().catch(() => [] as Project[]),
    AdminService.getAllSkills().catch(() => [] as Skill[]),
  ]);

  return (
    <AdminLayout adminEmail={adminEmail} title="Projects CMS">
      <ProjectsManager initialProjects={projects} availableSkills={skills} />
    </AdminLayout>
  );
}
