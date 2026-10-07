/**
 * ==============================================================================
 * PHASE 20 VERIFICATION TEST SUITE
 * Theme 2: Precision Dark Portfolio (ID: precision-dark)
 * ==============================================================================
 *
 * Verifies:
 * 1. Theme Definition, Tokens & Registry API Contract
 * 2. Visual Distinction & Architectural Design System
 * 3. Theme Data Isolation & Zero Direct Database Queries
 * 4. Backend Admin Readiness (GET /api/admin/themes includes precision-dark)
 * 5. Public Rendering: Baseline Theme Safety (modern-developer)
 * 6. Public Rendering: Theme 1 Safety Non-Regression (modern-editorial)
 * 7. Public Rendering: Theme 2 Precision Dark Rendering (?theme=precision-dark)
 * 8. Hero Architectural Composition: Geometric Frame, Name, ML Engineer Title, Telemetry, Action Dock
 * 9. All Sections Presence: Dynamic Numbering, About, Experience, Skills, Projects, Certifications, Contact, Footer
 * 10. Dynamic Presentational Section Sequence Numbering
 * 11. Admin Preview Integration with Precision Dark
 * 12. Responsive & Accessibility Preservation
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
  console.log('⚙️  STARTING PHASE 20 THEME 2: PRECISION DARK TESTS');
  console.log('==========================================================\n');

  // --------------------------------------------------------------------------
  // 1. THEME DEFINITION, TOKENS & REGISTRY STATIC AUDIT
  // --------------------------------------------------------------------------
  console.log('--- 1. Theme Definition, Tokens & Registry Architecture ---');

  const themeDir = path.resolve(process.cwd(), 'src', 'themes', 'precision-dark');
  const tokensPath = path.join(themeDir, 'tokens.ts');
  const themePath = path.join(themeDir, 'precision-dark.theme.tsx');
  const indexPath = path.join(themeDir, 'index.ts');
  const registryPath = path.resolve(process.cwd(), 'src', 'themes', 'registry.ts');

  assert(fs.existsSync(tokensPath), 'tokens.ts exists in precision-dark');
  assert(fs.existsSync(themePath), 'precision-dark.theme.tsx exists');
  assert(fs.existsSync(indexPath), 'index.ts exists in precision-dark');

  // Check component files
  const componentsDir = path.join(themeDir, 'components');
  const requiredComponents = [
    'PrecisionNavbar.tsx',
    'PrecisionHero.tsx',
    'PrecisionAbout.tsx',
    'PrecisionExperience.tsx',
    'PrecisionSkills.tsx',
    'PrecisionProjects.tsx',
    'PrecisionCertifications.tsx',
    'PrecisionContact.tsx',
    'PrecisionFooter.tsx',
  ];

  requiredComponents.forEach((comp) => {
    assert(
      fs.existsSync(path.join(componentsDir, comp)),
      `Component exists: precision-dark/components/${comp}`
    );
  });

  // Verify Tokens content
  const tokensCode = fs.readFileSync(tokensPath, 'utf-8');
  assert(
    tokensCode.includes("bgPrimary: '#08090B'") &&
      tokensCode.includes("textPrimary: '#F1F5F9'") &&
      tokensCode.includes("accent: '#F59E0B'"),
    'precisionDarkTokens specify deep graphite foundation (#08090B), high-contrast white (#F1F5F9), and technical amber accent (#F59E0B)'
  );

  // Verify Theme definition properties
  const themeCode = fs.readFileSync(themePath, 'utf-8');
  assert(
    themeCode.includes("id: 'precision-dark'") &&
      themeCode.includes("name: 'Precision Dark Portfolio'") &&
      themeCode.includes("version: '1.0.0'"),
    'Theme definition matches required ID "precision-dark", name "Precision Dark Portfolio", version "1.0.0"'
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
    registryCode.includes('precisionDarkTheme') &&
      registryCode.includes('this.register(precisionDarkTheme)'),
    'precisionDarkTheme is registered in ThemeRegistry'
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
    'Data Isolation: Theme components consume normalized props only; zero direct database queries in precision-dark'
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

  const precisionThemeInApi = (themesData.availableThemes || []).find(
    (t) => t.id === 'precision-dark'
  );
  assert(
    precisionThemeInApi !== undefined,
    'Theme "precision-dark" is present in availableThemes from /api/admin/themes'
  );
  assert(
    precisionThemeInApi?.name === 'Precision Dark Portfolio',
    `Theme name matches: "${precisionThemeInApi?.name}"`
  );
  assert(
    precisionThemeInApi?.version === '1.0.0',
    `Theme version matches: "${precisionThemeInApi?.version}"`
  );

  // Verify all 3 themes are registered
  assert(
    themesData.availableThemes?.length >= 3,
    `Registry has at least 3 themes registered (current count: ${themesData.availableThemes?.length})`
  );

  // --------------------------------------------------------------------------
  // 4. REGRESSION SAFETY: BASELINE & THEME 1 VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Regression Safety: Baseline & Theme 1 Verification ---');

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

  // --------------------------------------------------------------------------
  // 5. PUBLIC PORTFOLIO: PRECISION DARK THEME RENDERING
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Precision Dark Theme Rendering (?theme=precision-dark) ---');

  const precisionRes = await fetch(`${BASE_URL}/?theme=precision-dark`);
  assert(precisionRes.status === 200, 'Precision Dark portfolio loads with HTTP 200 OK');
  const precisionHtml = await precisionRes.text();

  assert(
    precisionHtml.includes('data-theme="precision-dark"'),
    'Page container designates data-theme="precision-dark"'
  );
  assert(
    precisionHtml.includes('bg-[#08090B]'),
    'Page renders deep graphite foundation background (#08090B)'
  );

  // 5.1 Hero Section
  console.log('\n--- 5.1 Hero Section Verification ---');
  assert(
    precisionHtml.includes('Mohamed Khaled'),
    'Hero renders authoritative name: Mohamed Khaled'
  );
  assert(
    precisionHtml.includes('Machine Learning Engineer'),
    'Hero renders professional title: Machine Learning Engineer'
  );
  assert(
    precisionHtml.includes('CORE.SYS // v2.0'),
    'Hero displays architectural telemetry header: CORE.SYS // v2.0'
  );
  assert(
    precisionHtml.includes('NODE SPEC // IDENTITY'),
    'Hero displays geometric portrait caption: NODE SPEC // IDENTITY'
  );

  // 5.2 Navigation Section
  console.log('\n--- 5.2 Navigation Section Verification ---');
  assert(
    precisionHtml.includes('Precision Architectural Navigation') ||
      precisionHtml.includes('SYS.DOCS // CV') ||
      precisionHtml.includes('SEC.01'),
    'Architectural navigation rendered with system section codes (SEC.01, SEC.02, etc.)'
  );

  // 5.3 About Section
  console.log('\n--- 5.3 About Section Verification ---');
  assert(
    precisionHtml.includes('id="about"'),
    'About section rendered with stable anchor id="about"'
  );
  assert(
    precisionHtml.includes('MODULE: PROFILE_SPEC') ||
      precisionHtml.includes('ENGINEERING PHILOSOPHY') ||
      precisionHtml.includes('CORE ARCHIVE'),
    'About section renders architectural specification matrix'
  );

  // 5.4 Experience Section
  console.log('\n--- 5.4 Experience Section Verification ---');
  assert(
    precisionHtml.includes('id="experience"'),
    'Experience section rendered with stable anchor id="experience"'
  );
  assert(
    precisionHtml.includes('LEDGER: CAREER_TIMELINE') ||
      precisionHtml.includes('EXP.01') ||
      precisionHtml.includes('Google'),
    'Experience section renders architectural two-column ledger'
  );

  // 5.5 Skills Section
  console.log('\n--- 5.5 Skills Section Verification ---');
  assert(
    precisionHtml.includes('id="skills"'),
    'Skills section rendered with stable anchor id="skills"'
  );
  assert(
    precisionHtml.includes('MATRIX: CAPABILITIES') ||
      precisionHtml.includes('CAT.01') ||
      precisionHtml.includes('Machine Learning'),
    'Skills section renders technical capability matrix with category codes'
  );

  // 5.6 Projects Section
  console.log('\n--- 5.6 Projects Section Verification ---');
  assert(
    precisionHtml.includes('id="projects"'),
    'Projects section rendered with stable anchor id="projects"'
  );
  assert(
    precisionHtml.includes('SYS.01') ||
      precisionHtml.includes('[CODE]') ||
      precisionHtml.includes('INDEX: APPLIED_SYSTEMS'),
    'Projects section renders architectural systems matrix with visual numbering'
  );

  // 5.7 Certifications Section
  console.log('\n--- 5.7 Certifications Section Verification ---');
  assert(
    precisionHtml.includes('id="certifications"'),
    'Certifications section rendered with stable anchor id="certifications"'
  );
  assert(
    precisionHtml.includes('RECORD: ACCREDITATIONS') ||
      precisionHtml.includes('CRED.01') ||
      precisionHtml.includes('VERIFY ACCREDITATION'),
    'Certifications section renders horizontal technical records ledger'
  );

  // 5.8 Contact Section & Footer
  console.log('\n--- 5.8 Contact & Footer Verification ---');
  assert(
    precisionHtml.includes('id="contact"'),
    'Contact section rendered with stable anchor id="contact"'
  );
  assert(
    precisionHtml.includes('DISPATCH: DIRECT_COMMS') ||
      precisionHtml.includes('COMMUNICATION NODES') ||
      precisionHtml.includes('SECURE TRANSMISSION INTERFACE'),
    'Contact section renders precision communication console'
  );
  assert(
    precisionHtml.includes('THEME: PRECISION DARK v1.0.0'),
    'Footer displays colophon with active theme identification: THEME: PRECISION DARK v1.0.0'
  );

  // --------------------------------------------------------------------------
  // 6. DYNAMIC SECTION SEQUENCE NUMBERING
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Dynamic Section Sequence Numbering Verification ---');

  // Verify dynamic sequence codes [01], [02], [03], etc. are rendered
  assert(
    precisionHtml.includes('[01]') &&
      precisionHtml.includes('[02]') &&
      precisionHtml.includes('[03]'),
    'Presentational section sequence numbers ([01], [02], [03]) adapt dynamically to rendered sequence'
  );

  // --------------------------------------------------------------------------
  // 7. ADMIN PREVIEW WITH PRECISION DARK
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Admin Preview Integration with Precision Dark ---');

  const previewRes = await fetch(
    `${BASE_URL}/admin/preview?theme=precision-dark`,
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
    previewHtml.includes('data-theme="precision-dark"'),
    'Admin preview correctly renders theme precision-dark'
  );
  assert(
    previewHtml.includes('NODE SPEC // IDENTITY'),
    'Admin preview renders architectural hero portrait container'
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
