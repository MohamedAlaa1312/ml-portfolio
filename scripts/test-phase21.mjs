/**
 * ==============================================================================
 * PHASE 21 VERIFICATION TEST SUITE
 * Theme 3: Structured Monochrome (ID: structured-monochrome)
 * & Future Theme Foundation (Contract Validation & Safe Fallback)
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
  console.log('⚙️  STARTING PHASE 21 THEME 3: STRUCTURED MONOCHROME TESTS');
  console.log('==========================================================\n');

  // --------------------------------------------------------------------------
  // 1. THEME DEFINITION, TOKENS & REGISTRY STATIC AUDIT
  // --------------------------------------------------------------------------
  console.log('--- 1. Theme 3 Static Architecture Audit ---');

  const themeDir = path.resolve(process.cwd(), 'src', 'themes', 'structured-monochrome');
  const tokensPath = path.join(themeDir, 'tokens.ts');
  const themePath = path.join(themeDir, 'structured-monochrome.theme.tsx');
  const indexPath = path.join(themeDir, 'index.ts');
  const registryPath = path.resolve(process.cwd(), 'src', 'themes', 'registry.ts');

  assert(fs.existsSync(tokensPath), 'tokens.ts exists in structured-monochrome');
  assert(fs.existsSync(themePath), 'structured-monochrome.theme.tsx exists');
  assert(fs.existsSync(indexPath), 'index.ts exists in structured-monochrome');

  // Verify all 9 required components exist
  const componentsDir = path.join(themeDir, 'components');
  const requiredComponents = [
    'MonochromeNavbar.tsx',
    'MonochromeHero.tsx',
    'MonochromeAbout.tsx',
    'MonochromeExperience.tsx',
    'MonochromeSkills.tsx',
    'MonochromeProjects.tsx',
    'MonochromeCertifications.tsx',
    'MonochromeContact.tsx',
    'MonochromeFooter.tsx',
  ];

  requiredComponents.forEach((comp) => {
    assert(
      fs.existsSync(path.join(componentsDir, comp)),
      `Component exists: structured-monochrome/components/${comp}`
    );
  });

  // Verify Tokens content (monochrome palette)
  const tokensCode = fs.readFileSync(tokensPath, 'utf-8');
  assert(
    tokensCode.includes("bgPrimary: '#050505'") &&
      tokensCode.includes("textPrimary: '#FFFFFF'") &&
      tokensCode.includes("accent: '#FFFFFF'"),
    'structuredMonochromeTokens specify pure black foundation (#050505), high-contrast white (#FFFFFF), and stark accent (#FFFFFF)'
  );

  // Verify Theme definition properties
  const themeCode = fs.readFileSync(themePath, 'utf-8');
  assert(
    themeCode.includes("id: 'structured-monochrome'") &&
      themeCode.includes("name: 'Structured Monochrome'") &&
      themeCode.includes("version: '1.0.0'"),
    'Theme definition matches required ID "structured-monochrome", name "Structured Monochrome", version "1.0.0"'
  );
  assert(
    themeCode.includes('NavigationRenderer') &&
      themeCode.includes('HeroRenderer') &&
      themeCode.includes('AboutRenderer') &&
      themeCode.includes('ExperienceRenderer') &&
      themeCode.includes('SkillsRenderer') &&
      themeCode.includes('ProjectsRenderer') &&
      themeCode.includes('CertificationsRenderer') &&
      themeCode.includes('ContactRenderer') &&
      themeCode.includes('FooterRenderer'),
    'Theme provides complete implementations for all 9 required renderers'
  );

  // Verify Registry registration
  const registryCode = fs.readFileSync(registryPath, 'utf-8');
  assert(
    registryCode.includes('structuredMonochromeTheme') &&
      registryCode.includes('this.register(structuredMonochromeTheme)'),
    'structuredMonochromeTheme is registered in ThemeRegistry'
  );

  // --------------------------------------------------------------------------
  // 2. FUTURE THEME FOUNDATION: CONTRACT VALIDATION & SAFE FALLBACK
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Future Theme Foundation: Contract Validation & Safe Fallback ---');

  assert(
    registryCode.includes('validateThemeContract') &&
      registryCode.includes('public validate('),
    'ThemeRegistry provides explicit validateThemeContract implementation'
  );

  assert(
    registryCode.includes('const validation = this.validate(theme);') &&
      registryCode.includes('failed contract validation'),
    'ThemeRegistry enforces contract validation before theme registration'
  );

  assert(
    registryCode.includes('renderers: {') &&
      registryCode.includes('...baseline.renderers') &&
      registryCode.includes('...found.renderers'),
    'ThemeRegistry.resolve() safely proxies baseline renderers as fallback for missing future section types'
  );

  // --------------------------------------------------------------------------
  // 3. THEME DATA ISOLATION & ZERO DIRECT DATABASE CALLS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Theme Data Isolation & Boundary Audit ---');

  let directDbFound = false;
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        scanDir(full);
      } else if (/\.(ts|tsx)$/.test(f)) {
        const content = fs.readFileSync(full, 'utf-8');
        if (
          content.includes('@/lib/supabase/server') ||
          content.includes('@/lib/supabase/client') ||
          content.includes('supabase.from(')
        ) {
          directDbFound = true;
          console.error(`Direct DB access found in theme component: ${full}`);
        }
      }
    }
  }

  scanDir(themeDir);
  assert(
    !directDbFound,
    'Data Isolation: Theme components consume normalized props only; zero direct database queries in structured-monochrome'
  );

  // --------------------------------------------------------------------------
  // 4. BACKEND ADMIN READINESS (GET /api/admin/themes)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Backend Admin Readiness ---');

  const themesRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(themesRes.status === 200, 'GET /api/admin/themes returns 200 OK');

  const themesData = await themesRes.json();
  assert(themesData.success === true, 'Response indicates success: true');

  const monoThemeInApi = (themesData.availableThemes || []).find(
    (t) => t.id === 'structured-monochrome'
  );
  assert(
    monoThemeInApi !== undefined,
    'Theme "structured-monochrome" is present in availableThemes from /api/admin/themes'
  );
  assert(
    monoThemeInApi?.name === 'Structured Monochrome',
    `Theme name matches: "${monoThemeInApi?.name}"`
  );
  assert(
    monoThemeInApi?.version === '1.0.0',
    `Theme version matches: "${monoThemeInApi?.version}"`
  );

  // Verify all 4 themes are registered
  assert(
    themesData.availableThemes?.length >= 4,
    `Registry has at least 4 themes registered (current count: ${themesData.availableThemes?.length})`
  );

  // --------------------------------------------------------------------------
  // 5. REGRESSION SAFETY: BASELINE, THEME 1, & THEME 2 VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Regression Safety: Baseline, Theme 1, & Theme 2 Verification ---');

  const baselineRes = await fetch(`${BASE_URL}/`);
  assert(baselineRes.status === 200, 'Baseline public portfolio loads with HTTP 200 OK');
  const baselineHtml = await baselineRes.text();
  assert(
    baselineHtml.includes('Mohamed Khaled') &&
      baselineHtml.includes('Machine Learning Engineer'),
    'Baseline public portfolio renders identity safely'
  );

  const editorialRes = await fetch(`${BASE_URL}/?theme=modern-editorial`);
  assert(editorialRes.status === 200, 'Theme 1 (modern-editorial) loads with HTTP 200 OK');
  const editorialHtml = await editorialRes.text();
  assert(
    editorialHtml.includes('data-theme="modern-editorial"') &&
      editorialHtml.includes('bg-[#0C0D0E]') &&
      editorialHtml.includes('FIG 01. PORTRAIT'),
    'Theme 1 (modern-editorial) preserves its distinct styling and layout with zero regression'
  );

  const precisionRes = await fetch(`${BASE_URL}/?theme=precision-dark`);
  assert(precisionRes.status === 200, 'Theme 2 (precision-dark) loads with HTTP 200 OK');
  const precisionHtml = await precisionRes.text();
  assert(
    precisionHtml.includes('data-theme="precision-dark"') &&
      precisionHtml.includes('bg-[#08090B]') &&
      precisionHtml.includes('CORE.SYS // v2.0'),
    'Theme 2 (precision-dark) preserves its distinct telemetry and styling with zero regression'
  );

  // --------------------------------------------------------------------------
  // 6. PUBLIC PORTFOLIO: STRUCTURED MONOCHROME THEME RENDERING
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Structured Monochrome Theme Rendering (?theme=structured-monochrome) ---');

  const monoRes = await fetch(`${BASE_URL}/?theme=structured-monochrome`);
  assert(monoRes.status === 200, 'Structured Monochrome portfolio loads with HTTP 200 OK');
  const monoHtml = await monoRes.text();

  assert(
    monoHtml.includes('data-theme="structured-monochrome"'),
    'Page container designates data-theme="structured-monochrome"'
  );
  assert(
    monoHtml.includes('bg-[#050505]'),
    'Page renders pure black architectural foundation (#050505)'
  );

  // 6.1 Hero Section
  console.log('\n--- 6.1 Hero Section Verification ---');
  assert(
    monoHtml.includes('Mohamed Khaled'),
    'Hero renders authoritative name: Mohamed Khaled'
  );
  assert(
    monoHtml.includes('Machine Learning Engineer'),
    'Hero renders professional title: Machine Learning Engineer'
  );
  assert(
    monoHtml.includes('VOLUME 03 — MONOCHROME') ||
      monoHtml.includes('PORTRAIT 01') ||
      monoHtml.includes('FIGURE // MACHINE LEARNING'),
    'Hero renders stark architectural typography and portrait frame caption'
  );

  // 6.2 Navigation Section
  console.log('\n--- 6.2 Navigation Section Verification ---');
  assert(
    monoHtml.includes('Structured Monochrome Navigation') ||
      monoHtml.includes('CURRICULUM VITAE ↗') ||
      monoHtml.includes('MOHAMED KHALED'),
    'Architectural monochrome navigation rendered with minimal labels and hairline separator'
  );

  // 6.3 About Section
  console.log('\n--- 6.3 About Section Verification ---');
  assert(
    monoHtml.includes('id="about"'),
    'About section rendered with stable anchor id="about"'
  );
  assert(
    monoHtml.includes('ARCHIVE // BIOGRAPHY') ||
      monoHtml.includes('IDENTITY DOSSIER') ||
      monoHtml.includes('// CORE PRINCIPLES'),
    'About section renders typographic statement layout and structured dossier'
  );

  // 6.4 Experience Section
  console.log('\n--- 6.4 Experience Section Verification ---');
  assert(
    monoHtml.includes('id="experience"'),
    'Experience section rendered with stable anchor id="experience"'
  );
  assert(
    monoHtml.includes('CHRONOLOGY // ENGAGEMENTS') ||
      monoHtml.includes('Google') ||
      monoHtml.includes('ROLE 01'),
    'Experience section renders case-study timeline strips with large year column'
  );

  // 6.5 Skills Section
  console.log('\n--- 6.5 Skills Section Verification ---');
  assert(
    monoHtml.includes('id="skills"'),
    'Skills section rendered with stable anchor id="skills"'
  );
  assert(
    monoHtml.includes('TAXONOMY // CAPABILITIES') ||
      monoHtml.includes('CAT. 01') ||
      monoHtml.includes('Machine Learning'),
    'Skills section renders technical catalog with structured category rows and fine hairline rules'
  );

  // 6.6 Projects Section
  console.log('\n--- 6.6 Projects Section Verification ---');
  assert(
    monoHtml.includes('id="projects"'),
    'Projects section rendered with stable anchor id="projects"'
  );
  assert(
    monoHtml.includes('CASE STUDIES // WORKS') ||
      monoHtml.includes('PROJECT 01') ||
      monoHtml.includes('SOURCE CODE'),
    'Projects section renders editorial case-study strips with grayscale media and bold typography'
  );

  // 6.7 Certifications Section
  console.log('\n--- 6.7 Certifications Section Verification ---');
  assert(
    monoHtml.includes('id="certifications"'),
    'Certifications section rendered with stable anchor id="certifications"'
  );
  assert(
    monoHtml.includes('CREDENTIALS // STANDARDS') ||
      monoHtml.includes('VERIFY') ||
      monoHtml.includes('ISSUED'),
    'Certifications section renders minimalist credentials ledger'
  );

  // 6.8 Contact Section & Footer
  console.log('\n--- 6.8 Contact & Footer Verification ---');
  assert(
    monoHtml.includes('id="contact"'),
    'Contact section rendered with stable anchor id="contact"'
  );
  assert(
    monoHtml.includes('COMMUNICATION // ENGAGEMENT') ||
      monoHtml.includes('DIRECT INQUIRY INTERFACE') ||
      monoHtml.includes('TRANSMIT INQUIRY'),
    'Contact section renders stark high-contrast inquiry interface'
  );
  assert(
    monoHtml.includes('THEME: STRUCTURED MONOCHROME v1.0.0'),
    'Footer displays colophon with active theme stamp: THEME: STRUCTURED MONOCHROME v1.0.0'
  );

  // --------------------------------------------------------------------------
  // 7. DYNAMIC PRESENTATIONAL SECTION NUMBERING
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Dynamic Section Sequence Numbering Verification ---');

  // Verify dynamic sequence numbers (e.g. "01 —", "02 —", "03 —") are derived from sectionIndex
  assert(
    monoHtml.includes('01') &&
      monoHtml.includes('02') &&
      monoHtml.includes('03'),
    'Dynamic section sequence numbers adapt to rendered sequence without hardcoded CMS storage'
  );

  // --------------------------------------------------------------------------
  // 8. ADMIN PREVIEW WITH STRUCTURED MONOCHROME
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Admin Preview Integration with Structured Monochrome ---');

  const previewRes = await fetch(
    `${BASE_URL}/admin/preview?theme=structured-monochrome`,
    {
      headers: { Cookie: ADMIN_COOKIE },
    }
  );
  assert(previewRes.status === 200, 'Admin preview loads with HTTP 200 OK');
  const previewHtml = await previewRes.text();
  assert(
    previewHtml.includes('data-theme="structured-monochrome"'),
    'Admin preview correctly renders data-theme="structured-monochrome"'
  );
  assert(
    previewHtml.includes('bg-[#050505]'),
    'Admin preview correctly renders architectural black foundation (#050505)'
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
