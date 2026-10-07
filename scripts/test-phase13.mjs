/**
 * PHASE 13 VERIFICATION TEST SUITE
 * Tests:
 * 1. Security & Authorization (Admin-only routes, redirects, 403 on unauthenticated APIs)
 * 2. Draft Staging Lifecycle (Create site_settings draft, project draft, section draft)
 * 3. Public Site Isolation (Draft content STRICTLY hidden from public /, no leaks)
 * 4. Authenticated Preview Mode (/admin/preview renders draft changes with fallback to published)
 * 5. Section Configuration in Draft (Draft ordering & visibility isolated from public site)
 * 6. Discard Draft Workflow (Discards draft staging without deleting published baseline)
 * 7. Publishing Workflow (Publish single draft, public / updates immediately, cache revalidated)
 * 8. Bulk Publishing Workflow (Publish all pending drafts atomically, verify public / updates)
 * 9. Admin Dashboard & Publishing Hub Delivery (/admin/publishing and /admin/dashboard metrics)
 * 10. Public Regression Testing (Zero regressions across Phases 0-12)
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

function htmlMatches(html, text) {
  const escaped = text.replace(/&/g, '&amp;');
  return html.includes(text) || html.includes(escaped);
}

async function runTests() {
  console.log('==========================================================');
  console.log('🚀 STARTING PHASE 13 DRAFT / PREVIEW / PUBLISH VERIFICATION');
  console.log('==========================================================\n');

  // --------------------------------------------------------------------------
  // 1. SECURITY & AUTHORIZATION TESTS
  // --------------------------------------------------------------------------
  console.log('--- 1. Testing Security & Authorization ---');

  // 1.1 Unauthenticated GET /api/admin/drafts
  const unauthGetDrafts = await fetch(`${BASE_URL}/api/admin/drafts`);
  assert(
    unauthGetDrafts.status === 403,
    `Unauthenticated GET /api/admin/drafts rejected with 403 (Got: ${unauthGetDrafts.status})`
  );

  // 1.2 Unauthenticated POST /api/admin/drafts
  const unauthPostDraft = await fetch(`${BASE_URL}/api/admin/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity_type: 'site_settings', entity_id: 'singleton', data: {} }),
  });
  assert(
    unauthPostDraft.status === 403,
    `Unauthenticated POST /api/admin/drafts rejected with 403 (Got: ${unauthPostDraft.status})`
  );

  // 1.3 Unauthenticated DELETE /api/admin/drafts
  const unauthDeleteDrafts = await fetch(`${BASE_URL}/api/admin/drafts`, {
    method: 'DELETE',
  });
  assert(
    unauthDeleteDrafts.status === 403,
    `Unauthenticated DELETE /api/admin/drafts rejected with 403 (Got: ${unauthDeleteDrafts.status})`
  );

  // 1.4 Unauthenticated POST /api/admin/publishing/publish
  const unauthPublish = await fetch(`${BASE_URL}/api/admin/publishing/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ all: true }),
  });
  assert(
    unauthPublish.status === 403,
    `Unauthenticated POST /api/admin/publishing/publish rejected with 403 (Got: ${unauthPublish.status})`
  );

  // 1.5 Unauthenticated POST /api/admin/publishing/discard
  const unauthDiscard = await fetch(`${BASE_URL}/api/admin/publishing/discard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ all: true }),
  });
  assert(
    unauthDiscard.status === 403,
    `Unauthenticated POST /api/admin/publishing/discard rejected with 403 (Got: ${unauthDiscard.status})`
  );

  // 1.6 Unauthenticated GET /admin/preview redirects to login
  const unauthPreview = await fetch(`${BASE_URL}/admin/preview`, {
    redirect: 'manual',
  });
  assert(
    unauthPreview.status === 307 || unauthPreview.status === 302,
    `Unauthenticated GET /admin/preview redirects to login (Status: ${unauthPreview.status})`
  );

  // 1.7 Unauthenticated GET /admin/publishing redirects to login
  const unauthPublishingPage = await fetch(`${BASE_URL}/admin/publishing`, {
    redirect: 'manual',
  });
  assert(
    unauthPublishingPage.status === 307 || unauthPublishingPage.status === 302,
    `Unauthenticated GET /admin/publishing redirects to login (Status: ${unauthPublishingPage.status})`
  );

  // --------------------------------------------------------------------------
  // 2. DRAFT STAGING LIFECYCLE
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Draft Staging Lifecycle ---');

  // Baseline cleanup: discard any leftover drafts
  await fetch(`${BASE_URL}/api/admin/publishing/discard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ all: true }),
  });

  // Ensure clean published baseline before staging test draft
  const originalSubtitle = 'Turning Data Into Intelligent Solutions';
  await fetch(`${BASE_URL}/api/admin/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      profile: {
        name: 'Mohamed Khaled',
        professional_title: 'Machine Learning Engineer',
        subtitle: originalSubtitle,
        bio: 'I am a Machine Learning Engineer with a passion for building AI systems that solve real-world problems.',
        email: 'mohamed@example.com',
        location: 'Cairo, Egypt',
      },
    }),
  });

  // 2.1 Stage a site_settings draft (updating subtitle)
  const draftSubtitle = 'Specialized in Large Language Models & Distributed Inference (Draft v13)';
  const stageSettingsRes = await fetch(`${BASE_URL}/api/admin/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      entity_type: 'site_settings',
      entity_id: 'singleton',
      title: 'Profile & Hero Headline',
      summary: 'Updated professional headline and research focus',
      data: {
        subtitle: draftSubtitle,
        hero_subtitle: draftSubtitle,
      },
    }),
  });
  const stageSettingsData = await stageSettingsRes.json();
  assert(
    stageSettingsRes.status === 200 && stageSettingsData.success,
    `Staged site_settings draft successfully (Draft ID: ${stageSettingsData.draft?.id})`
  );

  // 2.2 Stage a new project draft
  const draftProjectTitle = 'Multi-Agent Reinforcement Learning Testbed';
  const stageProjRes = await fetch(`${BASE_URL}/api/admin/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      entity_type: 'project',
      entity_id: 'proj-marl-draft-test',
      title: `Project: ${draftProjectTitle}`,
      summary: 'Staged autonomous multi-agent simulation framework',
      data: {
        title: draftProjectTitle,
        slug: 'marl-simulation-framework',
        short_description: 'Autonomous multi-agent simulation benchmark in PyTorch.',
        full_description: 'Advanced distributed simulation testbed.',
        technologies: ['PyTorch', 'Ray', 'RLlib'],
        featured: true,
        display_order: 1,
        enabled: true,
      },
    }),
  });
  const stageProjData = await stageProjRes.json();
  assert(
    stageProjRes.status === 200 && stageProjData.success,
    `Staged project draft successfully (Draft ID: ${stageProjData.draft?.id})`
  );

  // 2.3 Verify drafts list endpoint
  const getDraftsRes = await fetch(`${BASE_URL}/api/admin/drafts`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const getDraftsData = await getDraftsRes.json();
  assert(
    getDraftsRes.status === 200 && getDraftsData.totalDrafts >= 2,
    `Authenticated GET /api/admin/drafts returned ${getDraftsData.totalDrafts} active drafts`
  );

  // --------------------------------------------------------------------------
  // 3. PUBLIC SITE ISOLATION (ZERO LEAKAGE)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Public Site Isolation (Drafts Strictly Hidden) ---');

  const publicRes = await fetch(`${BASE_URL}/`);
  const publicHtml = await publicRes.text();

  assert(
    !htmlMatches(publicHtml, draftSubtitle),
    `Draft subtitle is strictly absent from public homepage (Zero Leakage)`
  );
  assert(
    !htmlMatches(publicHtml, draftProjectTitle),
    `Draft project is strictly absent from public homepage (Zero Leakage)`
  );

  // --------------------------------------------------------------------------
  // 4. AUTHENTICATED PREVIEW MODE (/admin/preview)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Authenticated Preview Mode ---');

  const previewRes = await fetch(`${BASE_URL}/admin/preview`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const previewHtml = await previewRes.text();

  assert(
    previewRes.status === 200,
    `Admin Preview Page (/admin/preview) delivered with 200 OK`
  );
  assert(
    previewHtml.includes('Preview Mode'),
    `Preview Header Banner rendered ("Preview Mode")`
  );
  assert(
    htmlMatches(previewHtml, draftSubtitle),
    `Draft subtitle rendered in Authenticated Preview`
  );
  assert(
    htmlMatches(previewHtml, draftProjectTitle),
    `Draft project rendered in Authenticated Preview`
  );
  assert(
    previewHtml.includes('Exit Preview'),
    `Exit Preview link present in Preview Banner`
  );

  // --------------------------------------------------------------------------
  // 5. SECTION CONFIGURATION IN DRAFT (Ordering & Enable/Disable)
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Section Configuration in Draft ---');

  // Stage a draft sections_order that disables Projects and moves Contact to position #2
  const sectionsRes = await fetch(`${BASE_URL}/api/admin/sections`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const sectionsData = await sectionsRes.json();
  const allSections = sectionsData.sections || [];

  const heroSec = allSections.find((s) => s.type === 'hero');
  const contactSec = allSections.find((s) => s.type === 'contact');
  const projSec = allSections.find((s) => s.type === 'projects');
  const otherSecIds = allSections
    .filter((s) => s.id !== heroSec?.id && s.id !== contactSec?.id)
    .map((s) => s.id);

  const draftOrderedIds = [heroSec.id, contactSec.id, ...otherSecIds];

  const stageSectionOrderRes = await fetch(`${BASE_URL}/api/admin/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      entity_type: 'sections_order',
      entity_id: 'singleton',
      title: 'Sections Order & Visibility',
      summary: 'Staged new section order with Contact at #2 and Projects disabled',
      data: {
        orderedIds: draftOrderedIds,
        enabledMap: {
          [projSec.id]: false,
        },
      },
    }),
  });
  assert(
    stageSectionOrderRes.status === 200,
    `Staged draft section ordering & visibility configuration`
  );

  // Verify public HTML: Projects is STILL VISIBLE (because draft is uncommitted)
  const publicCheckRes = await fetch(`${BASE_URL}/`);
  const publicCheckHtml = await publicCheckRes.text();
  assert(
    publicCheckHtml.includes('id="projects"'),
    `Public site continues rendering Projects section (Staged draft disable not leaked)`
  );

  // Verify preview HTML: Projects is HIDDEN in Preview Mode!
  const previewCheckRes = await fetch(`${BASE_URL}/admin/preview`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const previewCheckHtml = await previewCheckRes.text();
  assert(
    !previewCheckHtml.includes('id="projects"'),
    `Preview Mode correctly hides Projects section according to draft enabledMap`
  );

  // --------------------------------------------------------------------------
  // 6. DISCARD DRAFT WORKFLOW
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Discard Draft Workflow ---');

  // Discard the sections_order draft
  const discardSectionOrderRes = await fetch(
    `${BASE_URL}/api/admin/drafts/draft-sections_order-singleton`,
    {
      method: 'DELETE',
      headers: { Cookie: ADMIN_COOKIE },
    }
  );
  assert(
    discardSectionOrderRes.status === 200,
    `Discarded sections_order draft successfully`
  );

  // Verify preview restored Projects section
  const previewAfterDiscardRes = await fetch(`${BASE_URL}/admin/preview`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const previewAfterDiscardHtml = await previewAfterDiscardRes.text();
  assert(
    previewAfterDiscardHtml.includes('id="projects"'),
    `Projects section restored in Preview Mode after discarding draft`
  );

  // --------------------------------------------------------------------------
  // 7. PUBLISHING WORKFLOW (Single Draft Publish)
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Testing Single Draft Publish Workflow ---');

  const publishSettingsRes = await fetch(`${BASE_URL}/api/admin/publishing/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ draftId: 'draft-site_settings-singleton' }),
  });
  const publishSettingsData = await publishSettingsRes.json();
  assert(
    publishSettingsRes.status === 200 && publishSettingsData.success,
    `Published site_settings draft: "${publishSettingsData.message}"`
  );

  // Verify public HTML now reflects the published subtitle!
  const publicAfterPublishRes = await fetch(`${BASE_URL}/`);
  const publicAfterPublishHtml = await publicAfterPublishRes.text();
  assert(
    htmlMatches(publicAfterPublishHtml, draftSubtitle),
    `Public homepage immediately reflects published subtitle: "${draftSubtitle}"`
  );

  // Restore original baseline subtitle
  await fetch(`${BASE_URL}/api/admin/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      profile: {
        name: 'Mohamed Khaled',
        professional_title: 'Machine Learning Engineer',
        subtitle: originalSubtitle,
        bio: 'I am a Machine Learning Engineer with a passion for building AI systems that solve real-world problems.',
        email: 'mohamed@example.com',
        location: 'Cairo, Egypt',
      },
    }),
  });

  // --------------------------------------------------------------------------
  // 8. BULK PUBLISHING WORKFLOW (Publish All)
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Testing Bulk Publishing Workflow (all: true) ---');

  const bulkPublishRes = await fetch(`${BASE_URL}/api/admin/publishing/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ all: true }),
  });
  const bulkPublishData = await bulkPublishRes.json();
  assert(
    bulkPublishRes.status === 200 && bulkPublishData.success,
    `Bulk published remaining drafts: "${bulkPublishData.message}"`
  );

  // Verify project is now live on public homepage!
  const publicAfterBulkRes = await fetch(`${BASE_URL}/`);
  const publicAfterBulkHtml = await publicAfterBulkRes.text();
  assert(
    publicAfterBulkHtml.includes(draftProjectTitle),
    `Bulk-published draft project is now live on public homepage: "${draftProjectTitle}"`
  );

  // Cleanup: delete test project
  const deleteTestProjRes = await fetch(
    `${BASE_URL}/api/admin/projects/proj-marl-draft-test`,
    {
      method: 'DELETE',
      headers: { Cookie: ADMIN_COOKIE },
    }
  );
  // Also cleanup if slug was used
  assert(
    deleteTestProjRes.status === 200 || deleteTestProjRes.status === 404,
    `Cleaned up test project`
  );

  // --------------------------------------------------------------------------
  // 9. ADMIN DASHBOARD & PUBLISHING HUB DELIVERY
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Testing Admin Dashboard & Publishing Hub Delivery ---');

  const publishingHubRes = await fetch(`${BASE_URL}/admin/publishing`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const publishingHubHtml = await publishingHubRes.text();
  assert(
    publishingHubRes.status === 200 && publishingHubHtml.includes('Publishing'),
    `Admin Publishing Hub (/admin/publishing) delivered with 200 OK`
  );

  const dashboardRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const dashboardHtml = await dashboardRes.text();
  assert(
    dashboardRes.status === 200 &&
      (dashboardHtml.includes('Publishing &amp; Preview Hub') ||
        dashboardHtml.includes('Publishing & Preview Hub') ||
        dashboardHtml.includes('/admin/publishing')),
    `Admin Dashboard delivered with 200 OK and includes "Publishing & Preview Hub" shortcut`
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

  console.log('\n==========================================================');
  console.log(`📊 PHASE 13 VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
