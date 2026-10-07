import type { ThemeDefinition, ThemeValidationResult } from './types';
import { defaultTheme } from './definitions/default.theme';
import { modernEditorialTheme } from './modern-editorial';
import { precisionDarkTheme } from './precision-dark';
import { structuredMonochromeTheme } from './structured-monochrome';

/**
 * ==============================================================================
 * THEME CONTRACT VALIDATOR (Phase 21 Future Theme Foundation)
 * 
 * Verifies that a theme implementation conforms strictly to the ThemeDefinition
 * contract before registration, preventing runtime crashes or missing renderers.
 * ==============================================================================
 */
export function validateThemeContract(theme: unknown): ThemeValidationResult {
  const errors: string[] = [];

  if (!theme || typeof theme !== 'object') {
    return { valid: false, errors: ['Theme definition must be a non-null object.'] };
  }

  const t = theme as Partial<ThemeDefinition>;

  // 1. Validate ID
  if (!t.id || typeof t.id !== 'string') {
    errors.push('Theme "id" is required and must be a string.');
  } else if (!/^[a-z0-9-_]+$/.test(t.id)) {
    errors.push(`Theme id "${t.id}" contains invalid characters. Use lowercase alphanumeric with dashes/underscores.`);
  }

  // 2. Validate Metadata
  if (!t.name || typeof t.name !== 'string') {
    errors.push('Theme "name" is required and must be a string.');
  }
  if (!t.version || typeof t.version !== 'string') {
    errors.push('Theme "version" is required and must be a semver string.');
  }
  if (!t.description || typeof t.description !== 'string') {
    errors.push('Theme "description" is required and must be a descriptive string.');
  }

  // 3. Validate Tokens
  if (!t.tokens || typeof t.tokens !== 'object') {
    errors.push('Theme "tokens" object is required.');
  } else {
    if (!t.tokens.colors || typeof t.tokens.colors !== 'object') {
      errors.push('Theme tokens must specify a "colors" object.');
    } else {
      if (!t.tokens.colors.bgPrimary) errors.push('Theme tokens.colors must specify "bgPrimary".');
      if (!t.tokens.colors.textPrimary) errors.push('Theme tokens.colors must specify "textPrimary".');
      if (!t.tokens.colors.accent) errors.push('Theme tokens.colors must specify "accent".');
    }
    if (!t.tokens.typography || typeof t.tokens.typography !== 'object') {
      errors.push('Theme tokens must specify a "typography" object.');
    }
    if (!t.tokens.spacing || typeof t.tokens.spacing !== 'object') {
      errors.push('Theme tokens must specify a "spacing" object.');
    }
    if (!t.tokens.shape || typeof t.tokens.shape !== 'object') {
      errors.push('Theme tokens must specify a "shape" object.');
    }
    if (!t.tokens.motion || typeof t.tokens.motion !== 'object') {
      errors.push('Theme tokens must specify a "motion" object.');
    }
  }

  // 4. Validate Layout
  if (!t.layout || typeof t.layout !== 'object') {
    errors.push('Theme "layout" object is required.');
  } else {
    if (!t.layout.containerMaxWidth) errors.push('Theme layout must specify "containerMaxWidth".');
    if (!t.layout.navPosition) errors.push('Theme layout must specify "navPosition".');
    if (!t.layout.sectionPadding) errors.push('Theme layout must specify "sectionPadding".');
    if (!t.layout.gridGap) errors.push('Theme layout must specify "gridGap".');
  }

  // 5. Validate Required Section Renderers
  const requiredRenderers = [
    'NavigationRenderer',
    'HeroRenderer',
    'AboutRenderer',
    'ExperienceRenderer',
    'SkillsRenderer',
    'ProjectsRenderer',
    'CertificationsRenderer',
    'ContactRenderer',
    'FooterRenderer',
  ] as const;

  if (!t.renderers || typeof t.renderers !== 'object') {
    errors.push('Theme "renderers" object is required.');
  } else {
    for (const rendererName of requiredRenderers) {
      const fn = (t.renderers as unknown as Record<string, unknown>)[rendererName];
      if (!fn || (typeof fn !== 'function' && typeof fn !== 'object')) {
        errors.push(`Theme renderers must provide a valid React component for "${rendererName}".`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * ==============================================================================
 * CENTRALIZED THEME REGISTRY (Phase 18, 19, 20 & 21)
 * 
 * Manages all registered presentation themes for the portfolio.
 * Provides deterministic theme retrieval, contract validation, and fallback resolution.
 * ==============================================================================
 */
class ThemeRegistryManager {
  private themes: Map<string, ThemeDefinition> = new Map();
  private defaultThemeId: string = 'modern-developer';

  constructor() {
    // Automatically register the baseline/default theme
    this.register(defaultTheme);

    // Register Theme 1: Modern Technical Editorial (Phase 19)
    this.register(modernEditorialTheme);

    // Register Theme 2: Precision Dark Portfolio (Phase 20)
    this.register(precisionDarkTheme);

    // Register Theme 3: Structured Monochrome (Phase 21)
    this.register(structuredMonochromeTheme);
  }

  /**
   * Validates a candidate theme definition against the formal theme contract.
   */
  public validate(theme: unknown): ThemeValidationResult {
    return validateThemeContract(theme);
  }

  /**
   * Registers a new theme definition with the registry after contract validation.
   */
  public register(theme: ThemeDefinition): void {
    const validation = this.validate(theme);
    if (!validation.valid) {
      const themeId = theme?.id || 'unknown';
      console.error(`[ThemeRegistry] Theme "${themeId}" failed contract validation:`, validation.errors);
      throw new Error(`[ThemeRegistry] Theme "${themeId}" contract validation failed: ${validation.errors.join('; ')}`);
    }

    this.themes.set(theme.id.toLowerCase(), theme);
  }

  /**
   * Retrieves a theme by its stable identifier.
   * Returns undefined if the theme is not registered.
   */
  public get(id: string): ThemeDefinition | undefined {
    if (!id) return undefined;
    const normalized = id.toLowerCase().trim();

    // Support 'default' alias pointing to baseline theme
    if (normalized === 'default') {
      return this.themes.get(this.defaultThemeId);
    }

    return this.themes.get(normalized);
  }

  /**
   * Retrieves all registered themes.
   */
  public getAll(): ThemeDefinition[] {
    return Array.from(this.themes.values());
  }

  /**
   * Retrieves the designated safe fallback theme.
   */
  public getDefault(): ThemeDefinition {
    const baseline = this.themes.get(this.defaultThemeId);
    if (!baseline) {
      return defaultTheme;
    }
    return baseline;
  }

  /**
   * Resolves a theme by ID with guaranteed fallback.
   * Merges resolved renderers with baseline renderers so any future theme
   * missing an optional or newly introduced section renderer safely falls back
   * without crashing the public view.
   */
  public resolve(id?: string | null): ThemeDefinition {
    const baseline = this.getDefault();

    if (!id) {
      return baseline;
    }

    const found = this.get(id);
    if (found) {
      const validation = this.validate(found);
      if (!validation.valid) {
        console.warn(
          `[ThemeRegistry] Theme "${id}" failed contract validation. Falling back to default theme "${this.defaultThemeId}". Errors:`,
          validation.errors
        );
        return baseline;
      }

      // Safe renderer proxying / fallback for future section compatibility
      return {
        ...found,
        renderers: {
          ...baseline.renderers,
          ...found.renderers,
        },
      };
    }

    // Safe fallback without throwing errors or corrupting UI
    console.warn(
      `[ThemeRegistry] Theme "${id}" is not registered. Falling back to default theme "${this.defaultThemeId}".`
    );
    return baseline;
  }

  /**
   * Checks whether a theme ID is actively registered.
   */
  public has(id: string): boolean {
    if (!id) return false;
    const normalized = id.toLowerCase().trim();
    if (normalized === 'default') return true;
    return this.themes.has(normalized);
  }

  /**
   * Validates if a theme ID exists and is ready for use.
   */
  public isValidThemeId(id: string): boolean {
    return this.has(id);
  }
}

// Global Singleton Registry Instance
export const ThemeRegistry = new ThemeRegistryManager();
