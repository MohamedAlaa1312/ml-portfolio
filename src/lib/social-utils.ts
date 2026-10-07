import type { SocialLinkItem } from './supabase/types';

/**
 * Standard utility to parse social links from either:
 * - A structured SocialLinkItem[] array
 * - A legacy dictionary object: { linkedin: "...", github: "...", x: "...", email: "..." }
 * - An object containing { items: SocialLinkItem[] }
 *
 * Always returns a clean, sorted SocialLinkItem[] list ordered by display_order.
 */
export function parseSocialLinks(raw: unknown): SocialLinkItem[] {
  if (!raw) return [];

  // 1. If it's already an array
  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (!item || typeof item !== 'object') return null;
        const platform = String(item.platform || item.label || 'Link').trim();
        const url = String(item.url || '').trim();
        return {
          id: String(item.id || `soc-${index + 1}`),
          platform: platform || 'Link',
          label: String(item.label || platform || 'Link').trim(),
          url,
          icon: item.icon ? String(item.icon).trim() : getPlatformIcon(platform),
          display_order:
            typeof item.display_order === 'number' && !isNaN(item.display_order)
              ? item.display_order
              : index + 1,
          enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
          status: item.status || 'published',
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
        } as SocialLinkItem;
      })
      .filter((item): item is SocialLinkItem => item !== null && Boolean(item.url))
      .sort((a, b) => a.display_order - b.display_order);
  }

  // 2. If it's an object with an items array
  if (typeof raw === 'object') {
    const rawObj = raw as Record<string, unknown>;
    if (Array.isArray(rawObj.items)) {
      return parseSocialLinks(rawObj.items);
    }

    // 3. If it's a key-value dictionary (legacy format)
    const entries = Object.entries(rawObj);
    const result: SocialLinkItem[] = [];
    let order = 1;

    for (const [key, val] of entries) {
      if (typeof val === 'string' && val.trim().length > 0) {
        let platformName = key.trim();
        const keyLower = platformName.toLowerCase();
        if (keyLower === 'x' || keyLower === 'twitter') platformName = 'X / Twitter';
        else if (keyLower === 'linkedin') platformName = 'LinkedIn';
        else if (keyLower === 'github') platformName = 'GitHub';
        else if (keyLower === 'email') platformName = 'Email';
        else if (keyLower === 'kaggle') platformName = 'Kaggle';
        else if (keyLower === 'huggingface') platformName = 'Hugging Face';
        else platformName = platformName.charAt(0).toUpperCase() + platformName.slice(1);

        result.push({
          id: `soc-${key.toLowerCase()}`,
          platform: platformName,
          label: platformName,
          url: val.trim(),
          icon: getPlatformIcon(platformName),
          display_order: order++,
          enabled: true,
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    return result.sort((a, b) => a.display_order - b.display_order);
  }

  return [];
}

/**
 * Validates whether a URL is a legitimate, safe web URL or mailto link.
 * Rejects javascript:, data:, vbscript: and empty strings.
 */
export function isValidUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();

  // Explicit safety block against script injection
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return false;
  }

  // Accept mailto: links
  if (trimmed.startsWith('mailto:')) {
    const emailPart = trimmed.replace('mailto:', '').split('?')[0];
    return isValidEmail(emailPart);
  }

  // Accept relative paths
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return true;
  }

  // Accept valid http:// or https:// URLs
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates standard international email format.
 */
export function isValidEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  // Standard RFC-compliant practical email regex
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(trimmed);
}

/**
 * Returns a recognizable emoji/icon for known tech & social platforms.
 */
export function getPlatformIcon(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes('linkedin')) return '💼';
  if (p.includes('github')) return '💻';
  if (p.includes('twitter') || p === 'x' || p.includes('x /')) return '🐦';
  if (p.includes('kaggle')) return '📊';
  if (p.includes('hugging') || p.includes('hf')) return '🤗';
  if (p.includes('medium')) return '✍️';
  if (p.includes('email') || p.includes('mail')) return '✉️';
  if (p.includes('youtube')) return '▶️';
  if (p.includes('discord')) return '💬';
  if (p.includes('scholar')) return '🎓';
  if (p.includes('arxiv')) return '📄';
  if (p.includes('website') || p.includes('blog')) return '🌐';
  return '🔗';
}
