import { ThemeRegistry } from './registry';
import type { ThemeDefinition } from './types';
import { CmsService } from '@/services/cms.service';

/**
 * ==============================================================================
 * THEME RESOLUTION SERVICE (Phase 18)
 * 
 * Server-side authoritative theme resolution.
 * Coordinates with CmsService to retrieve site settings and resolve the active theme
 * while maintaining strict separation of concerns and guaranteed fallback.
 * ==============================================================================
 */

export interface ThemeResolutionContext {
  /**
   * Optional preview theme override (only valid in authorized admin preview sessions)
   */
  previewThemeId?: string | null;
}

export const ThemeService = {
  /**
   * Resolves the authoritative active theme for the public portfolio.
   * Priority:
   * 1. Authorized previewThemeId (if passed in preview context)
   * 2. Authoritative siteSettings.active_theme from database / CMS
   * 3. Safe fallback theme (ThemeRegistry.getDefault())
   */
  async getActiveTheme(context?: ThemeResolutionContext): Promise<ThemeDefinition> {
    try {
      // 1. Check for authorized preview override
      if (context?.previewThemeId) {
        return ThemeRegistry.resolve(context.previewThemeId);
      }

      // 2. Fetch authoritative site settings from CMS
      const settings = await CmsService.getSiteSettings().catch(() => null);
      const configuredThemeId = settings?.active_theme;

      // 3. Resolve through ThemeRegistry with safe fallback
      return ThemeRegistry.resolve(configuredThemeId);
    } catch (err) {
      console.warn('[ThemeService.getActiveTheme] Resolution error, using default theme fallback:', err);
      return ThemeRegistry.getDefault();
    }
  },

  /**
   * Authoritatively resolves the published theme for public visitors.
   * Strictly reads siteSettings.active_theme from CMS without any preview overrides.
   */
  async getPublishedTheme(): Promise<ThemeDefinition> {
    try {
      const settings = await CmsService.getSiteSettings().catch(() => null);
      return ThemeRegistry.resolve(settings?.active_theme);
    } catch (err) {
      console.warn('[ThemeService.getPublishedTheme] Failed to load published theme:', err);
      return ThemeRegistry.getDefault();
    }
  },

  /**
   * Synchronously resolves a theme by ID with safe fallback.
   */
  resolveTheme(themeId?: string | null): ThemeDefinition {
    return ThemeRegistry.resolve(themeId);
  },

  /**
   * Retrieves a registered theme by its exact identifier.
   */
  getThemeById(id: string): ThemeDefinition | undefined {
    return ThemeRegistry.get(id);
  },

  /**
   * Retrieves the complete list of all currently registered themes.
   */
  getAvailableThemes(): ThemeDefinition[] {
    return ThemeRegistry.getAll();
  },

  /**
   * Validates whether a theme ID is actively registered.
   */
  validateThemeId(id: string): boolean {
    return ThemeRegistry.isValidThemeId(id);
  },

  /**
   * Validates a candidate theme definition against the formal theme contract.
   */
  validateThemeContract(theme: unknown) {
    return ThemeRegistry.validate(theme);
  },

  /**
   * Returns the designated baseline/default theme definition.
   */
  getDefaultTheme(): ThemeDefinition {
    return ThemeRegistry.getDefault();
  },
};
