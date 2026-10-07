/**
 * PHASE 12 VERIFICATION TEST SUITE
 * Tests:
 * 1. Security & Authorization (Admin-only routes, redirects, 403 on unauthenticated APIs)
 * 2. Section List & Core Schema Retrieval (7 Core Sections: Hero, About, Experience, Skills, Projects, Certifications, Contact)
 * 3. Hero Special Protection Rule (Reject disabling hero with 400 Bad Request & clear explanation)
 * 4. Core Section Deletion Protection (Reject deleting core sections with 400 Bad Request)
 * 5. Section Reordering (Deterministic display_order persistence, public HTML rendered order match, restoration)
 * 6. Section Visibility Toggle (Disabling projects removes section and navbar link from public HTML without touching data; re-enabling restores it)
 * 7. Section Metadata Editing (Updating section title, reflection in public HTML, restoration)
 * 8. Validation Rules (Empty title, invalid status, empty orderedIds rejected with 400)
 * 9. Admin Dashboard Metrics Integration (Total Sections live stats)
 * 10. Public Regression Testing (Zero regressions across Phases 0-11)
 */

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
  console.log('🚀 STARTING PHASE 12 SECTIONS CMS VERIFICATION');
  console.log('==========================================================\n');

  // --------------------------------------------------------------------------
  // 1. SECURITY & AUTHORIZATION TESTS
  // --------------------------------------------------------------------------
  console.log('--- 1. Testing Security & Authorization ---');

  // 1.1 Unauthenticated GET /api/admin/sections
  const unauthGet = await fetch(`${BASE_URL}/api/admin/sections`);
  assert(
    unauthGet.status === 403,
    `Unauthenticated GET /api/admin/sections rejected with 403 (Got: ${unauthGet.status})`
  );

  // 1.2 Unauthenticated POST /api/admin/sections
  const unauthPost = await fetch(`${BASE_URL}/api/admin/sections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'custom-sec', title: 'Custom' }),
  });
  assert(
    unauthPost.status === 403,
    `Unauthenticated POST /api/admin/sections rejected with 403 (Got: ${unauthPost.status})`
  );

  // 1.3 Unauthenticated POST /api/admin/sections/reorder
  const unauthReorder = await fetch(`${BASE_URL}/api/admin/sections/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds: ['sec-hero', 'sec-about'] }),
  });
  assert(
    unauthReorder.status === 403,
    `Unauthenticated POST /api/admin/sections/reorder rejected with 403 (Got: ${unauthReorder.status})`
  );

  // 1.4 Unauthenticated PATCH /api/admin/sections/sec-about
  const unauthPatch = await fetch(`${BASE_URL}/api/admin/sections/sec-about`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: false }),
  });
  assert(
    unauthPatch.status === 403,
    `Unauthenticated PATCH /api/admin/sections/[id] rejected with 403 (Got: ${unauthPatch.status})`
  );

  // 1.5 Unauthenticated DELETE /api/admin/sections/sec-about
  const unauthDelete = await fetch(`${BASE_URL}/api/admin/sections/sec-about`, {
    method: 'DELETE',
  });
  assert(
    unauthDelete.status === 403,
    `Unauthenticated DELETE /api/admin/sections/[id] rejected with 403 (Got: ${unauthDelete.status})`
  );

  // 1.6 Unauthenticated GET /admin/sections redirects to login
  const unauthPage = await fetch(`${BASE_URL}/admin/sections`, {
    redirect: 'manual',
  });
  assert(
    unauthPage.status === 307 || unauthPage.status === 302,
    `Unauthenticated GET /admin/sections redirects to login (Status: ${unauthPage.status})`
  );

  // --------------------------------------------------------------------------
  // 2. SECTION LIST & CORE SCHEMA RETRIEVAL
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Section List & Core Schema Retrieval ---');

  const getSectionsRes = await fetch(`${BASE_URL}/api/admin/sections`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const getSectionsData = await getSectionsRes.json();
  assert(
    getSectionsRes.status === 200 && getSectionsData.success,
    `Authenticated GET /api/admin/sections succeeded (Got: ${getSectionsRes.status})`
  );

  const sections = getSectionsData.sections || [];
  assert(
    sections.length >= 7,
    `Retrieved all core portfolio sections (Found: ${sections.length})`
  );

  const coreTypes = ['hero', 'about', 'experience', 'skills', 'projects', 'certifications', 'contact'];
  const presentTypes = sections.map((s) => s.type);
  const allCoreTypesPresent = coreTypes.every((t) => presentTypes.includes(t));
  assert(
    allCoreTypesPresent,
    `All 7 core types present: [${coreTypes.join(', ')}]`
  );

  const heroSec = sections.find((s) => s.type === 'hero');
  const aboutSec = sections.find((s) => s.type === 'about');
  const projSec = sections.find((s) => s.type === 'projects');
  assert(
    Boolean(heroSec && aboutSec && projSec),
    `Key core sections identified: Hero (${heroSec?.id}), About (${aboutSec?.id}), Projects (${projSec?.id})`
  );

  // --------------------------------------------------------------------------
  // 3. HERO SPECIAL PROTECTION RULE (Requirement 13)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Hero Special Protection Rule (Requirement 13) ---');

  const disableHeroRes = await fetch(`${BASE_URL}/api/admin/sections/${heroSec.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ enabled: false }),
  });
  const disableHeroData = await disableHeroRes.json();
  assert(
    disableHeroRes.status === 400,
    `Attempt to disable Hero rejected with 400 Bad Request (Got: ${disableHeroRes.status})`
  );
  assert(
    disableHeroData.error && disableHeroData.error.includes('Hero section is a core identity section'),
    `Protective error message returned: "${disableHeroData.error}"`
  );

  // Verify Hero remains enabled
  const verifyHeroRes = await fetch(`${BASE_URL}/api/admin/sections/${heroSec.id}`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const verifyHeroData = await verifyHeroRes.json();
  assert(
    verifyHeroData.section?.enabled === true,
    `Hero section confirmed enabled in database (enabled: ${verifyHeroData.section?.enabled})`
  );

  // --------------------------------------------------------------------------
  // 4. CORE SECTION DELETION PROTECTION (Requirement 19 & 20)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Core Section Deletion Protection ---');

  const deleteAboutRes = await fetch(`${BASE_URL}/api/admin/sections/${aboutSec.id}`, {
    method: 'DELETE',
    headers: { Cookie: ADMIN_COOKIE },
  });
  const deleteAboutData = await deleteAboutRes.json();
  assert(
    deleteAboutRes.status === 400,
    `Attempt to delete core section rejected with 400 Bad Request (Got: ${deleteAboutRes.status})`
  );
  assert(
    deleteAboutData.error && deleteAboutData.error.includes('Core portfolio sections cannot be deleted'),
    `Core deletion rejection message returned: "${deleteAboutData.error}"`
  );

  // --------------------------------------------------------------------------
  // 5. SECTION VALIDATION RULES
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Section Validation Rules ---');

  // 5.1 Empty Title
  const emptyTitleRes = await fetch(`${BASE_URL}/api/admin/sections/${aboutSec.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ title: '   ' }),
  });
  assert(
    emptyTitleRes.status === 400,
    `Empty section title rejected with 400 Bad Request (Got: ${emptyTitleRes.status})`
  );

  // 5.2 Invalid Status
  const invalidStatusRes = await fetch(`${BASE_URL}/api/admin/sections/${aboutSec.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ status: 'invalid_lifecycle_status' }),
  });
  assert(
    invalidStatusRes.status === 400,
    `Invalid status value rejected with 400 Bad Request (Got: ${invalidStatusRes.status})`
  );

  // 5.3 Empty orderedIds array
  const emptyReorderRes = await fetch(`${BASE_URL}/api/admin/sections/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ orderedIds: [] }),
  });
  assert(
    emptyReorderRes.status === 400,
    `Empty orderedIds array rejected with 400 Bad Request (Got: ${emptyReorderRes.status})`
  );

  // --------------------------------------------------------------------------
  // 6. SECTION REORDERING (Requirements 8, 9, 10, 23)
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Section Reordering & Public Order Synchronization ---');

  // Baseline section ordering
  const baselineList = sections.map((s) => s.id);

  // Move Contact to position #2 (immediately after Hero)
  const contactSec = sections.find((s) => s.type === 'contact');
  const otherIds = baselineList.filter((id) => id !== contactSec.id && id !== heroSec.id);
  const reorderedIds = [heroSec.id, contactSec.id, ...otherIds];

  const reorderRes = await fetch(`${BASE_URL}/api/admin/sections/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ orderedIds: reorderedIds }),
  });
  const reorderData = await reorderRes.json();
  assert(
    reorderRes.status === 200 && reorderData.success,
    `Reorder API succeeded: "${reorderData.message}"`
  );

  // Verify database order
  const verifyReorderGet = await fetch(`${BASE_URL}/api/admin/sections`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const verifyReorderData = await verifyReorderGet.json();
  const currentSections = verifyReorderData.sections || [];
  assert(
    currentSections[0]?.type === 'hero' && currentSections[1]?.type === 'contact',
    `Contact section is verified in position #2 (display_order: ${currentSections[1]?.display_order})`
  );

  // Verify public HTML reflects Contact before About
  const publicResAfterReorder = await fetch(`${BASE_URL}/`);
  const publicHtmlAfterReorder = await publicResAfterReorder.text();
  const contactIndexInHtml = publicHtmlAfterReorder.indexOf('id="contact"');
  const aboutIndexInHtml = publicHtmlAfterReorder.indexOf('id="about"');
  assert(
    contactIndexInHtml > 0 && aboutIndexInHtml > 0 && contactIndexInHtml < aboutIndexInHtml,
    `Public HTML renders #contact (pos: ${contactIndexInHtml}) before #about (pos: ${aboutIndexInHtml})`
  );

  // Restore Default Baseline Order (Hero, About, Experience, Skills, Projects, Certifications, Contact)
  const restoreReorderRes = await fetch(`${BASE_URL}/api/admin/sections/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ orderedIds: baselineList }),
  });
  assert(
    restoreReorderRes.status === 200,
    `Restored default canonical section ordering successfully`
  );

  // --------------------------------------------------------------------------
  // 7. SECTION VISIBILITY TOGGLE & NAVBAR INTEGRATION (Requirements 12, 25, 26, 27)
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Testing Section Visibility Toggle & Public Navbar Integration ---');

  // Disable Projects section
  const disableProjRes = await fetch(`${BASE_URL}/api/admin/sections/${projSec.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ enabled: false }),
  });
  const disableProjData = await disableProjRes.json();
  assert(
    disableProjRes.status === 200 && disableProjData.section?.enabled === false,
    `Projects section disabled successfully (enabled: false)`
  );

  // Verify public HTML: #projects section is completely absent
  const publicResDisabled = await fetch(`${BASE_URL}/`);
  const publicHtmlDisabled = await publicResDisabled.text();
  assert(
    !publicHtmlDisabled.includes('id="projects"'),
    `Disabled Projects section is strictly omitted from public HTML DOM`
  );

  const headerMatchDisabled = publicHtmlDisabled.match(/<header[\s\S]*?<\/header>/);
  const headerHtmlDisabled = headerMatchDisabled ? headerMatchDisabled[0] : '';
  assert(
    !headerHtmlDisabled.includes('href="#projects"') && !headerHtmlDisabled.includes('Projects'),
    `Disabled Projects link is strictly omitted from Public Navbar (Requirement 25)`
  );

  // Verify database data is completely preserved
  const verifyProjectsDbRes = await fetch(`${BASE_URL}/api/admin/projects`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const verifyProjectsDbData = await verifyProjectsDbRes.json();
  assert(
    verifyProjectsDbData.projects && verifyProjectsDbData.projects.length > 0,
    `Underlying project data completely preserved in database (${verifyProjectsDbData.projects?.length} projects intact)`
  );

  // Re-enable Projects section
  const enableProjRes = await fetch(`${BASE_URL}/api/admin/sections/${projSec.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ enabled: true }),
  });
  const enableProjData = await enableProjRes.json();
  assert(
    enableProjRes.status === 200 && enableProjData.section?.enabled === true,
    `Projects section re-enabled successfully (enabled: true)`
  );

  // Verify public HTML: #projects and nav link return
  const publicResEnabled = await fetch(`${BASE_URL}/`);
  const publicHtmlEnabled = await publicResEnabled.text();
  assert(
    publicHtmlEnabled.includes('id="projects"'),
    `Re-enabled Projects section is restored in public HTML DOM`
  );

  const headerMatchEnabled = publicHtmlEnabled.match(/<header[\s\S]*?<\/header>/);
  const headerHtmlEnabled = headerMatchEnabled ? headerMatchEnabled[0] : '';
  assert(
    headerHtmlEnabled.includes('href="#projects"') && headerHtmlEnabled.includes('Projects'),
    `Re-enabled Projects link is restored in Public Navbar`
  );

  // --------------------------------------------------------------------------
  // 8. SECTION METADATA EDITING (Requirement 18)
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Testing Section Metadata Editing ---');

  const customTitle = 'Selected Machine Learning Work';
  const updateTitleRes = await fetch(`${BASE_URL}/api/admin/sections/${projSec.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ title: customTitle }),
  });
  const updateTitleData = await updateTitleRes.json();
  assert(
    updateTitleRes.status === 200 && updateTitleData.section?.title === customTitle,
    `Section title updated to: "${updateTitleData.section?.title}"`
  );

  // Verify in public HTML
  const publicResCustomTitle = await fetch(`${BASE_URL}/`);
  const publicHtmlCustomTitle = await publicResCustomTitle.text();
  assert(
    publicHtmlCustomTitle.includes(customTitle),
    `Public HTML renders updated section title: "${customTitle}"`
  );

  // Restore original title
  const restoreTitleRes = await fetch(`${BASE_URL}/api/admin/sections/${projSec.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ title: 'Featured Projects' }),
  });
  assert(
    restoreTitleRes.status === 200,
    `Restored original section title "Featured Projects"`
  );

  // --------------------------------------------------------------------------
  // 9. ADMIN DASHBOARD & PAGES DELIVERY
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Testing Admin Dashboard & Pages Delivery ---');

  const adminSectionsPageRes = await fetch(`${BASE_URL}/admin/sections`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(
    adminSectionsPageRes.status === 200,
    `Admin Sections Page (/admin/sections) delivered with 200 OK`
  );

  const adminDashboardRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const dashboardHtml = await adminDashboardRes.text();
  assert(
    adminDashboardRes.status === 200 && dashboardHtml.includes('Total Sections'),
    `Admin Dashboard delivered with 200 OK and includes "Total Sections" live metric`
  );

  // --------------------------------------------------------------------------
  // 10. PUBLIC REGRESSION TESTING (All 7 Sections Intact)
  // --------------------------------------------------------------------------
  console.log('\n--- 10. Testing Public Regression Across All Sections ---');

  const finalPublicRes = await fetch(`${BASE_URL}/`);
  const finalHtml = await finalPublicRes.text();

  assert(finalHtml.includes('id="hero"'), 'Hero section intact (#hero)');
  assert(finalHtml.includes('id="about"'), 'About section intact (#about)');
  assert(finalHtml.includes('id="experience"'), 'Experience section intact (#experience)');
  assert(finalHtml.includes('id="skills"'), 'Skills section intact (#skills)');
  assert(finalHtml.includes('id="projects"'), 'Projects section intact (#projects)');
  assert(finalHtml.includes('id="certifications"'), 'Certifications section intact (#certifications)');
  assert(finalHtml.includes('id="contact"'), 'Contact section intact (#contact)');

  // Verify stable section anchors are present in navigation
  assert(finalHtml.includes('href="#hero"'), 'Anchor #hero preserved in Navbar');
  assert(finalHtml.includes('href="#about"'), 'Anchor #about preserved in Navbar');
  assert(finalHtml.includes('href="#experience"'), 'Anchor #experience preserved in Navbar');
  assert(finalHtml.includes('href="#skills"'), 'Anchor #skills preserved in Navbar');
  assert(finalHtml.includes('href="#projects"'), 'Anchor #projects preserved in Navbar');
  assert(finalHtml.includes('href="#certifications"'), 'Anchor #certifications preserved in Navbar');
  assert(finalHtml.includes('href="#contact"'), 'Anchor #contact preserved in Navbar');

  console.log('\n==========================================================');
  console.log(`📊 PHASE 12 VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
