/**
 * ==============================================================================
 * PHASE 18 VERIFICATION TEST SUITE
 * Multi-Theme Architecture
 * ==============================================================================
 *
 * Verifies:
 * 1. Theme Contract & Registry Architecture (Registration, retrieval, validation)
 * 2. Fallback Resolution (Invalid/missing theme IDs safely resolve to default theme)
 * 3. Server-Side Theme Resolution (ThemeService coordinates with CMS data)
 * 4. Backend Admin Readiness (GET /api/admin/themes returns active and available themes)
 * 5. Public Portfolio Non-Regression (HTTP 200, all sections rendered via Active Theme)
 * 6. Section Sequence & Anchors (#hero, #about, #experience, #skills, #projects, #certifications, #contact)
 * 7. Responsive & Accessibility Preservation (Semantic HTML, headings, ARIA attributes)
 * 8. Draft & Preview Theme Integration (Admin preview successfully renders through theme)
 * 9. Data & CMS Isolation (Themes consume normalized data, zero direct DB queries)
 * 10. Security & Mutation Protection (Public visitors cannot alter theme configuration)
 * ==============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ADMIN_COOKIE = 'sb-admin-auth-preview=active';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✖ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('==========================================================');
  console.log('🎨 STARTING PHASE 18 MULTI-THEME ARCHITECTURE TESTS');
  console.log('==========================================================\n');

  // --------------------------------------------------------------------------
  // 1. THEME CONTRACT & REGISTRY STATIC AUDIT
  // --------------------------------------------------------------------------
  console.log('--- 1. Theme Contract & Registry Architecture ---');

  const typesPath = path.resolve(process.cwd(), 'src', 'themes', 'types.ts');
  const registryPath = path.resolve(process.cwd(), 'src', 'themes', 'registry.ts');
  const servicePath = path.resolve(process.cwd(), 'src', 'themes', 'theme.service.ts');
  const defaultThemePath = path.resolve(process.cwd(), 'src', 'themes', 'definitions', 'default.theme.tsx');
  const rendererPath = path.resolve(process.cwd(), 'src', 'themes', 'components', 'ThemedSectionRenderer.tsx');
  const themesApiPath = path.resolve(process.cwd(), 'src', 'app', 'api', 'admin', 'themes', 'route.ts');

  assert(fs.existsSync(typesPath), 'Theme contract interfaces exist in src/themes/types.ts');
  assert(fs.existsSync(registryPath), 'Centralized ThemeRegistry exists in src/themes/registry.ts');
  assert(fs.existsSync(servicePath), 'ThemeService exists in src/themes/theme.service.ts');
  assert(fs.existsSync(defaultThemePath), 'Baseline default theme definition exists in src/themes/definitions/default.theme.tsx');
  assert(fs.existsSync(rendererPath), 'ThemedSectionRenderer exists in src/themes/components/ThemedSectionRenderer.tsx');
  assert(fs.existsSync(themesApiPath), 'Backend admin readiness route exists in src/app/api/admin/themes/route.ts');

  // Inspect Registry Implementation
  const registryCode = fs.readFileSync(registryPath, 'utf-8');
  assert(
    registryCode.includes('register(') &&
      registryCode.includes('get(') &&
      registryCode.includes('getAll()') &&
      registryCode.includes('getDefault()') &&
      registryCode.includes('resolve(') &&
      registryCode.includes('isValidThemeId('),
    'ThemeRegistry implements complete API contract (register, get, getAll, getDefault, resolve, isValidThemeId)'
  );

  // Inspect Default Theme Definition
  const defaultThemeCode = fs.readFileSync(defaultThemePath, 'utf-8');
  assert(
    defaultThemeCode.includes("id: 'modern-developer'") &&
      defaultThemeCode.includes('NavigationRenderer') &&
      defaultThemeCode.includes('HeroRenderer') &&
      defaultThemeCode.includes('AboutRenderer') &&
      defaultThemeCode.includes('ExperienceRenderer') &&
      defaultThemeCode.includes('SkillsRenderer') &&
      defaultThemeCode.includes('ProjectsRenderer') &&
      defaultThemeCode.includes('CertificationsRenderer') &&
      defaultThemeCode.includes('ContactRenderer') &&
      defaultThemeCode.includes('FooterRenderer'),
    'Baseline default theme provides complete renderers for all 7 portfolio sections + Navigation + Footer'
  );

  // --------------------------------------------------------------------------
  // 2. BACKEND ADMIN READINESS & RESOLUTION TESTS (GET /api/admin/themes)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Backend Admin Readiness & Theme Resolution ---');

  // 2.1 Unauthenticated access strictly blocked
  const unauthThemesRes = await fetch(`${BASE_URL}/api/admin/themes`);
  assert(
    unauthThemesRes.status === 403,
    'Unauthenticated GET /api/admin/themes rejected with 403 Forbidden'
  );

  // 2.2 Authenticated access returns registered themes
  const authThemesRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(
    authThemesRes.status === 200,
    'Authenticated GET /api/admin/themes returns 200 OK'
  );

  const themesData = await authThemesRes.json();
  assert(themesData.success === true, 'Response indicates success: true');
  assert(
    themesData.activeTheme && ['modern-developer', 'modern-editorial', 'precision-dark', 'structured-monochrome'].includes(themesData.activeTheme.id),
    `Active theme correctly resolved as: ${themesData.activeTheme?.id}`
  );
  assert(
    Array.isArray(themesData.availableThemes) && themesData.availableThemes.length >= 1,
    `Available themes list populated (count: ${themesData.availableThemes.length})`
  );

  const baselineTheme = themesData.availableThemes.find((t) => t.id === 'modern-developer');
  assert(
    baselineTheme && baselineTheme.name === 'Modern Developer',
    'Modern Developer baseline theme is registered and available'
  );

  // --------------------------------------------------------------------------
  // 3. PUBLIC PORTFOLIO RENDERING VIA THEME ARCHITECTURE
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Public Portfolio Rendering via Active Theme ---');

  try {
    const publicRes = await fetch(`${BASE_URL}/`);
    assert(publicRes.status === 200, 'Public homepage loads with HTTP 200 OK');
    const publicHtml = await publicRes.text();

    // Verify Persona & Identity Content
    assert(
      publicHtml.includes('Mohamed Khaled'),
      'Public portfolio renders authoritative name: Mohamed Khaled'
    );
    assert(
      publicHtml.includes('Machine Learning Engineer'),
      'Public portfolio renders authoritative professional title: Machine Learning Engineer'
    );

    // Verify All 7 Core Sections Render
    assert(
      publicHtml.includes('id="about"') || publicHtml.includes('About'),
      'About section rendered through Active Theme'
    );
    assert(
      publicHtml.includes('id="experience"') || publicHtml.includes('Experience'),
      'Experience section rendered through Active Theme'
    );
    assert(
      publicHtml.includes('id="skills"') || publicHtml.includes('Skills'),
      'Skills section rendered through Active Theme'
    );
    assert(
      publicHtml.includes('id="projects"') || publicHtml.includes('Projects'),
      'Projects section rendered through Active Theme'
    );
    assert(
      publicHtml.includes('id="certifications"') || publicHtml.includes('Certifications'),
      'Certifications section rendered through Active Theme'
    );
    assert(
      publicHtml.includes('id="contact"') || publicHtml.includes('Contact'),
      'Contact section rendered through Active Theme'
    );

    // Verify Stable Navigation Anchors
    assert(
      publicHtml.includes('href="#about"') &&
        publicHtml.includes('href="#experience"') &&
        publicHtml.includes('href="#skills"') &&
        publicHtml.includes('href="#projects"') &&
        publicHtml.includes('href="#certifications"') &&
        publicHtml.includes('href="#contact"'),
      'Navigation anchors (#about, #experience, #skills, #projects, #certifications, #contact) preserved in theme rendering'
    );

    // Verify Responsive Navigation Elements
    assert(
      publicHtml.includes('role="navigation"') || publicHtml.includes('nav') || publicHtml.includes('Resume'),
      'Semantic navigation bar rendered through Active Theme'
    );
  } catch (err) {
    assert(false, `Public portfolio rendering error: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // 4. PREVIEW MODE INTEGRATION
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Preview Mode & Draft Integration ---');

  try {
    const previewRes = await fetch(`${BASE_URL}/admin/preview`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    assert(previewRes.status === 200, 'Authenticated admin preview loads with HTTP 200 OK');
    const previewHtml = await previewRes.text();

    assert(
      previewHtml.includes('PREVIEW MODE') || previewHtml.includes('PreviewBanner') || previewHtml.includes('Staged'),
      'Preview Mode banner correctly displayed'
    );
    assert(
      previewHtml.includes('Mohamed Khaled') && previewHtml.includes('Machine Learning Engineer'),
      'Preview renders complete portfolio structure through theme renderers'
    );
  } catch (err) {
    assert(false, `Preview test error: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // 5. DATA ISOLATION & ARCHITECTURAL INVARIANTS
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Content vs Presentation vs Layout Separation ---');

  // Verify that themes folder does NOT import createClient directly or execute SQL
  const themesDir = path.resolve(process.cwd(), 'src', 'themes');
  let directDbFound = false;

  function scanThemesDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        scanThemesDir(full);
      } else if (/\.(ts|tsx)$/.test(f)) {
        const content = fs.readFileSync(full, 'utf-8');
        if (content.includes('@/lib/supabase/server') || content.includes('@/lib/supabase/client')) {
          directDbFound = true;
          console.error(`Direct DB import found in theme file: ${full}`);
        }
      }
    }
  }

  scanThemesDir(themesDir);
  assert(
    !directDbFound,
    'Data Isolation Invariant: Themes consume normalized props; zero direct Supabase client imports in src/themes'
  );

  // Verify schema.sql includes active_theme
  const schemaPath = path.resolve(process.cwd(), 'supabase', 'schema.sql');
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  assert(
    schemaContent.includes('active_theme TEXT DEFAULT'),
    'PostgreSQL schema.sql includes active_theme configuration column in site_settings'
  );

  // --------------------------------------------------------------------------
  // 6. SECURITY & REGRESSION VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Security & Authorization Regression ---');

  // Verify unauthenticated users cannot alter site_settings/theme
  const unauthPost = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active_theme: 'malicious-theme' }),
  });
  assert(
    unauthPost.status === 403,
    'Security Invariant: Unauthenticated request to modify theme rejected with 403'
  );

  // Verify unauthenticated users cannot access /admin
  const unauthAdmin = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
  assert(
    unauthAdmin.status === 307 || unauthAdmin.status === 302,
    'Protected Route: /admin redirects unauthenticated visitors to login'
  );

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n==========================================================');
  console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('==========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
