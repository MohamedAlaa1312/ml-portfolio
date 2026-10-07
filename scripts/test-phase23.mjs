/**
 * ==============================================================================
 * PHASE 23 VERIFICATION TEST SUITE
 * Theme Integration & Publishing Lifecycle
 * 
 * Tests:
 * 1. Static Architecture & Documentation Audit
 * 2. Security & Server-Side Access Control (Phase 17 model)
 * 3. Theme Switch Test (Theme 1 -> Theme 2)
 * 4. Reverse Switch Test (Theme 2 -> Theme 3 -> Theme 1)
 * 5. Discard Workflow Test
 * 6. Invalid Theme Rejection & Safe Fallback
 * 7. Draft Content & Theme Independence (Staged project draft untouched on theme publish)
 * 8. Section Order & Section Visibility Invariance
 * 9. Media Asset & SEO Stability
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
  console.log('🚀 STARTING PHASE 23: THEME INTEGRATION & PUBLISHING TESTS');
  console.log('==========================================================\n');

  // --------------------------------------------------------------------------
  // 1. STATIC ARCHITECTURE & DOCUMENTATION AUDIT
  // --------------------------------------------------------------------------
  console.log('--- 1. Static Architecture & Documentation Audit ---');

  const publishingDocPath = path.resolve(process.cwd(), 'THEME_PUBLISHING.md');
  const architectureDocPath = path.resolve(process.cwd(), 'THEME_ARCHITECTURE.md');
  const themesPagePath = path.resolve(process.cwd(), 'src', 'app', 'admin', 'themes', 'page.tsx');
  const previewPagePath = path.resolve(process.cwd(), 'src', 'app', 'admin', 'preview', 'page.tsx');
  const previewBannerPath = path.resolve(process.cwd(), 'src', 'components', 'preview', 'PreviewBanner.tsx');

  assert(fs.existsSync(publishingDocPath), 'THEME_PUBLISHING.md exists');
  assert(fs.existsSync(architectureDocPath), 'THEME_ARCHITECTURE.md exists');
  assert(fs.existsSync(themesPagePath), '/admin/themes/page.tsx route exists');
  assert(fs.existsSync(previewPagePath), '/admin/preview/page.tsx route exists');

  const publishingDoc = fs.readFileSync(publishingDocPath, 'utf-8');
  assert(publishingDoc.includes('CURRENT PUBLISHED THEME') || publishingDoc.includes('Current Published Theme'), 'THEME_PUBLISHING.md documents Published Theme');
  assert(publishingDoc.includes('DRAFT THEME') || publishingDoc.includes('Draft Theme'), 'THEME_PUBLISHING.md documents Draft Theme');
  assert(publishingDoc.includes('Public Isolation'), 'THEME_PUBLISHING.md documents Public Isolation');
  assert(publishingDoc.includes('Content Independence'), 'THEME_PUBLISHING.md documents Content Independence');
  assert(publishingDoc.includes('revalidatePath'), 'THEME_PUBLISHING.md documents cache revalidation');

  const previewBannerCode = fs.readFileSync(previewBannerPath, 'utf-8');
  assert(previewBannerCode.includes('Preview Mode — Unpublished Theme'), 'PreviewBanner has unpublished theme indicator');
  assert(previewBannerCode.includes('/admin/themes'), 'PreviewBanner has direct link to /admin/themes');

  // --------------------------------------------------------------------------
  // 2. SECURITY & ACCESS CONTROL ENFORCEMENT
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Security & Access Control Enforcement ---');

  // 2.1 Unauthorized GET /api/admin/themes
  const unauthGetRes = await fetch(`${BASE_URL}/api/admin/themes`);
  assert(unauthGetRes.status === 403, 'Unauthenticated GET /api/admin/themes returns 403 Forbidden');

  // 2.2 Unauthorized POST /api/admin/themes (save_draft)
  const unauthSaveDraftRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save_draft', themeId: 'precision-dark' }),
  });
  assert(unauthSaveDraftRes.status === 403, 'Unauthenticated POST /api/admin/themes (save_draft) returns 403 Forbidden');

  // 2.3 Unauthorized POST /api/admin/themes (publish)
  const unauthPublishRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'publish', themeId: 'precision-dark' }),
  });
  assert(unauthPublishRes.status === 403, 'Unauthenticated POST /api/admin/themes (publish) returns 403 Forbidden');

  // 2.4 Unauthorized POST /api/admin/themes (discard)
  const unauthDiscardRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'discard' }),
  });
  assert(unauthDiscardRes.status === 403, 'Unauthenticated POST /api/admin/themes (discard) returns 403 Forbidden');

  // 2.5 Unauthorized dedicated routes
  const unauthSubDraftRes = await fetch(`${BASE_URL}/api/admin/themes/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ themeId: 'precision-dark' }),
  });
  assert(unauthSubDraftRes.status === 403, 'Unauthenticated POST /api/admin/themes/draft returns 403');

  const unauthSubPublishRes = await fetch(`${BASE_URL}/api/admin/themes/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ themeId: 'precision-dark' }),
  });
  assert(unauthSubPublishRes.status === 403, 'Unauthenticated POST /api/admin/themes/publish returns 403');

  const unauthSubDiscardRes = await fetch(`${BASE_URL}/api/admin/themes/discard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  assert(unauthSubDiscardRes.status === 403, 'Unauthenticated POST /api/admin/themes/discard returns 403');

  // --------------------------------------------------------------------------
  // 3. THEME SWITCH TEST (Theme 1 -> Theme 2)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Theme Switch Test (Theme 1 -> Theme 2) ---');

  // Set baseline to modern-editorial (Theme 1)
  await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'publish', themeId: 'modern-editorial' }),
  });

  // Verify baseline published theme
  const getInitialRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const initialData = await getInitialRes.json();
  assert(initialData.activeTheme?.id === 'modern-editorial', 'Initial active theme is set to modern-editorial (Theme 1)');
  assert(initialData.draftTheme === null, 'No draft theme is initially staged');

  // Step 3.1: Save Draft precision-dark (Theme 2)
  const saveDraftT2Res = await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'save_draft', themeId: 'precision-dark' }),
  });
  assert(saveDraftT2Res.status === 200, 'POST save_draft for precision-dark returns 200 OK');

  // Step 3.2: Verify Admin state has Published=Theme 1 and Draft=Theme 2
  const checkStateRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const stateData = await checkStateRes.json();
  assert(stateData.activeTheme.id === 'modern-editorial', 'Published theme remains modern-editorial');
  assert(stateData.draftTheme?.themeId === 'precision-dark', 'Draft theme is precision-dark');

  // Step 3.3: Verify Public site strictly renders Published Theme 1
  const publicT1Res = await fetch(`${BASE_URL}/`);
  const publicT1Html = await publicT1Res.text();
  assert(publicT1Html.includes('data-theme="modern-editorial"'), 'Public portfolio strictly renders published theme (modern-editorial)');
  assert(!publicT1Html.includes('data-theme="precision-dark"'), 'Draft theme (precision-dark) does NOT leak to public portfolio');

  // Step 3.4: Verify Authorized Preview renders Draft Theme 2
  const previewT2Res = await fetch(`${BASE_URL}/admin/preview`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const previewT2Html = await previewT2Res.text();
  assert(previewT2Html.includes('data-theme="precision-dark"'), 'Authorized Preview renders staged draft theme (precision-dark)');
  assert(previewT2Html.includes('Preview Mode — Unpublished Theme'), 'Preview displays "Preview Mode — Unpublished Theme" banner pill');

  // Step 3.5: Publish Theme 2
  const publishT2Res = await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'publish', themeId: 'precision-dark' }),
  });
  assert(publishT2Res.status === 200, 'POST publish for precision-dark returns 200 OK');

  // Step 3.6: Verify post-publish state
  const postPublishStateRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const postPublishState = await postPublishStateRes.json();
  assert(postPublishState.activeTheme.id === 'precision-dark', 'Active theme is now published as precision-dark');
  assert(postPublishState.draftTheme === null, 'Draft theme was cleared upon publication');

  const publicAfterPublishRes = await fetch(`${BASE_URL}/`);
  const publicAfterPublishHtml = await publicAfterPublishRes.text();
  assert(publicAfterPublishHtml.includes('data-theme="precision-dark"'), 'Public portfolio now renders newly published theme (precision-dark)');

  // --------------------------------------------------------------------------
  // 4. REVERSE SWITCH TEST (Theme 2 -> Theme 3 -> Theme 1)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Reverse Switch Test (Theme 2 -> Theme 3 -> Theme 1) ---');

  // Stage Theme 3 (structured-monochrome)
  await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'save_draft', themeId: 'structured-monochrome' }),
  });

  // Verify preview shows Theme 3, public stays Theme 2
  const previewT3Res = await fetch(`${BASE_URL}/admin/preview`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const previewT3Html = await previewT3Res.text();
  assert(previewT3Html.includes('data-theme="structured-monochrome"'), 'Preview renders structured-monochrome draft');

  const publicStayT2Res = await fetch(`${BASE_URL}/`);
  const publicStayT2Html = await publicStayT2Res.text();
  assert(publicStayT2Html.includes('data-theme="precision-dark"'), 'Public stays on precision-dark while Theme 3 is drafted');

  // Publish Theme 3
  await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'publish', themeId: 'structured-monochrome' }),
  });

  const publicAfterT3Res = await fetch(`${BASE_URL}/`);
  const publicAfterT3Html = await publicAfterT3Res.text();
  assert(publicAfterT3Html.includes('data-theme="structured-monochrome"'), 'Public now renders structured-monochrome');

  // Stage Theme 1 (modern-editorial)
  await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'save_draft', themeId: 'modern-editorial' }),
  });

  // Verify preview shows Theme 1, public stays Theme 3
  const previewT1Res = await fetch(`${BASE_URL}/admin/preview`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const previewT1Html = await previewT1Res.text();
  assert(previewT1Html.includes('data-theme="modern-editorial"'), 'Preview renders modern-editorial draft');

  // Publish Theme 1
  await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'publish', themeId: 'modern-editorial' }),
  });

  const publicBackT1Res = await fetch(`${BASE_URL}/`);
  const publicBackT1Html = await publicBackT1Res.text();
  assert(publicBackT1Html.includes('data-theme="modern-editorial"'), 'Public portfolio smoothly returned to modern-editorial');

  // --------------------------------------------------------------------------
  // 5. DISCARD WORKFLOW TEST
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Discard Workflow Test ---');

  // Published: modern-editorial. Stage precision-dark as draft
  await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'save_draft', themeId: 'precision-dark' }),
  });

  // Discard draft
  const discardRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'discard' }),
  });
  assert(discardRes.status === 200, 'POST discard returns 200 OK');

  const afterDiscardStateRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const afterDiscardState = await afterDiscardStateRes.json();
  assert(afterDiscardState.draftTheme === null, 'Draft theme successfully cleared after discard');
  assert(afterDiscardState.activeTheme.id === 'modern-editorial', 'Active published theme remains modern-editorial');

  const publicDiscardCheckRes = await fetch(`${BASE_URL}/`);
  const publicDiscardCheckHtml = await publicDiscardCheckRes.text();
  assert(publicDiscardCheckHtml.includes('data-theme="modern-editorial"'), 'Public portfolio unaffected by discard');

  // --------------------------------------------------------------------------
  // 6. INVALID THEME REJECTION & SAFE FALLBACK
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Invalid Theme Rejection & Safe Fallback ---');

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
  // 7. DRAFT CONTENT & THEME INDEPENDENCE
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Draft Content & Theme Independence ---');

  // 7.1 Stage a draft project modification
  const projectDraftPayload = {
    id: 'draft-project-test-p23',
    entity_type: 'project',
    entity_id: 'proj-ml-pipeline',
    title: 'Test Draft Project Modification',
    summary: 'Staged project change for independence verification',
    data: {
      title: 'Autonomous Multimodal AI Platform [DRAFT]',
      short_description: 'This is an unpublished draft project description.',
    },
  };

  const saveProjDraftRes = await fetch(`${BASE_URL}/api/admin/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify(projectDraftPayload),
  });
  assert(saveProjDraftRes.status === 200, 'Staged draft project modification via /api/admin/drafts');

  // 7.2 Stage a theme draft (precision-dark)
  await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'save_draft', themeId: 'precision-dark' }),
  });

  // 7.3 Preview should show BOTH draft theme AND draft project
  const comboPreviewRes = await fetch(`${BASE_URL}/admin/preview`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const comboPreviewHtml = await comboPreviewRes.text();
  assert(comboPreviewHtml.includes('data-theme="precision-dark"'), 'Preview shows staged draft theme');
  assert(comboPreviewHtml.includes('Autonomous Multimodal AI Platform [DRAFT]'), 'Preview shows staged draft project changes');

  // 7.4 Public should show NEITHER draft theme NOR draft project
  const comboPublicRes = await fetch(`${BASE_URL}/`);
  const comboPublicHtml = await comboPublicRes.text();
  assert(comboPublicHtml.includes('data-theme="modern-editorial"'), 'Public shows published theme');
  assert(!comboPublicHtml.includes('Autonomous Multimodal AI Platform [DRAFT]'), 'Public does NOT show draft project changes');

  // 7.5 Publish ONLY the theme
  const publishOnlyThemeRes = await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'publish', themeId: 'precision-dark' }),
  });
  assert(publishOnlyThemeRes.status === 200, 'Published theme successfully');

  // 7.6 Verify: Public site updated to new theme, BUT project draft remains UNPUBLISHED!
  const publicAfterThemeOnlyRes = await fetch(`${BASE_URL}/`);
  const publicAfterThemeOnlyHtml = await publicAfterThemeOnlyRes.text();
  assert(publicAfterThemeOnlyHtml.includes('data-theme="precision-dark"'), 'Public portfolio now uses precision-dark theme');
  assert(!publicAfterThemeOnlyHtml.includes('Autonomous Multimodal AI Platform [DRAFT]'), 'Draft project was NOT published by theme publication!');

  // 7.7 Verify draft project is still in drafts list
  const remainingDraftsRes = await fetch(`${BASE_URL}/api/admin/drafts`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const remainingDrafts = await remainingDraftsRes.json();
  const projDraftStillExists = (remainingDrafts.drafts || []).some((d) => d.entity_type === 'project');
  assert(projDraftStillExists, 'Project draft safely remains in drafts staging');

  // Clean up the project draft
  await fetch(`${BASE_URL}/api/admin/drafts?id=draft-project-test-p23`, {
    method: 'DELETE',
    headers: { Cookie: ADMIN_COOKIE },
  });

  // --------------------------------------------------------------------------
  // 8. SECTION ORDER & VISIBILITY INDEPENDENCE
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Section Order & Section Visibility Invariance ---');

  // Check section order on modern-editorial vs precision-dark
  const publicHtml = await (await fetch(`${BASE_URL}/`)).text();
  const heroIndex = publicHtml.indexOf('id="hero"');
  const aboutIndex = publicHtml.indexOf('id="about"');
  const experienceIndex = publicHtml.indexOf('id="experience"');
  const skillsIndex = publicHtml.indexOf('id="skills"');
  const projectsIndex = publicHtml.indexOf('id="projects"');
  const certsIndex = publicHtml.indexOf('id="certifications"');
  const contactIndex = publicHtml.indexOf('id="contact"');

  assert(heroIndex !== -1, 'Hero section is rendered');
  assert(aboutIndex !== -1, 'About section is rendered');
  assert(experienceIndex !== -1, 'Experience section is rendered');
  assert(skillsIndex !== -1, 'Skills section is rendered');
  assert(projectsIndex !== -1, 'Projects section is rendered');
  assert(certsIndex !== -1, 'Certifications section is rendered');
  assert(contactIndex !== -1, 'Contact section is rendered');
  assert(
    heroIndex < aboutIndex && aboutIndex < experienceIndex && experienceIndex < skillsIndex,
    'Section hierarchy matches authoritative CMS display order'
  );

  // --------------------------------------------------------------------------
  // 9. MEDIA ASSET & SEO STABILITY
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Media Asset & SEO Stability ---');

  assert(publicHtml.includes('/images/profile.jpg'), 'Profile portrait image preserved in published HTML');
  assert(publicHtml.includes('Mohamed Khaled'), 'Name identity preserved in published HTML');
  assert(publicHtml.includes('Machine Learning Engineer'), 'Professional title preserved in published HTML');
  assert(publicHtml.includes('href="/documents/resume.pdf"'), 'Resume document link preserved in published HTML');

  // Reset to modern-developer / default clean state
  await fetch(`${BASE_URL}/api/admin/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ action: 'publish', themeId: 'modern-editorial' }),
  });

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
