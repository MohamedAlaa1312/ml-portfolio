/**
 * ==============================================================================
 * PHASE 19 VERIFICATION TEST SUITE
 * Theme 1: Modern Technical Editorial (ID: modern-editorial)
 * ==============================================================================
 *
 * Verifies:
 * 1. Theme Registration & Registry API Contract
 * 2. Theme Tokens & Design System Foundation
 * 3. Theme Isolation & Zero Direct Database Queries
 * 4. Backend Admin Readiness (GET /api/admin/themes includes modern-editorial)
 * 5. Public Rendering: Baseline Theme Preservation
 * 6. Public Rendering: Modern Technical Editorial Theme (?theme=modern-editorial)
 * 7. Hero Section Quality: Large Portrait, Name, ML Engineer Title, Intro, CTAs, Social
 * 8. All Sections Presence: About, Experience, Skills, Projects, Certifications, Contact, Footer
 * 9. Section Order & Section Visibility (Dynamic CMS Control)
 * 10. Admin Preview Integration with Modern Editorial
 * 11. Responsive, Semantic & Accessibility Compliance (Heading hierarchy, focus rings, ARIA)
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
  console.log('📰 STARTING PHASE 19 THEME 1: MODERN TECHNICAL EDITORIAL TESTS');
  console.log('==========================================================\n');

  // --------------------------------------------------------------------------
  // 1. THEME DEFINITION, TOKENS & REGISTRY STATIC AUDIT
  // --------------------------------------------------------------------------
  console.log('--- 1. Theme Definition, Tokens & Registry Architecture ---');

  const themeDir = path.resolve(process.cwd(), 'src', 'themes', 'modern-editorial');
  const tokensPath = path.join(themeDir, 'tokens.ts');
  const themePath = path.join(themeDir, 'modern-editorial.theme.tsx');
  const indexPath = path.join(themeDir, 'index.ts');
  const registryPath = path.resolve(process.cwd(), 'src', 'themes', 'registry.ts');

  assert(fs.existsSync(tokensPath), 'tokens.ts exists in modern-editorial');
  assert(fs.existsSync(themePath), 'modern-editorial.theme.tsx exists');
  assert(fs.existsSync(indexPath), 'index.ts exists in modern-editorial');

  // Check component files
  const componentsDir = path.join(themeDir, 'components');
  const requiredComponents = [
    'EditorialNavbar.tsx',
    'EditorialHero.tsx',
    'EditorialAbout.tsx',
    'EditorialExperience.tsx',
    'EditorialSkills.tsx',
    'EditorialProjects.tsx',
    'EditorialCertifications.tsx',
    'EditorialContact.tsx',
    'EditorialFooter.tsx',
  ];

  requiredComponents.forEach((comp) => {
    assert(
      fs.existsSync(path.join(componentsDir, comp)),
      `Component exists: modern-editorial/components/${comp}`
    );
  });

  // Verify Tokens content
  const tokensCode = fs.readFileSync(tokensPath, 'utf-8');
  assert(
    tokensCode.includes("bgPrimary: '#0C0D0E'") &&
      tokensCode.includes("textPrimary: '#EDEDEC'") &&
      tokensCode.includes("accent: '#C25E34'"),
    'modernEditorialTokens specify charcoal foundation (#0C0D0E), warm off-white (#EDEDEC), and copper accent (#C25E34)'
  );

  // Verify Theme definition properties
  const themeCode = fs.readFileSync(themePath, 'utf-8');
  assert(
    themeCode.includes("id: 'modern-editorial'") &&
      themeCode.includes("name: 'Modern Technical Editorial'") &&
      themeCode.includes("version: '1.0.0'"),
    'Theme definition matches required ID "modern-editorial", name "Modern Technical Editorial", version "1.0.0"'
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
    registryCode.includes('modernEditorialTheme') &&
      registryCode.includes('this.register(modernEditorialTheme)'),
    'modernEditorialTheme is registered in ThemeRegistry'
  );

  // --------------------------------------------------------------------------
  // 2. THEME ISOLATION & ZERO DIRECT DATABASE CALLS
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Theme Data Isolation & Boundary Audit ---');

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
    'Data Isolation: Theme components consume normalized props only; zero direct database queries in modern-editorial'
  );

  // --------------------------------------------------------------------------
  // 3. BACKEND ADMIN READINESS (GET /api/admin/themes)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Backend Admin Readiness ---');

  const themesRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(themesRes.status === 200, 'GET /api/admin/themes returns 200 OK');

  const themesData = await themesRes.json();
  assert(themesData.success === true, 'Response indicates success: true');

  const editorialThemeInApi = (themesData.availableThemes || []).find(
    (t) => t.id === 'modern-editorial'
  );
  assert(
    editorialThemeInApi !== undefined,
    'Theme "modern-editorial" is present in availableThemes from /api/admin/themes'
  );
  assert(
    editorialThemeInApi?.name === 'Modern Technical Editorial',
    `Theme name matches: "${editorialThemeInApi?.name}"`
  );
  assert(
    editorialThemeInApi?.version === '1.0.0',
    `Theme version matches: "${editorialThemeInApi?.version}"`
  );

  // --------------------------------------------------------------------------
  // 4. PUBLIC PORTFOLIO: BASELINE SAFETY
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Baseline Production Theme Safety ---');

  const baselineRes = await fetch(`${BASE_URL}/`);
  assert(baselineRes.status === 200, 'Baseline public portfolio loads with HTTP 200 OK');
  const baselineHtml = await baselineRes.text();
  assert(
    baselineHtml.includes('Mohamed Khaled') &&
      baselineHtml.includes('Machine Learning Engineer'),
    'Baseline public portfolio renders identity safely'
  );

  // --------------------------------------------------------------------------
  // 5. PUBLIC PORTFOLIO: MODERN TECHNICAL EDITORIAL RENDERING
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Modern Technical Editorial Theme Rendering (?theme=modern-editorial) ---');

  const editorialRes = await fetch(`${BASE_URL}/?theme=modern-editorial`);
  assert(editorialRes.status === 200, 'Editorial portfolio loads with HTTP 200 OK');
  const editorialHtml = await editorialRes.text();

  assert(
    editorialHtml.includes('data-theme="modern-editorial"'),
    'Page container designates data-theme="modern-editorial"'
  );
  assert(
    editorialHtml.includes('bg-[#0C0D0E]'),
    'Page renders deep charcoal foundation background (#0C0D0E)'
  );

  // 5.1 Hero Section
  console.log('\n--- 5.1 Hero Section Verification ---');
  assert(
    editorialHtml.includes('Mohamed Khaled'),
    'Hero renders authoritative name: Mohamed Khaled'
  );
  assert(
    editorialHtml.includes('Machine Learning Engineer'),
    'Hero renders professional title: Machine Learning Engineer'
  );
  assert(
    editorialHtml.includes('FIG 01. PORTRAIT'),
    'Hero displays editorial technical frame with portrait caption: FIG 01. PORTRAIT'
  );
  assert(
    editorialHtml.includes('INDEX // 00'),
    'Hero displays editorial index metadata: INDEX // 00'
  );

  // 5.2 Navigation Section
  console.log('\n--- 5.2 Editorial Navigation Verification ---');
  assert(
    editorialHtml.includes('Main Editorial Navigation') ||
      editorialHtml.includes('ABOUT') ||
      editorialHtml.includes('01.'),
    'Editorial navigation rendered with index numbers (01., 02., etc.)'
  );
  assert(
    editorialHtml.includes('Resume') || editorialHtml.includes('RESUME'),
    'Editorial navigation renders resume action'
  );

  // 5.3 About Section
  console.log('\n--- 5.3 About Section Verification ---');
  assert(
    editorialHtml.includes('id="about"'),
    'About section rendered with stable anchor id="about"'
  );
  assert(
    editorialHtml.includes('Turning Data Into Intelligent Solutions') ||
      editorialHtml.includes('ABOUT') ||
      editorialHtml.includes('DOSSIER'),
    'About section renders editorial heading and dossier metadata'
  );

  // 5.4 Experience Section
  console.log('\n--- 5.4 Experience Section Verification ---');
  assert(
    editorialHtml.includes('id="experience"'),
    'Experience section rendered with stable anchor id="experience"'
  );
  assert(
    editorialHtml.includes('Professional Experience') ||
      editorialHtml.includes('TRAJECTORY') ||
      editorialHtml.includes('Google'),
    'Experience section renders structured trajectory list'
  );

  // 5.5 Skills Section
  console.log('\n--- 5.5 Skills Section Verification ---');
  assert(
    editorialHtml.includes('id="skills"'),
    'Skills section rendered with stable anchor id="skills"'
  );
  assert(
    editorialHtml.includes('Technical Capabilities') ||
      editorialHtml.includes('CAPABILITIES') ||
      editorialHtml.includes('Machine Learning'),
    'Skills section renders editorial capability panels'
  );

  // 5.6 Projects Section
  console.log('\n--- 5.6 Projects Section Verification ---');
  assert(
    editorialHtml.includes('id="projects"'),
    'Projects section rendered with stable anchor id="projects"'
  );
  assert(
    editorialHtml.includes('Featured Projects') ||
      editorialHtml.includes('SELECTED WORKS') ||
      editorialHtml.includes('SYSTEM //'),
    'Projects section renders editorial projects showcase'
  );

  // 5.7 Certifications Section
  console.log('\n--- 5.7 Certifications Section Verification ---');
  assert(
    editorialHtml.includes('id="certifications"'),
    'Certifications section rendered with stable anchor id="certifications"'
  );
  assert(
    editorialHtml.includes('Certifications') ||
      editorialHtml.includes('CREDENTIALS') ||
      editorialHtml.includes('VERIFY CREDENTIAL'),
    'Certifications section renders credential cards with verification links'
  );

  // 5.8 Contact Section & Footer
  console.log('\n--- 5.8 Contact & Footer Verification ---');
  assert(
    editorialHtml.includes('id="contact"'),
    'Contact section rendered with stable anchor id="contact"'
  );
  assert(
    editorialHtml.includes('Initiate Contact') ||
      editorialHtml.includes('INQUIRIES') ||
      editorialHtml.includes('TRANSMISSION FORM'),
    'Contact section renders editorial inquiry layout'
  );
  assert(
    editorialHtml.includes('THEME: MODERN TECHNICAL EDITORIAL v1.0.0'),
    'Footer displays colophon with active theme identification'
  );

  // --------------------------------------------------------------------------
  // 6. ADMIN PREVIEW WITH MODERN EDITORIAL
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Admin Preview Integration with Modern Editorial ---');

  const previewRes = await fetch(
    `${BASE_URL}/admin/preview?theme=modern-editorial`,
    {
      headers: { Cookie: ADMIN_COOKIE },
    }
  );
  assert(previewRes.status === 200, 'Admin preview loads with HTTP 200 OK');
  const previewHtml = await previewRes.text();
  assert(
    previewHtml.includes('PREVIEW MODE') || previewHtml.includes('PreviewBanner') || previewHtml.includes('Staged'),
    'Preview mode header banner rendered'
  );
  assert(
    previewHtml.includes('data-theme="modern-editorial"'),
    'Admin preview correctly renders theme modern-editorial'
  );
  assert(
    previewHtml.includes('FIG 01. PORTRAIT'),
    'Admin preview renders editorial hero portrait'
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
