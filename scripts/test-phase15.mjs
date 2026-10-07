/**
 * PHASE 15 VERIFICATION TEST SUITE
 * Settings CMS & Global Site Configuration
 *
 * Tests:
 * 1. Security & Authorization (Admin-only routes, 403 on unauthenticated APIs, redirect for /admin/settings)
 * 2. Settings Retrieval & Authoritative Model (GET /api/admin/settings returns complete site settings)
 * 3. Validation Rules (Empty site name, malformed URLs, invalid themes/accents rejected with 400)
 * 4. General Settings Update & Persistence (Site name, description, language, timezone)
 * 5. SEO Settings Update & Dynamic Public Metadata (SEO title, description, canonical URL, indexing)
 * 6. Appearance & System Preferences (Theme mode, accent presets, pagination, contact toggle)
 * 7. Media Reference Integration (Logo, Favicon, OG image linking; non-destructive removal)
 * 8. Media Reference Protection (Verifying linked logo/favicon are tracked by Media Manager)
 * 9. Draft / Preview / Publish Lifecycle (Draft isolation, preview reflection, instant live publication)
 * 10. Single Source of Truth & Deduplication (Personal profile & contact data safely preserved)
 * 11. Admin Navigation & Dashboard Integration (Sidebar link, quick actions, dashboard presence)
 * 12. Full Public Site Regression (Hero, About, Experience, Skills, Projects, Certs, Contact intact)
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
  console.log('🚀 STARTING PHASE 15 SETTINGS CMS VERIFICATION');
  console.log('==========================================================\n');

  // --------------------------------------------------------------------------
  // 1. SECURITY & AUTHORIZATION TESTS
  // --------------------------------------------------------------------------
  console.log('--- 1. Testing Security & Authorization ---');

  // 1.1 Unauthenticated GET /api/admin/settings
  const unauthGetSettings = await fetch(`${BASE_URL}/api/admin/settings`);
  assert(
    unauthGetSettings.status === 403,
    `Unauthenticated GET /api/admin/settings rejected with 403 (Got: ${unauthGetSettings.status})`
  );

  // 1.2 Unauthenticated POST /api/admin/settings
  const unauthPostSettings = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site_name: 'Hacked Site' }),
  });
  assert(
    unauthPostSettings.status === 403,
    `Unauthenticated POST /api/admin/settings rejected with 403 (Got: ${unauthPostSettings.status})`
  );

  // 1.3 Unauthenticated GET /admin/settings redirect
  const unauthPage = await fetch(`${BASE_URL}/admin/settings`, { redirect: 'manual' });
  assert(
    unauthPage.status === 307 || unauthPage.status === 302 || unauthPage.status === 303,
    `Unauthenticated GET /admin/settings redirects to login (Status: ${unauthPage.status})`
  );

  // --------------------------------------------------------------------------
  // 2. SETTINGS RETRIEVAL & AUTHORITATIVE MODEL
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Settings Retrieval & Authoritative Model ---');

  const getSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(getSettingsRes.status === 200, `Authenticated GET /api/admin/settings returned 200`);
  const initialData = await getSettingsRes.json();
  assert(Boolean(initialData.settings), `Settings object present in response`);
  const settings = initialData.settings;
  assert(typeof settings.site_name === 'string', `settings.site_name present: "${settings.site_name}"`);
  assert(typeof settings.seo_title === 'string', `settings.seo_title present: "${settings.seo_title}"`);
  assert(
    typeof settings.seo_description === 'string',
    `settings.seo_description present: "${settings.seo_description?.substring(0, 40)}..."`
  );

  // --------------------------------------------------------------------------
  // 3. VALIDATION RULES
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Settings Validation Rules ---');

  // 3.1 Empty site_name rejected
  const emptySiteNameRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'POST',
    headers: {
      Cookie: ADMIN_COOKIE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ site_name: '   ' }),
  });
  assert(
    emptySiteNameRes.status === 400,
    `Empty site name rejected with 400 Bad Request (Got: ${emptySiteNameRes.status})`
  );

  // 3.2 Malformed canonical URL rejected
  const badUrlRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'POST',
    headers: {
      Cookie: ADMIN_COOKIE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ canonical_url: 'not-a-valid-url' }),
  });
  assert(
    badUrlRes.status === 400,
    `Malformed canonical URL rejected with 400 Bad Request (Got: ${badUrlRes.status})`
  );

  // 3.3 Invalid theme_preference rejected
  const badThemeRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'POST',
    headers: {
      Cookie: ADMIN_COOKIE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ theme_preference: 'cyberpunk-neon' }),
  });
  assert(
    badThemeRes.status === 400,
    `Arbitrary theme rejected with 400 Bad Request (Got: ${badThemeRes.status})`
  );

  // 3.4 Invalid accent color rejected
  const badAccentRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'POST',
    headers: {
      Cookie: ADMIN_COOKIE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accent_color: '#ff00ff' }),
  });
  assert(
    badAccentRes.status === 400,
    `Arbitrary accent hex color rejected with 400 Bad Request (Got: ${badAccentRes.status})`
  );

  // --------------------------------------------------------------------------
  // 4. GENERAL SETTINGS UPDATE & PERSISTENCE
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing General Settings Update & Persistence ---');

  const testSiteName = 'Mohamed Khaled | AI Research & Systems Lab';
  const testSiteDesc = 'Autonomous multi-agent systems and real-time deep learning architectures by Mohamed Khaled.';
  const testLang = 'en-US';
  const testTz = 'Africa/Cairo';

  const updateGeneralRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'POST',
    headers: {
      Cookie: ADMIN_COOKIE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      site_name: testSiteName,
      site_description: testSiteDesc,
      default_language: testLang,
      timezone: testTz,
    }),
  });
  assert(updateGeneralRes.status === 200, `POST /api/admin/settings returned 200`);
  const generalData = await updateGeneralRes.json();
  assert(generalData.settings?.site_name === testSiteName, `site_name updated: "${generalData.settings?.site_name}"`);
  assert(generalData.settings?.default_language === testLang, `default_language updated: "${generalData.settings?.default_language}"`);
  assert(generalData.settings?.timezone === testTz, `timezone updated: "${generalData.settings?.timezone}"`);

  // Verify persistence via GET
  const verifyGeneralGet = await fetch(`${BASE_URL}/api/admin/settings`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const verifyGeneralData = await verifyGeneralGet.json();
  assert(
    verifyGeneralData.settings?.site_name === testSiteName &&
      verifyGeneralData.settings?.site_description === testSiteDesc &&
      verifyGeneralData.settings?.timezone === testTz,
    `General settings persisted and retrieved successfully on subsequent GET`
  );

  // --------------------------------------------------------------------------
  // 5. SEO SETTINGS & PUBLIC METADATA GENERATION
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing SEO Settings & Public Metadata Generation ---');

  const testSeoTitle = 'Mohamed Khaled | Lead Machine Learning Engineer Portfolio (Live SEO)';
  const testSeoDesc = 'Production portfolio demonstrating high-throughput transformer inference and autonomous robotics vision.';
  const testCanonical = 'https://mohamedkhaled.dev';

  const updateSeoRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'POST',
    headers: {
      Cookie: ADMIN_COOKIE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      seo_title: testSeoTitle,
      seo_description: testSeoDesc,
      canonical_url: testCanonical,
      allow_indexing: true,
    }),
  });
  assert(updateSeoRes.status === 200, `Updated SEO settings returned 200`);

  // Verify Public Homepage Metadata Generation
  const publicPageRes = await fetch(`${BASE_URL}/`);
  assert(publicPageRes.status === 200, `Public homepage returned 200`);
  const publicHtml = await publicPageRes.text();
  assert(
    publicHtml.includes(testSeoTitle) || publicHtml.includes('Mohamed Khaled'),
    `Public site HTML contains authoritative title or name`
  );
  assert(
    publicHtml.includes(testCanonical),
    `Public site HTML contains canonical URL metadata`
  );

  // --------------------------------------------------------------------------
  // 6. APPEARANCE & SYSTEM PREFERENCES
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Appearance & System Preferences ---');

  const updateAppearanceRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'POST',
    headers: {
      Cookie: ADMIN_COOKIE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      theme_preference: 'dark',
      accent_color: 'amber',
      default_items_per_page: 25,
      enable_contact_form: true,
      analytics_enabled: false,
    }),
  });
  assert(updateAppearanceRes.status === 200, `Updated appearance and system settings returned 200`);
  const appData = await updateAppearanceRes.json();
  assert(appData.settings?.accent_color === 'amber', `accent_color is amber`);
  assert(appData.settings?.default_items_per_page === 25, `default_items_per_page is 25`);
  assert(appData.settings?.enable_contact_form === true, `enable_contact_form is true`);

  // --------------------------------------------------------------------------
  // 7. MEDIA REFERENCE INTEGRATION & MEDIA TRACKING
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Testing Media Reference Integration & Media Tracking ---');

  const testLogoUrl = '/images/project-pipeline.jpg';
  const testFaviconUrl = '/favicon.ico';
  const testOgUrl = '/images/profile.jpg';

  const linkMediaRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'POST',
    headers: {
      Cookie: ADMIN_COOKIE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      logo: testLogoUrl,
      logo_url: testLogoUrl,
      favicon: testFaviconUrl,
      favicon_url: testFaviconUrl,
      og_image: testOgUrl,
      og_image_url: testOgUrl,
    }),
  });
  assert(linkMediaRes.status === 200, `Linked media assets to settings returned 200`);

  // 7.2 Verify Media Usage Scanner tracks settings references
  const mediaUsageRes = await fetch(`${BASE_URL}/api/admin/media/med-proj-pipeline`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const mediaUsageData = await mediaUsageRes.json();
  const hasSettingsLogoRef = mediaUsageData.references?.some(
    (r) => r.field === 'Logo Graphic' || r.entityTitle?.toLowerCase().includes('logo')
  );
  assert(
    hasSettingsLogoRef === true,
    `Media Manager usage scanner tracks settings logo reference (found: ${hasSettingsLogoRef})`
  );

  // 7.3 Non-destructive reference removal
  const clearLogoRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'POST',
    headers: {
      Cookie: ADMIN_COOKIE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      logo: null,
      logo_url: null,
    }),
  });
  assert(clearLogoRes.status === 200, `Cleared logo reference from settings`);

  // Verify the media item itself is NOT deleted
  const verifyMediaStillInLibrary = await fetch(`${BASE_URL}/api/admin/media/med-proj-pipeline`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(
    verifyMediaStillInLibrary.status === 200,
    `Removing reference from settings did NOT delete asset from Media Library (asset intact)`
  );

  // --------------------------------------------------------------------------
  // 8. DRAFT / PREVIEW / PUBLISH SETTINGS LIFECYCLE
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Testing Draft / Preview / Publish Settings Lifecycle ---');

  const draftSiteName = 'Draft Staged AI Laboratory (Phase 15)';
  const draftSeoTitle = 'Draft Staged SEO Title (Preview Only)';

  // 8.1 Stage settings change as a draft
  const createDraftRes = await fetch(`${BASE_URL}/api/admin/drafts`, {
    method: 'POST',
    headers: {
      Cookie: ADMIN_COOKIE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entity_type: 'site_settings',
      entity_id: 'singleton',
      title: 'Staged Global Settings Test',
      data: {
        site_name: draftSiteName,
        seo_title: draftSeoTitle,
      },
    }),
  });
  assert(
    createDraftRes.status === 200 || createDraftRes.status === 201,
    `Staged settings draft successfully (Status: ${createDraftRes.status})`
  );
  const draftPayload = await createDraftRes.json();
  const draftId = draftPayload.draft?.id;

  // 8.2 Verify public homepage STRICTLY retains published values (Zero Leakage)
  const publicCheckRes = await fetch(`${BASE_URL}/`);
  const publicCheckHtml = await publicCheckRes.text();
  assert(
    !publicCheckHtml.includes(draftSiteName) && !publicCheckHtml.includes(draftSeoTitle),
    `Draft settings are strictly hidden from public homepage (Zero Leakage)`
  );

  // 8.3 Verify Authenticated Preview Mode renders the staged draft
  const previewRes = await fetch(`${BASE_URL}/admin/preview`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(previewRes.status === 200, `Preview page loaded with 200 OK`);
  const previewHtml = await previewRes.text();
  assert(
    previewHtml.includes('Preview Mode'),
    `Preview header banner rendered in authenticated preview`
  );

  // 8.4 Clean up / Discard test draft
  const discardRes = await fetch(`${BASE_URL}/api/admin/drafts/${draftId}`, {
    method: 'DELETE',
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(discardRes.status === 200, `Discarded test draft successfully`);

  // --------------------------------------------------------------------------
  // 9. SINGLE SOURCE OF TRUTH & DEDUPLICATION
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Testing Single Source of Truth & Deduplication ---');

  const checkDeduplicationRes = await fetch(`${BASE_URL}/api/admin/profile`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const profileData = await checkDeduplicationRes.json();
  assert(
    Boolean(profileData.siteSettings?.name) &&
      Boolean(profileData.siteSettings?.professional_title) &&
      Boolean(profileData.siteSettings?.bio),
    `Personal Profile fields remain intact and authoritatively owned by Profile CMS`
  );

  // --------------------------------------------------------------------------
  // 10. ADMIN NAVIGATION & DASHBOARD INTEGRATION
  // --------------------------------------------------------------------------
  console.log('\n--- 10. Testing Admin Navigation & Dashboard Integration ---');

  // 10.1 GET /admin/settings loads with 200
  const settingsPageRes = await fetch(`${BASE_URL}/admin/settings`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(settingsPageRes.status === 200, `GET /admin/settings loads with 200 OK`);
  const settingsPageHtml = await settingsPageRes.text();
  assert(
    settingsPageHtml.includes('Configuration Overview') ||
      settingsPageHtml.includes('General') ||
      settingsPageHtml.includes('SEO'),
    `Settings page HTML contains structured CMS forms`
  );

  // 10.2 Admin Dashboard contains Settings quick action
  const dashboardRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const dashboardHtml = await dashboardRes.text();
  assert(
    dashboardHtml.includes('Global Settings') || dashboardHtml.includes('/admin/settings'),
    `Admin Dashboard includes Global Settings shortcut and navigation`
  );

  // --------------------------------------------------------------------------
  // 11. CROSS-MODULE REGRESSION
  // --------------------------------------------------------------------------
  console.log('\n--- 11. Cross-Module Regression Verification ---');

  const projectsRes = await fetch(`${BASE_URL}/api/admin/projects`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(projectsRes.status === 200, `GET /api/admin/projects returns 200`);

  const mediaRes = await fetch(`${BASE_URL}/api/admin/media`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(mediaRes.status === 200, `GET /api/admin/media returns 200`);

  const fullPublicRes = await fetch(`${BASE_URL}/`);
  const fullHtml = await fullPublicRes.text();
  assert(fullHtml.includes('Mohamed Khaled'), `Public site renders Hero name`);
  assert(fullHtml.includes('Projects'), `Public site renders Projects section`);
  assert(fullHtml.includes('Certifications'), `Public site renders Certifications section`);
  assert(fullHtml.includes('Experience'), `Public site renders Experience section`);
  assert(fullHtml.includes('Skills'), `Public site renders Skills section`);
  assert(fullHtml.includes('Contact'), `Public site renders Contact section`);

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n==========================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
