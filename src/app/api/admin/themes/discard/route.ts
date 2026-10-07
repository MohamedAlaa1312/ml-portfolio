import { NextResponse } from 'next/server';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

export async function POST() {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
  }

  try {
    const allDrafts = await AdminService.getAllDrafts().catch(() => []);
    const themeDraft = allDrafts.find((d) => d.entity_type === 'theme');
    if (themeDraft) {
      await AdminService.discardDraft(themeDraft.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Theme draft discarded.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Discard failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
