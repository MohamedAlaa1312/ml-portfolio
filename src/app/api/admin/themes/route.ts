import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { ThemeService, ThemeRegistry } from '@/themes';

export const dynamic = 'force-dynamic';

/**
 * ==============================================================================
 * GET /api/admin/themes
 * ==============================================================================
 * Retrieves all registered themes from the authoritative ThemeRegistry,
 * verifies each theme against the Theme Contract, identifies the current
 * published theme and any pending draft theme.
 * Guarded strictly for authorized administrators.
 */
export async function GET() {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const activeTheme = await ThemeService.getActiveTheme();
    const allDrafts = await AdminService.getAllDrafts().catch(() => []);
    const themeDraft = allDrafts.find((d) => d.entity_type === 'theme');

    const availableThemes = ThemeService.getAvailableThemes().map((t) => {
      const validation = ThemeRegistry.validate(t);
      const isActive = t.id.toLowerCase() === activeTheme.id.toLowerCase();
      const isDraft = themeDraft?.data?.active_theme?.toLowerCase() === t.id.toLowerCase();

      let state: 'active' | 'draft' | 'available' | 'unavailable' = 'available';
      if (!validation.valid) {
        state = 'unavailable';
      } else if (isActive) {
        state = 'active';
      } else if (isDraft) {
        state = 'draft';
      }

      return {
        id: t.id,
        name: t.name,
        description: t.description,
        version: t.version,
        previewMetadata: t.previewMetadata,
        layout: t.layout,
        isValid: validation.valid,
        validationErrors: validation.errors,
        isAvailable: validation.valid,
        isActive,
        isDraft,
        state,
      };
    });

    return NextResponse.json({
      success: true,
      activeTheme: {
        id: activeTheme.id,
        name: activeTheme.name,
        description: activeTheme.description,
        version: activeTheme.version,
      },
      draftTheme: themeDraft
        ? {
            id: themeDraft.id,
            themeId: themeDraft.data?.active_theme,
            title: themeDraft.title,
            updatedAt: themeDraft.updated_at,
          }
        : null,
      availableThemes,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch themes';
    console.error('[GET /api/admin/themes] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading themes configuration.' },
      { status: 500 }
    );
  }
}

/**
 * ==============================================================================
 * POST /api/admin/themes
 * ==============================================================================
 * Handles Theme CMS actions:
 * - 'save_draft': Staged selection of a registered theme into cms_drafts
 * - 'publish': Publishes a selected or draft theme to site_settings.active_theme
 * - 'discard': Discards any active draft theme
 * Guarded strictly for authorized administrators.
 */
export async function POST(request: Request) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { action, themeId } = body;

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'Action parameter is required (save_draft, publish, or discard).' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'save_draft': {
        if (!themeId || typeof themeId !== 'string') {
          return NextResponse.json(
            { error: 'themeId is required to save a draft theme.' },
            { status: 400 }
          );
        }

        const themeDef = ThemeRegistry.get(themeId);
        if (!themeDef) {
          return NextResponse.json(
            { error: `Theme "${themeId}" is not registered in the Theme Registry.` },
            { status: 400 }
          );
        }

        const validation = ThemeRegistry.validate(themeDef);
        if (!validation.valid) {
          return NextResponse.json(
            {
              error: `Theme "${themeId}" failed contract validation and cannot be selected.`,
              errors: validation.errors,
            },
            { status: 400 }
          );
        }

        const draft = await AdminService.saveDraft({
          id: 'draft-theme-active_theme',
          entity_type: 'theme',
          entity_id: 'active_theme',
          title: `Theme: ${themeDef.name}`,
          summary: `Staged theme change to ${themeDef.name} (${themeDef.id})`,
          data: { active_theme: themeDef.id },
        });

        try {
          revalidatePath('/admin/preview');
          revalidatePath('/admin/dashboard');
          revalidatePath('/admin/themes');
        } catch {
          // safe ignore
        }

        return NextResponse.json({
          success: true,
          message: `Theme "${themeDef.name}" saved as draft.`,
          draftTheme: {
            id: draft.id,
            themeId: themeDef.id,
            title: draft.title,
            updatedAt: draft.updated_at,
          },
        });
      }

      case 'publish': {
        // Can publish a specified themeId or publish the existing staged draft theme
        let targetThemeId = themeId;
        const allDrafts = await AdminService.getAllDrafts().catch(() => []);
        const themeDraft = allDrafts.find((d) => d.entity_type === 'theme');

        if (!targetThemeId && themeDraft?.data?.active_theme) {
          targetThemeId = themeDraft.data.active_theme;
        }

        if (!targetThemeId || typeof targetThemeId !== 'string') {
          return NextResponse.json(
            { error: 'No theme specified and no active theme draft found to publish.' },
            { status: 400 }
          );
        }

        const themeDef = ThemeRegistry.get(targetThemeId);
        if (!themeDef) {
          return NextResponse.json(
            { error: `Theme "${targetThemeId}" is not registered in the Theme Registry.` },
            { status: 400 }
          );
        }

        const validation = ThemeRegistry.validate(themeDef);
        if (!validation.valid) {
          return NextResponse.json(
            {
              error: `Theme "${targetThemeId}" failed contract validation and cannot be published.`,
              errors: validation.errors,
            },
            { status: 400 }
          );
        }

        // 1. Update authoritative site_settings
        await AdminService.updateSiteSettings({ active_theme: themeDef.id });

        // 2. Discard theme draft if it exists
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
      }

      case 'discard': {
        const allDrafts = await AdminService.getAllDrafts().catch(() => []);
        const themeDraft = allDrafts.find((d) => d.entity_type === 'theme');

        if (themeDraft) {
          await AdminService.discardDraft(themeDraft.id);
        }

        try {
          revalidatePath('/admin/preview');
          revalidatePath('/admin/dashboard');
          revalidatePath('/admin/themes');
        } catch {
          // safe ignore
        }

        return NextResponse.json({
          success: true,
          message: 'Theme draft discarded.',
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action "${action}". Allowed: save_draft, publish, discard.` },
          { status: 400 }
        );
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Theme operation failed';
    console.error('[POST /api/admin/themes] Error:', errorMsg);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
