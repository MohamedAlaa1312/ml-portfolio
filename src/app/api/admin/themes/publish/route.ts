import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
    let targetThemeId = themeId;

    const allDrafts = await AdminService.getAllDrafts().catch(() => []);
    const themeDraft = allDrafts.find((d) => d.entity_type === 'theme');

    if (!targetThemeId && themeDraft?.data?.active_theme) {
      targetThemeId = themeDraft.data.active_theme;
    }

    if (!targetThemeId) {
      return NextResponse.json({ error: 'No theme specified or staged in draft to publish.' }, { status: 400 });
    }

    const themeDef = ThemeRegistry.get(targetThemeId);
    if (!themeDef) {
      return NextResponse.json({ error: `Theme "${targetThemeId}" is not registered.` }, { status: 400 });
    }

    const validation = ThemeRegistry.validate(themeDef);
    if (!validation.valid) {
      return NextResponse.json(
        { error: `Theme "${targetThemeId}" failed contract validation.`, errors: validation.errors },
        { status: 400 }
      );
    }

    // 1. Update site_settings
    await AdminService.updateSiteSettings({ active_theme: themeDef.id });

    // 2. Discard draft if it exists
    if (themeDraft) {
      await AdminService.discardDraft(themeDraft.id);
    }

    // 3. Revalidate public and preview caches
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/admin/preview');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/themes');
    } catch (e) {
      console.warn('[Theme Publish] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Theme "${themeDef.name}" published successfully.`,
      activeTheme: {
        id: themeDef.id,
        name: themeDef.name,
        version: themeDef.version,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Publish failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
