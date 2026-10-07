/**
 * ==============================================================================
 * PHASE 22 VERIFICATION TEST SUITE
 * Admin Themes CMS (/admin/themes) & Presentation Lifecycle Management
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
  console.log('🎨 STARTING PHASE 22: ADMIN THEMES CMS VERIFICATION');
  console.log('==========================================================\n');

  // --------------------------------------------------------------------------
  // 1. STATIC CODE ARCHITECTURE & SIDEBAR AUDIT
  // --------------------------------------------------------------------------
  console.log('--- 1. Static Architecture & Sidebar Audit ---');

  const themesPagePath = path.resolve(process.cwd(), 'src', 'app', 'admin', 'themes', 'page.tsx');
  const themesManagerPath = path.resolve(process.cwd(), 'src', 'components', 'admin', 'themes', 'ThemesManager.tsx');
  const sidebarPath = path.resolve(process.cwd(), 'src', 'components', 'admin', 'AdminSidebar.tsx');
  const apiRoutePath = path.resolve(process.cwd(), 'src', 'app', 'api', 'admin', 'themes', 'route.ts');

  assert(fs.existsSync(themesPagePath), '/admin/themes/page.tsx route exists');
  assert(fs.existsSync(themesManagerPath), 'ThemesManager.tsx component exists');
  assert(fs.existsSync(apiRoutePath), '/api/admin/themes/route.ts endpoint exists');

  // Verify Sidebar contains Themes
  const sidebarCode = fs.readFileSync(sidebarPath, 'utf-8');
  assert(
    sidebarCode.includes("label: 'Themes'") &&
      sidebarCode.includes("href: '/admin/themes'") &&
      sidebarCode.includes("isImplemented: true"),
    'AdminSidebar includes Themes navigation link (/admin/themes)'
  );

  // Verify AuthServerService enforcement
  const pageCode = fs.readFileSync(themesPagePath, 'utf-8');
  assert(
    pageCode.includes('AuthServerService.isAdmin()') &&
      pageCode.includes("redirect('/admin/login?error=unauthorized')"),
    'AdminThemesPage strictly enforces server-side AuthServerService.isAdmin()'
  );

  // --------------------------------------------------------------------------
  // 2. SECURITY & ACCESS CONTROL
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Security & Access Control Enforcement ---');

  // 2.1 Unauthorized GET /api/admin/themes
  const unauthGetRes = await fetch(`${BASE_URL}/api/admin/themes`);
  assert(
    unauthGetRes.status === 403,
    'Unauthenticated GET /api/admin/themes returns 403 Forbidden'
  );

  // 2.2 Unauthorized POST /api/admin/themes
  const unauthPostRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save_draft', themeId: 'precision-dark' }),
  });
  assert(
    unauthPostRes.status === 403,
    'Unauthenticated POST /api/admin/themes returns 403 Forbidden'
  );

  // 2.3 Unauthorized sub-routes
  const unauthDraftRes = await fetch(`${BASE_URL}/api/admin/themes/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ themeId: 'precision-dark' }),
  });
  assert(unauthDraftRes.status === 403, 'Unauthenticated POST /api/admin/themes/draft returns 403');

  const unauthPublishRes = await fetch(`${BASE_URL}/api/admin/themes/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ themeId: 'precision-dark' }),
  });
  assert(unauthPublishRes.status === 403, 'Unauthenticated POST /api/admin/themes/publish returns 403');

  // --------------------------------------------------------------------------
  // 3. AUTHORIZED THEME LISTING & CONTRACT VALIDATION
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Authorized Theme Listing & Contract Validation ---');

  const themesRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(themesRes.status === 200, 'Authorized GET /api/admin/themes returns 200 OK');

  const themesData = await themesRes.json();
  assert(themesData.success === true, 'Response indicates success: true');
  assert(Boolean(themesData.activeTheme?.id), `Active theme is identified: "${themesData.activeTheme?.name}" (${themesData.activeTheme?.id})`);

  const available = themesData.availableThemes || [];
  assert(available.length >= 4, `At least 4 themes are registered (found: ${available.length})`);

  const editorialTheme = available.find((t) => t.id === 'modern-editorial');
  const precisionTheme = available.find((t) => t.id === 'precision-dark');
  const monochromeTheme = available.find((t) => t.id === 'structured-monochrome');

  assert(editorialTheme !== undefined, 'Theme "modern-editorial" is present in availableThemes');
  assert(precisionTheme !== undefined, 'Theme "precision-dark" is present in availableThemes');
  assert(monochromeTheme !== undefined, 'Theme "structured-monochrome" is present in availableThemes');

  assert(editorialTheme?.isValid === true, 'Theme "modern-editorial" passes contract validation');
  assert(precisionTheme?.isValid === true, 'Theme "precision-dark" passes contract validation');
  assert(monochromeTheme?.isValid === true, 'Theme "structured-monochrome" passes contract validation');

  // --------------------------------------------------------------------------
  // 4. THEME SELECTION & DRAFT WORKFLOW
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Theme Selection & Draft Staging ---');

  // Capture original active theme to restore later
  const originalActiveId = themesData.activeTheme.id;
  const testCandidateId = originalActiveId === 'precision-dark' ? 'structured-monochrome' : 'precision-dark';

  // 4.1 Save Draft
  const saveDraftRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'save_draft', themeId: testCandidateId }),
  });
  assert(saveDraftRes.status === 200, `POST save_draft for "${testCandidateId}" returns 200 OK`);
  const saveDraftData = await saveDraftRes.json();
  assert(saveDraftData.success === true, 'Draft saved successfully');
  assert(saveDraftData.draftTheme?.themeId === testCandidateId, `Staged draft themeId matches: "${testCandidateId}"`);

  // 4.2 Verify GET /api/admin/themes reflects draft state
  const draftAuditRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const draftAuditData = await draftAuditRes.json();
  assert(draftAuditData.draftTheme !== null, 'GET /api/admin/themes reports active draftTheme');
  assert(
    draftAuditData.draftTheme?.themeId === testCandidateId,
    `draftTheme.themeId matches "${testCandidateId}"`
  );
  assert(
    draftAuditData.activeTheme?.id === originalActiveId,
    `Active published theme remains unchanged: "${originalActiveId}"`
  );

  // 4.3 PUBLIC ISOLATION TEST: Public site MUST still render published theme!
  console.log('\n--- 4.3 Public Site Isolation (Draft Hidden from Public) ---');
  const publicRes = await fetch(`${BASE_URL}/`);
  assert(publicRes.status === 200, 'Public homepage loads with 200 OK');
  const publicHtml = await publicRes.text();
  assert(
    publicHtml.includes(`data-theme="${originalActiveId}"`),
    `Public visitors strictly see current published theme (data-theme="${originalActiveId}")`
  );
  assert(
    !publicHtml.includes(`data-theme="${testCandidateId}"`),
    `Public visitors do NOT see draft theme (data-theme="${testCandidateId}")`
  );

  // --------------------------------------------------------------------------
  // 5. ADMIN PREVIEW VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Admin Preview with Staged Draft Theme ---');

  const previewRes = await fetch(`${BASE_URL}/admin/preview`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(previewRes.status === 200, 'Admin preview loads with 200 OK');
  const previewHtml = await previewRes.text();
  assert(
    previewHtml.includes(`data-theme="${testCandidateId}"`),
    `Admin preview successfully resolves staged draft theme (data-theme="${testCandidateId}")`
  );
  assert(
    previewHtml.includes('Preview Mode — Unpublished Theme'),
    'Preview banner displays "Preview Mode — Unpublished Theme" indicator'
  );

  // --------------------------------------------------------------------------
  // 6. PUBLISH WORKFLOW
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Theme Publication Workflow ---');

  const publishRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'publish', themeId: testCandidateId }),
  });
  assert(publishRes.status === 200, 'POST publish returns 200 OK');
  const publishData = await publishRes.json();
  assert(publishData.success === true, 'Publish returns success: true');
  assert(publishData.activeTheme?.id === testCandidateId, `Active theme is now updated to "${testCandidateId}"`);

  // Verify GET /api/admin/themes reflects new active theme and cleared draft
  const postPublishThemesRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const postPublishThemes = await postPublishThemesRes.json();
  assert(
    postPublishThemes.activeTheme.id === testCandidateId,
    `Active theme in registry/settings is now "${testCandidateId}"`
  );
  assert(
    postPublishThemes.draftTheme === null,
    'Draft theme record was discarded upon successful publication'
  );

  // Verify Public site NOW renders newly published theme
  const updatedPublicRes = await fetch(`${BASE_URL}/`);
  const updatedPublicHtml = await updatedPublicRes.text();
  assert(
    updatedPublicHtml.includes(`data-theme="${testCandidateId}"`),
    `Live public portfolio now renders published theme (data-theme="${testCandidateId}")`
  );
  assert(
    updatedPublicHtml.includes('Mohamed Khaled') &&
      updatedPublicHtml.includes('Machine Learning Engineer'),
    'Public portfolio retains 100% of identity and content after theme publication'
  );

  // --------------------------------------------------------------------------
  // 7. DISCARD DRAFT WORKFLOW
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Discard Draft Workflow ---');

  // Stage a different theme as draft
  const secondCandidateId = testCandidateId === 'modern-editorial' ? 'structured-monochrome' : 'modern-editorial';
  await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'save_draft', themeId: secondCandidateId }),
  });

  // Verify draft exists
  const checkDraftRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const checkDraftData = await checkDraftRes.json();
  assert(checkDraftData.draftTheme?.themeId === secondCandidateId, `Draft staged for discard test: "${secondCandidateId}"`);

  // Discard draft
  const discardRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'discard' }),
  });
  assert(discardRes.status === 200, 'POST discard returns 200 OK');

  const afterDiscardRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const afterDiscardData = await afterDiscardRes.json();
  assert(afterDiscardData.draftTheme === null, 'Theme draft successfully removed after discard');
  assert(
    afterDiscardData.activeTheme.id === testCandidateId,
    `Active theme remains preserved as "${testCandidateId}"`
  );

  // Restore original theme
  if (originalActiveId !== testCandidateId) {
    await fetch(`${BASE_URL}/api/admin/themes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ action: 'publish', themeId: originalActiveId }),
    });
  }

  // --------------------------------------------------------------------------
  // 8. INVALID THEME HANDLING
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Invalid Theme Rejection ---');

  const invalidDraftRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'save_draft', themeId: 'non-existent-theme-xyz' }),
  });
  assert(invalidDraftRes.status === 400, 'Unregistered theme draft save returns 400 Bad Request');

  const invalidPublishRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'publish', themeId: 'non-existent-theme-xyz' }),
  });
  assert(invalidPublishRes.status === 400, 'Unregistered theme publication returns 400 Bad Request');

  // --------------------------------------------------------------------------
  // 9. DASHBOARD INTEGRATION
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Dashboard Integration ---');

  const dashboardRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(dashboardRes.status === 200, 'GET /admin/dashboard loads with 200 OK');
  const dashboardHtml = await dashboardRes.text();
  assert(
    dashboardHtml.includes('Presentation Theme') &&
      dashboardHtml.includes('/admin/themes'),
    'Dashboard renders Presentation Theme status card with link to /admin/themes'
  );

  // --------------------------------------------------------------------------
  // 10. ADMIN THEMES PAGE RENDERING
  // --------------------------------------------------------------------------
  console.log('\n--- 10. Admin Themes Page UI Rendering ---');

  const adminThemesPageRes = await fetch(`${BASE_URL}/admin/themes`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(adminThemesPageRes.status === 200, 'GET /admin/themes loads with 200 OK');
  const adminThemesPageHtml = await adminThemesPageRes.text();
  assert(
    adminThemesPageHtml.includes('Current Public Theme') &&
      adminThemesPageHtml.includes('Modern Technical Editorial') &&
      adminThemesPageHtml.includes('Precision Dark Portfolio') &&
      adminThemesPageHtml.includes('Structured Monochrome'),
    'Admin themes management page renders all available themes and current public theme cockpit'
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
