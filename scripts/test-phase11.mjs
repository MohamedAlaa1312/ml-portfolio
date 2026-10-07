/**
 * Phase 11 Verification Test Suite
 * Tests Contact CMS, Social CMS, Validation, Ordering, Enable/Disable,
 * Public Integration, Single Source of Truth, Security/Authorization, and Public Regressions.
 */

const BASE_URL = 'http://localhost:3000';
const ADMIN_COOKIE = 'sb-admin-auth-preview=active';

async function runTests() {
  console.log('==========================================================');
  console.log('🚀 STARTING PHASE 11 CONTACT + SOCIAL CMS VERIFICATION');
  console.log('==========================================================\n');

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

  // --------------------------------------------------------------------------
  // 1. SECURITY & AUTHORIZATION TESTS
  // --------------------------------------------------------------------------
  console.log('--- 1. Testing Security & Authorization ---');

  // 1.1 Unauthenticated Contact GET
  const unauthContactGet = await fetch(`${BASE_URL}/api/admin/contact`);
  assert(
    unauthContactGet.status === 403,
    `Unauthenticated GET /api/admin/contact rejected with 403 (Got: ${unauthContactGet.status})`
  );

  // 1.2 Unauthenticated Contact POST
  const unauthContactPost = await fetch(`${BASE_URL}/api/admin/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contactInfo: { email: 'test@example.com' } }),
  });
  assert(
    unauthContactPost.status === 403,
    `Unauthenticated POST /api/admin/contact rejected with 403 (Got: ${unauthContactPost.status})`
  );

  // 1.3 Unauthenticated Social GET
  const unauthSocialGet = await fetch(`${BASE_URL}/api/admin/social`);
  assert(
    unauthSocialGet.status === 403,
    `Unauthenticated GET /api/admin/social rejected with 403 (Got: ${unauthSocialGet.status})`
  );

  // 1.4 Unauthenticated Social POST
  const unauthSocialPost = await fetch(`${BASE_URL}/api/admin/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'Test', url: 'https://test.com' }),
  });
  assert(
    unauthSocialPost.status === 403,
    `Unauthenticated POST /api/admin/social rejected with 403 (Got: ${unauthSocialPost.status})`
  );

  // 1.5 Unauthenticated Social Reorder
  const unauthSocialReorder = await fetch(`${BASE_URL}/api/admin/social/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds: ['fake-id'] }),
  });
  assert(
    unauthSocialReorder.status === 403,
    `Unauthenticated POST /api/admin/social/reorder rejected with 403 (Got: ${unauthSocialReorder.status})`
  );

  // 1.6 Unauthenticated Social DELETE
  const unauthSocialDelete = await fetch(`${BASE_URL}/api/admin/social/test-id`, {
    method: 'DELETE',
  });
  assert(
    unauthSocialDelete.status === 403,
    `Unauthenticated DELETE /api/admin/social/[id] rejected with 403 (Got: ${unauthSocialDelete.status})`
  );

  // 1.7 Unauthenticated Admin Page Access
  const unauthPage = await fetch(`${BASE_URL}/admin/contact`, {
    redirect: 'manual',
  });
  assert(
    unauthPage.status === 307 || unauthPage.status === 302,
    `Unauthenticated GET /admin/contact redirects to login (Status: ${unauthPage.status})`
  );

  // --------------------------------------------------------------------------
  // 2. CONTACT VALIDATION TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Contact Validation Rules ---');

  // 2.1 Invalid Email Format
  const badEmailRes = await fetch(`${BASE_URL}/api/admin/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      contactInfo: { email: 'not-an-email-format' },
    }),
  });
  const badEmailData = await badEmailRes.json();
  assert(
    badEmailRes.status === 400 && badEmailData.error?.includes('valid email address'),
    `Malformed email rejected with 400: "${badEmailData.error}"`
  );

  // 2.2 Invalid CTA URL Format
  const badCtaRes = await fetch(`${BASE_URL}/api/admin/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      sectionContent: { ctaUrl: 'javascript:alert(1)' },
    }),
  });
  const badCtaData = await badCtaRes.json();
  assert(
    badCtaRes.status === 400 && badCtaData.error?.includes('valid CTA URL'),
    `Malicious/unsafe CTA URL rejected with 400: "${badCtaData.error}"`
  );

  // 2.3 Invalid Publish Status
  const badStatusRes = await fetch(`${BASE_URL}/api/admin/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      sectionContent: { status: 'invalid-status' },
    }),
  });
  assert(
    badStatusRes.status === 400,
    `Invalid status rejected with 400 (Got: ${badStatusRes.status})`
  );

  // --------------------------------------------------------------------------
  // 3. SOCIAL VALIDATION TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Social Validation Rules ---');

  // 3.1 Missing Platform
  const noPlatformRes = await fetch(`${BASE_URL}/api/admin/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ platform: '', url: 'https://github.com/mohamed' }),
  });
  assert(
    noPlatformRes.status === 400,
    `Empty social platform rejected with 400 Bad Request (Got: ${noPlatformRes.status})`
  );

  // 3.2 Missing URL
  const noUrlRes = await fetch(`${BASE_URL}/api/admin/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ platform: 'GitHub', url: '' }),
  });
  assert(
    noUrlRes.status === 400,
    `Empty social URL rejected with 400 Bad Request (Got: ${noUrlRes.status})`
  );

  // 3.3 Malicious / Unsafe URL
  const unsafeUrlRes = await fetch(`${BASE_URL}/api/admin/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ platform: 'Hacker', url: 'javascript:window.location="http://evil.com"' }),
  });
  assert(
    unsafeUrlRes.status === 400,
    `Unsafe javascript: protocol rejected with 400 Bad Request (Got: ${unsafeUrlRes.status})`
  );

  // --------------------------------------------------------------------------
  // 4. CONTACT SAVE & PERSISTENCE TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Contact Save & CMS Persistence ---');

  const validContactUpdate = await fetch(`${BASE_URL}/api/admin/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      contactInfo: {
        email: 'mohamed.mle@ai-solutions.org',
        phone: '+20 100 999 8888',
        location: 'Cairo, Egypt (Remote Available)',
      },
      sectionContent: {
        badge: 'Direct Connect',
        title: 'Let’s Build Intelligent Systems',
        subtitle: 'Reach out to discuss machine learning architectures and production AI pipelines.',
        description: 'Available for technical leadership, consulting, and end-to-end ML deployments.',
        availabilityText: '🟢 Available for ML Opportunities',
        ctaText: 'Schedule a Technical Discussion',
        ctaUrl: 'https://cal.com/mohamed-mle/intro',
        enabled: true,
        status: 'published',
      },
    }),
  });
  const validContactData = await validContactUpdate.json();
  assert(
    validContactUpdate.status === 200 && validContactData.success,
    `Valid contact update succeeded (Status: ${validContactUpdate.status})`
  );

  // Verify persistence via GET /api/admin/contact
  const verifyContactGet = await fetch(`${BASE_URL}/api/admin/contact`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const contactGetData = await verifyContactGet.json();
  assert(
    contactGetData.siteSettings?.email === 'mohamed.mle@ai-solutions.org',
    `Persisted email matches: "${contactGetData.siteSettings?.email}"`
  );
  assert(
    contactGetData.contactSection?.content?.title === 'Let’s Build Intelligent Systems',
    `Persisted section title matches: "${contactGetData.contactSection?.content?.title}"`
  );
  assert(
    contactGetData.contactSection?.content?.availabilityText === '🟢 Available for ML Opportunities',
    `Persisted availability matches: "${contactGetData.contactSection?.content?.availabilityText}"`
  );

  // --------------------------------------------------------------------------
  // 5. SOCIAL CRUD TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Social CMS CRUD Lifecycle ---');

  // 5.1 Create new Social Link (e.g. Kaggle)
  const createKaggleRes = await fetch(`${BASE_URL}/api/admin/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      platform: 'Kaggle',
      label: 'Kaggle Grandmaster',
      url: 'https://kaggle.com/mohamed_khaled',
      enabled: true,
      display_order: 10,
    }),
  });
  const kaggleData = await createKaggleRes.json();
  assert(
    createKaggleRes.status === 200 && kaggleData.success,
    `Created social link "Kaggle" (ID: ${kaggleData.socialLink?.id})`
  );
  const kaggleId = kaggleData.socialLink?.id;

  // 5.2 Read all Social Links and verify Kaggle is present
  const listRes = await fetch(`${BASE_URL}/api/admin/social`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const listData = await listRes.json();
  const foundKaggle = listData.socialLinks?.find((s) => s.id === kaggleId);
  assert(
    foundKaggle && foundKaggle.platform === 'Kaggle',
    `Retrieved Kaggle link successfully from authoritative source`
  );

  // 5.3 Edit Social Link (update URL and label)
  const updateKaggleRes = await fetch(`${BASE_URL}/api/admin/social/${kaggleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      label: 'Kaggle Competitions Master',
      url: 'https://kaggle.com/mohamed_khaled_mle',
    }),
  });
  const updateKaggleData = await updateKaggleRes.json();
  assert(
    updateKaggleRes.status === 200 &&
      updateKaggleData.socialLink?.label === 'Kaggle Competitions Master',
    `Updated Kaggle label to: "${updateKaggleData.socialLink?.label}"`
  );

  // --------------------------------------------------------------------------
  // 6. SOCIAL ORDERING TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Social Reordering ---');

  // Fetch current links
  const beforeReorderRes = await fetch(`${BASE_URL}/api/admin/social`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const beforeList = (await beforeReorderRes.json()).socialLinks || [];
  assert(beforeList.length >= 2, `Sufficient social links available for ordering (${beforeList.length})`);

  // Move Kaggle to the first position
  const reorderedIds = [kaggleId, ...beforeList.filter((s) => s.id !== kaggleId).map((s) => s.id)];
  const reorderRes = await fetch(`${BASE_URL}/api/admin/social/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ orderedIds: reorderedIds }),
  });
  const reorderData = await reorderRes.json();
  assert(
    reorderRes.status === 200 && reorderData.success,
    `Social reorder API succeeded: "${reorderData.message}"`
  );

  // Verify that Kaggle now has display_order: 1
  const afterReorderRes = await fetch(`${BASE_URL}/api/admin/social`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const afterList = (await afterReorderRes.json()).socialLinks || [];
  const firstItem = afterList[0];
  assert(
    firstItem?.id === kaggleId && firstItem?.display_order === 1,
    `Kaggle is now verified in first position (display_order: 1)`
  );

  // --------------------------------------------------------------------------
  // 7. SOCIAL ENABLE / DISABLE TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Testing Social Visibility Toggle ---');

  // Toggle disabled
  const disableRes = await fetch(`${BASE_URL}/api/admin/social/${kaggleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ enabled: false }),
  });
  const disableData = await disableRes.json();
  assert(
    disableRes.status === 200 && disableData.socialLink?.enabled === false,
    `Kaggle link disabled successfully (enabled: false)`
  );

  // Verify public HTML does NOT contain the disabled Kaggle link
  const publicRes1 = await fetch(`${BASE_URL}/`);
  const publicHtml1 = await publicRes1.text();
  assert(
    !publicHtml1.includes('Kaggle Competitions Master'),
    `Disabled Kaggle link is strictly hidden from public HTML`
  );

  // Re-enable
  const enableRes = await fetch(`${BASE_URL}/api/admin/social/${kaggleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ enabled: true }),
  });
  const enableData = await enableRes.json();
  assert(
    enableRes.status === 200 && enableData.socialLink?.enabled === true,
    `Kaggle link re-enabled successfully (enabled: true)`
  );

  // Verify public HTML NOW contains the Kaggle link
  const publicRes2 = await fetch(`${BASE_URL}/`);
  const publicHtml2 = await publicRes2.text();
  assert(
    publicHtml2.includes('Kaggle Competitions Master') || publicHtml2.includes('kaggle.com/mohamed_khaled_mle'),
    `Re-enabled Kaggle link appears in public HTML`
  );

  // --------------------------------------------------------------------------
  // 8. SOCIAL DELETE & CLEANUP TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Testing Social Deletion & Cleanup ---');

  const deleteRes = await fetch(`${BASE_URL}/api/admin/social/${kaggleId}`, {
    method: 'DELETE',
    headers: { Cookie: ADMIN_COOKIE },
  });
  const deleteData = await deleteRes.json();
  assert(
    deleteRes.status === 200 && deleteData.success,
    `Deleted Kaggle link successfully`
  );

  // Verify it is gone from admin
  const verifyDeleteRes = await fetch(`${BASE_URL}/api/admin/social`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const verifyDeleteList = (await verifyDeleteRes.json()).socialLinks || [];
  assert(
    !verifyDeleteList.some((s) => s.id === kaggleId),
    `Kaggle link confirmed deleted from authoritative database store`
  );

  // --------------------------------------------------------------------------
  // 9. PUBLIC INTEGRATION & OPTIONAL FIELDS (Requirement 28)
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Testing Public Integration & Optional Fields ---');

  // Verify public Contact section consumes updated CMS data
  const publicRes = await fetch(`${BASE_URL}/`);
  const publicHtml = await publicRes.text();

  assert(
    publicHtml.includes('mohamed.mle@ai-solutions.org'),
    `Public Contact displays CMS email: "mohamed.mle@ai-solutions.org"`
  );
  assert(
    publicHtml.includes('Let’s Build Intelligent Systems'),
    `Public Contact displays CMS section title: "Let’s Build Intelligent Systems"`
  );
  assert(
    publicHtml.includes('🟢 Available for ML Opportunities'),
    `Public Contact displays CMS availability status badge`
  );
  assert(
    publicHtml.includes('Schedule a Technical Discussion'),
    `Public Contact displays CMS-driven CTA button`
  );

  // Test optional fields: clear phone and location, verify no empty phone/location row renders
  await fetch(`${BASE_URL}/api/admin/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      contactInfo: {
        email: 'mohamed.mle@ai-solutions.org',
        phone: '', // empty
        location: '', // empty
      },
    }),
  });

  const publicNoPhoneRes = await fetch(`${BASE_URL}/`);
  const publicNoPhoneHtml = await publicNoPhoneRes.text();
  assert(
    !publicNoPhoneHtml.includes('tel:'),
    `When phone is empty, no broken/empty phone link is rendered (Requirement 28)`
  );

  // Restore phone and location for production elegance
  await fetch(`${BASE_URL}/api/admin/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      contactInfo: {
        email: 'mohamed@example.com',
        phone: '+20 100 123 4567',
        location: 'Cairo, Egypt',
      },
      sectionContent: {
        badge: 'Contact',
        title: 'Get In Touch',
        subtitle: 'Feel free to reach out for collaborations, opportunities or just to say hello!',
        availabilityText: '🟢 Available for Machine Learning roles & AI consulting',
        ctaText: 'Schedule a Call',
        ctaUrl: 'https://cal.com/mohamed/call',
        enabled: true,
        status: 'published',
      },
    }),
  });

  // --------------------------------------------------------------------------
  // 10. PUBLIC REGRESSION TESTS (Requirement 56)
  // --------------------------------------------------------------------------
  console.log('\n--- 10. Testing Public Regressions (All Sections Functional) ---');

  const finalPublicRes = await fetch(`${BASE_URL}/`);
  const finalHtml = await finalPublicRes.text();

  assert(finalHtml.includes('id="hero"'), `Hero section remains intact (#hero)`);
  assert(finalHtml.includes('id="about"'), `About section remains intact (#about)`);
  assert(finalHtml.includes('id="experience"'), `Experience section remains intact (#experience)`);
  assert(finalHtml.includes('id="skills"'), `Skills section remains intact (#skills)`);
  assert(finalHtml.includes('id="projects"'), `Projects section remains intact (#projects)`);
  assert(finalHtml.includes('id="certifications"'), `Certifications section remains intact (#certifications)`);
  assert(finalHtml.includes('id="contact"'), `Contact section remains intact (#contact)`);

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n==========================================================');
  console.log(`📊 PHASE 11 VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
