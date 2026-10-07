import { NextResponse } from 'next/server';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { ThemeRegistry } from '@/themes';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
  }

  try {
    const { themeId } = await request.json().catch(() => ({}));
    if (!themeId) {
      return NextResponse.json({ error: 'themeId is required' }, { status: 400 });
    }

    const themeDef = ThemeRegistry.get(themeId);
    if (!themeDef) {
      return NextResponse.json({ error: `Theme "${themeId}" is not registered.` }, { status: 400 });
    }

    const validation = ThemeRegistry.validate(themeDef);
    if (!validation.valid) {
      return NextResponse.json(
        { error: `Theme "${themeId}" failed contract validation.`, errors: validation.errors },
        { status: 400 }
      );
    }

    const draft = await AdminService.saveDraft({
      id: 'draft-theme-active_theme',
      entity_type: 'theme',
      entity_id: 'active_theme',
      title: `Theme: ${themeDef.name}`,
      summary: `Staged theme change to ${themeDef.name}`,
      data: { active_theme: themeDef.id },
    });

    return NextResponse.json({
      success: true,
      message: `Theme "${themeDef.name}" saved as draft.`,
      draft,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save draft';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE() {
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
    return NextResponse.json({ success: true, message: 'Theme draft discarded.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to discard draft';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
