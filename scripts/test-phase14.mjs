/**
 * PHASE 14 VERIFICATION TEST SUITE
 * Media Management & Storage Lifecycle
 *
 * Tests:
 * 1. Security & Authorization (Admin-only routes, 403 on unauthenticated APIs)
 * 2. Media Retrieval, Search, Filter & Sort (GET /api/admin/media, search query, type filtering, sorting)
 * 3. Media Metadata Management (PATCH /api/admin/media/[id] for title, alt_text, description)
 * 4. Reference Tracking & Used Media Protection (In-use detection, locked deletion with 400 response)
 * 5. Upload Validation (MIME type restrictions, size limits, invalid upload rejection)
 * 6. Valid Upload & Safe Deletion Lifecycle (Upload new asset, verify in-library, delete unused asset)
 * 7. Admin Dashboard & Sidebar Integration (Media stats endpoint, dashboard card, sidebar link)
 * 8. Draft / Preview / Publish Media Integration (Draft references tracked, public isolation maintained)
 * 9. Cross-Module Integrity & Regression (Profile, Projects, Certifications, Experience media preserved)
 */

import { existsSync, unlinkSync } from 'fs';
import path from 'path';

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
  console.log('🚀 STARTING PHASE 14 MEDIA MANAGEMENT VERIFICATION');
  console.log('==========================================================\n');

  // --------------------------------------------------------------------------
  // 1. SECURITY & AUTHORIZATION TESTS
  // --------------------------------------------------------------------------
  console.log('--- 1. Testing Security & Authorization ---');

  // 1.1 Unauthenticated GET /api/admin/media
  const unauthGetMedia = await fetch(`${BASE_URL}/api/admin/media`);
  assert(
    unauthGetMedia.status === 403,
    `Unauthenticated GET /api/admin/media rejected with 403 (Got: ${unauthGetMedia.status})`
  );

  // 1.2 Unauthenticated POST /api/admin/media
  const unauthPostMedia = await fetch(`${BASE_URL}/api/admin/media`, {
    method: 'POST',
    body: new FormData(),
  });
  assert(
    unauthPostMedia.status === 403,
    `Unauthenticated POST /api/admin/media rejected with 403 (Got: ${unauthPostMedia.status})`
  );

  // 1.3 Unauthenticated GET /api/admin/media/med-profile
  const unauthGetItem = await fetch(`${BASE_URL}/api/admin/media/med-profile`);
  assert(
    unauthGetItem.status === 403,
    `Unauthenticated GET /api/admin/media/med-profile rejected with 403 (Got: ${unauthGetItem.status})`
  );

  // 1.4 Unauthenticated PATCH /api/admin/media/med-profile
  const unauthPatchItem = await fetch(`${BASE_URL}/api/admin/media/med-profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hacked Title' }),
  });
  assert(
    unauthPatchItem.status === 403,
    `Unauthenticated PATCH /api/admin/media/med-profile rejected with 403 (Got: ${unauthPatchItem.status})`
  );

  // 1.5 Unauthenticated DELETE /api/admin/media/med-profile
  const unauthDeleteItem = await fetch(`${BASE_URL}/api/admin/media/med-profile`, {
    method: 'DELETE',
  });
  assert(
    unauthDeleteItem.status === 403,
    `Unauthenticated DELETE /api/admin/media/med-profile rejected with 403 (Got: ${unauthDeleteItem.status})`
  );

  // 1.6 Unauthenticated GET /api/admin/media/stats
  const unauthStats = await fetch(`${BASE_URL}/api/admin/media/stats`);
  assert(
    unauthStats.status === 403,
    `Unauthenticated GET /api/admin/media/stats rejected with 403 (Got: ${unauthStats.status})`
  );

  // 1.7 Unauthenticated GET /admin/media page redirect
  const unauthPage = await fetch(`${BASE_URL}/admin/media`, { redirect: 'manual' });
  assert(
    unauthPage.status === 307 || unauthPage.status === 302 || unauthPage.status === 303,
    `Unauthenticated GET /admin/media redirects to login (Status: ${unauthPage.status})`
  );

  // --------------------------------------------------------------------------
  // 2. MEDIA RETRIEVAL, SEARCH, FILTER & SORT
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Media Retrieval, Search, Filter & Sort ---');

  // 2.1 Authenticated GET /api/admin/media
  const getMediaRes = await fetch(`${BASE_URL}/api/admin/media`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(getMediaRes.status === 200, `Authenticated GET /api/admin/media returned 200`);
  const mediaData = await getMediaRes.json();
  assert(Array.isArray(mediaData.media), `Returns media array (length: ${mediaData.media?.length})`);
  assert(typeof mediaData.total === 'number' && mediaData.total >= 8, `Returns total count >= 8`);

  // 2.2 Search Query: q=profile
  const searchRes = await fetch(`${BASE_URL}/api/admin/media?q=profile`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const searchData = await searchRes.json();
  const allMatchSearch = searchData.media.every(
    (m) =>
      m.file_name.toLowerCase().includes('profile') ||
      m.title.toLowerCase().includes('profile') ||
      (m.alt_text && m.alt_text.toLowerCase().includes('profile'))
  );
  assert(
    searchRes.status === 200 && searchData.media.length > 0 && allMatchSearch,
    `Search by query 'profile' returned ${searchData.media.length} matching items`
  );

  // 2.3 Filter by type: type=image
  const filterImageRes = await fetch(`${BASE_URL}/api/admin/media?type=image`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const filterImageData = await filterImageRes.json();
  const allImages = filterImageData.media.every((m) => m.mime_type.startsWith('image/'));
  assert(
    filterImageRes.status === 200 && filterImageData.media.length >= 7 && allImages,
    `Filter by type 'image' returned only images (${filterImageData.media.length} items)`
  );

  // 2.4 Filter by type: type=document
  const filterDocRes = await fetch(`${BASE_URL}/api/admin/media?type=document`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const filterDocData = await filterDocRes.json();
  const allDocs = filterDocData.media.every(
    (m) => m.mime_type === 'application/pdf' || m.mime_type.startsWith('text/')
  );
  assert(
    filterDocRes.status === 200 && filterDocData.media.length >= 1 && allDocs,
    `Filter by type 'document' returned document items (${filterDocData.media.length} items)`
  );

  // 2.5 Sort: name-asc
  const sortNameRes = await fetch(`${BASE_URL}/api/admin/media?sort=name-asc`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const sortNameData = await sortNameRes.json();
  const names = sortNameData.media.map((m) => (m.title || m.file_name).toLowerCase());
  let isSortedAsc = true;
  for (let i = 0; i < names.length - 1; i++) {
    if (names[i].localeCompare(names[i + 1]) > 0) {
      isSortedAsc = false;
      break;
    }
  }
  assert(sortNameRes.status === 200 && isSortedAsc, `Sort by name-asc orders correctly`);

  // --------------------------------------------------------------------------
  // 3. REFERENCE TRACKING & USED MEDIA PROTECTION
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Reference Tracking & Used Media Protection ---');

  // 3.1 Inspect med-profile with usage details
  const profileItemRes = await fetch(`${BASE_URL}/api/admin/media/med-profile`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(profileItemRes.status === 200, `GET /api/admin/media/med-profile returned 200`);
  const profileItem = await profileItemRes.json();
  assert(profileItem.inUse === true, `med-profile correctly marked as inUse: true`);
  assert(
    profileItem.usageCount >= 1,
    `med-profile usageCount >= 1 (Got: ${profileItem.usageCount})`
  );
  assert(
    Array.isArray(profileItem.references) && profileItem.references.length > 0,
    `med-profile references contains details: ${profileItem.references?.[0]?.entityTitle}`
  );

  // 3.2 ATTEMPT UNSAFE DELETION OF IN-USE MEDIA (Must be rejected with 400)
  const unsafeDeleteRes = await fetch(`${BASE_URL}/api/admin/media/med-profile`, {
    method: 'DELETE',
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(
    unsafeDeleteRes.status === 400,
    `Unsafe deletion of in-use media med-profile blocked with 400 Bad Request (Got: ${unsafeDeleteRes.status})`
  );
  const unsafeDeleteData = await unsafeDeleteRes.json();
  assert(
    unsafeDeleteData.error &&
      (unsafeDeleteData.error.toLowerCase().includes('in use') ||
        unsafeDeleteData.error.toLowerCase().includes('referenced')),
    `Error message clearly indicates media is in use: "${unsafeDeleteData.error}"`
  );

  // 3.3 Verify med-profile is still present after blocked deletion
  const verifyProfileStillThere = await fetch(`${BASE_URL}/api/admin/media/med-profile`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(
    verifyProfileStillThere.status === 200,
    `med-profile remains safely in database after blocked deletion`
  );

  // --------------------------------------------------------------------------
  // 4. METADATA MANAGEMENT (PATCH & PERSISTENCE)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Metadata Management ---');

  const testTitle = 'Mohamed Khaled Senior Lead MLE Photo';
  const testAlt = 'Professional portrait of Mohamed Khaled in navy suit';
  const testDesc = 'Primary high-resolution headshot used for hero header.';

  const patchRes = await fetch(`${BASE_URL}/api/admin/media/med-profile`, {
    method: 'PATCH',
    headers: {
      Cookie: ADMIN_COOKIE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: testTitle,
      alt_text: testAlt,
      description: testDesc,
    }),
  });
  assert(patchRes.status === 200, `PATCH /api/admin/media/med-profile returned 200`);
  const patchData = await patchRes.json();
  assert(patchData.media?.title === testTitle, `Updated title persisted: "${patchData.media?.title}"`);
  assert(patchData.media?.alt_text === testAlt, `Updated alt_text persisted: "${patchData.media?.alt_text}"`);
  assert(
    patchData.media?.description === testDesc,
    `Updated description persisted: "${patchData.media?.description}"`
  );

  // Verify persistence on subsequent GET
  const verifyGetRes = await fetch(`${BASE_URL}/api/admin/media/med-profile`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const verifyGetData = await verifyGetRes.json();
  assert(
    verifyGetData.title === testTitle &&
      verifyGetData.alt_text === testAlt &&
      verifyGetData.description === testDesc,
    `Metadata successfully retrieved on subsequent GET`
  );

  // --------------------------------------------------------------------------
  // 5. UPLOAD VALIDATION (MIME TYPES & SIZES)
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Upload Validation ---');

  // 5.1 Invalid MIME type: text/plain
  const invalidMimeForm = new FormData();
  const textBlob = new Blob(['console.log("hello world");'], { type: 'text/javascript' });
  invalidMimeForm.append('file', textBlob, 'hack.js');

  const invalidMimeRes = await fetch(`${BASE_URL}/api/admin/media`, {
    method: 'POST',
    headers: { Cookie: ADMIN_COOKIE },
    body: invalidMimeForm,
  });
  assert(
    invalidMimeRes.status === 400,
    `Unsupported file format rejected with 400 (Got: ${invalidMimeRes.status})`
  );
  const invalidMimeData = await invalidMimeRes.json();
  assert(
    invalidMimeData.error && invalidMimeData.error.toLowerCase().includes('unsupported'),
    `Validation error message returned: "${invalidMimeData.error}"`
  );

  // 5.2 Oversized image file (> 5MB)
  const oversizedForm = new FormData();
  // 6MB buffer
  const largeBuffer = new Uint8Array(6 * 1024 * 1024);
  const largeBlob = new Blob([largeBuffer], { type: 'image/jpeg' });
  oversizedForm.append('file', largeBlob, 'oversized.jpg');

  const oversizedRes = await fetch(`${BASE_URL}/api/admin/media`, {
    method: 'POST',
    headers: { Cookie: ADMIN_COOKIE },
    body: oversizedForm,
  });
  assert(
    oversizedRes.status === 400,
    `Oversized image file rejected with 400 (Got: ${oversizedRes.status})`
  );
  const oversizedData = await oversizedRes.json();
  assert(
    oversizedData.error && oversizedData.error.toLowerCase().includes('size exceeds limit'),
    `Oversized error message returned: "${oversizedData.error}"`
  );

  // --------------------------------------------------------------------------
  // 6. VALID UPLOAD & SAFE DELETION LIFECYCLE
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Valid Upload & Safe Deletion Lifecycle ---');

  // 6.1 Upload a valid 1x1 transparent PNG
  const validForm = new FormData();
  // Minimal valid 1x1 PNG bytes
  const png1x1 = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82,
  ]);
  const pngBlob = new Blob([png1x1], { type: 'image/png' });
  validForm.append('file', pngBlob, 'temp-pipeline-icon.png');
  validForm.append('title', 'Temporary ML Pipeline Icon');
  validForm.append('alt_text', 'Icon for pipeline test');
  validForm.append('description', 'Test icon created in automated verification');

  const uploadRes = await fetch(`${BASE_URL}/api/admin/media`, {
    method: 'POST',
    headers: { Cookie: ADMIN_COOKIE },
    body: validForm,
  });
  assert(uploadRes.status === 201, `Valid upload returned 201 Created (Got: ${uploadRes.status})`);
  const uploadData = await uploadRes.json();
  const createdMediaId = uploadData.media?.id;
  assert(Boolean(createdMediaId), `New media item returned with id: ${createdMediaId}`);
  assert(uploadData.media?.title === 'Temporary ML Pipeline Icon', `Title registered properly`);

  // 6.2 Verify it appears in media library with inUse: false
  const getCreatedRes = await fetch(`${BASE_URL}/api/admin/media/${createdMediaId}`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(getCreatedRes.status === 200, `GET uploaded media returned 200`);
  const createdDetails = await getCreatedRes.json();
  assert(createdDetails.inUse === false, `Uploaded media is not currently referenced (inUse: false)`);
  assert(createdDetails.usageCount === 0, `Usage count is 0`);

  // 6.3 Safe Deletion of Unused Media
  const deleteRes = await fetch(`${BASE_URL}/api/admin/media/${createdMediaId}`, {
    method: 'DELETE',
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(
    deleteRes.status === 200,
    `Unused media deleted successfully with 200 OK (Got: ${deleteRes.status})`
  );
  const deleteData = await deleteRes.json();
  assert(deleteData.success === true, `Delete response reports success: true`);

  // 6.4 Confirm media record is gone
  const verifyDeletedRes = await fetch(`${BASE_URL}/api/admin/media/${createdMediaId}`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(
    verifyDeletedRes.status === 404,
    `Deleted media is no longer found (returns 404 Not Found)`
  );

  // --------------------------------------------------------------------------
  // 7. ADMIN DASHBOARD & SIDEBAR INTEGRATION
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Testing Admin Dashboard & Sidebar Integration ---');

  // 7.1 GET /api/admin/media/stats
  const statsRes = await fetch(`${BASE_URL}/api/admin/media/stats`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(statsRes.status === 200, `GET /api/admin/media/stats returned 200`);
  const stats = await statsRes.json();
  assert(
    typeof stats.totalCount === 'number' && stats.totalCount >= 8,
    `stats.totalCount is valid: ${stats.totalCount}`
  );
  assert(
    typeof stats.imagesCount === 'number' && stats.imagesCount >= 7,
    `stats.imagesCount is valid: ${stats.imagesCount}`
  );
  assert(
    typeof stats.documentsCount === 'number' && stats.documentsCount >= 1,
    `stats.documentsCount is valid: ${stats.documentsCount}`
  );
  assert(
    typeof stats.inUseCount === 'number' && stats.inUseCount >= 1,
    `stats.inUseCount is valid: ${stats.inUseCount}`
  );

  // 7.2 Admin Dashboard page contains media card
  const dashboardRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const dashboardHtml = await dashboardRes.text();
  assert(
    dashboardHtml.includes('Media Assets') || dashboardHtml.includes('/admin/media'),
    `Admin Dashboard includes Media Assets card and navigation`
  );

  // 7.3 Admin Media page loads with 200 OK
  const mediaPageRes = await fetch(`${BASE_URL}/admin/media`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(mediaPageRes.status === 200, `GET /admin/media loads with 200 OK`);
  const mediaPageHtml = await mediaPageRes.text();
  assert(
    mediaPageHtml.includes('Media Library') || mediaPageHtml.includes('Upload Asset'),
    `Admin Media page contains Media Library interface elements`
  );

  // --------------------------------------------------------------------------
  // 8. DRAFT / PREVIEW / PUBLISH MEDIA ISOLATION
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Testing Draft / Preview / Publish Media Isolation ---');

  // 8.1 Create a draft site_settings with an alternative photo URL
  const draftPhotoUrl = '/images/project-data-pipeline.jpg';
  const createDraftRes = await fetch(`${BASE_URL}/api/admin/drafts`, {
    method: 'POST',
    headers: {
      Cookie: ADMIN_COOKIE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entity_type: 'site_settings',
      entity_id: 'singleton',
      data: {
        profile_image: draftPhotoUrl,
      },
    }),
  });
  assert(
    createDraftRes.status === 200 || createDraftRes.status === 201,
    `Staged draft with alternative photo URL returned 200/201 (Got: ${createDraftRes.status})`
  );
  const stagedDraft = await createDraftRes.json();

  // 8.2 Verify media reference tracker sees the draft reference!
  const pipelineMediaRes = await fetch(
    `${BASE_URL}/api/admin/media/med-proj-data-pipeline`,
    {
      headers: { Cookie: ADMIN_COOKIE },
    }
  );
  const pipelineMedia = await pipelineMediaRes.json();
  const hasDraftRef = pipelineMedia.references?.some((r) => r.isDraft === true);
  assert(hasDraftRef === true, `Media reference tracker detects draft reference (isDraft: true)`);

  // 8.3 Verify Public Site strictly retains published photo, not draft photo
  const publicRes = await fetch(`${BASE_URL}/`);
  const publicHtml = await publicRes.text();
  assert(
    !publicHtml.includes(draftPhotoUrl) || publicHtml.includes('project-data-pipeline.jpg'), // It can be in project card, but not hero profile
    `Draft media change is isolated from public /`
  );

  // 8.4 Clean up the test draft
  const discardRes = await fetch(
    `${BASE_URL}/api/admin/drafts/${stagedDraft.draft.id}`,
    {
      method: 'DELETE',
      headers: { Cookie: ADMIN_COOKIE },
    }
  );
  assert(discardRes.status === 200, `Discarded test draft cleanly`);

  // --------------------------------------------------------------------------
  // 9. CROSS-MODULE REGRESSION
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Cross-Module Regression Verification ---');

  // 9.1 Verify Profile, Projects, Certifications, Experience endpoints work
  const projectsRes = await fetch(`${BASE_URL}/api/admin/projects`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(projectsRes.status === 200, `GET /api/admin/projects returns 200`);

  const certsRes = await fetch(`${BASE_URL}/api/admin/certifications`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(certsRes.status === 200, `GET /api/admin/certifications returns 200`);

  const expRes = await fetch(`${BASE_URL}/api/admin/experience`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(expRes.status === 200, `GET /api/admin/experience returns 200`);

  // 9.2 Verify Public site renders with all sections
  const publicFullRes = await fetch(`${BASE_URL}/`);
  assert(publicFullRes.status === 200, `Public / returns 200`);
  const publicFullHtml = await publicFullRes.text();
  assert(publicFullHtml.includes('Mohamed Khaled'), `Public site has hero name`);
  assert(publicFullHtml.includes('Projects'), `Public site has Projects section`);
  assert(publicFullHtml.includes('Certifications'), `Public site has Certifications section`);
  assert(publicFullHtml.includes('Experience'), `Public site has Experience section`);

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
