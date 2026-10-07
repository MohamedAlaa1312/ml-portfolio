/**
 * Phase 10 Verification Test Suite
 * Tests Certifications CMS, Certification CRUD, Date Validation, Credential Fields,
 * Media References, Reordering, Status/Visibility Filtering, Security/Authorization,
 * and Public Portfolio Integration.
 */

const BASE_URL = 'http://localhost:3000';
const ADMIN_COOKIE = 'sb-admin-auth-preview=active';

async function runTests() {
  console.log('==========================================================');
  console.log('🚀 STARTING PHASE 10 CERTIFICATIONS CMS VERIFICATION SUITE');
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

  // 1.1 Unauthenticated Certifications GET
  const unauthGet = await fetch(`${BASE_URL}/api/admin/certifications`);
  assert(
    unauthGet.status === 403,
    `Unauthenticated GET /api/admin/certifications rejected with 403 (Got: ${unauthGet.status})`
  );

  // 1.2 Unauthenticated Certifications POST
  const unauthPost = await fetch(`${BASE_URL}/api/admin/certifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test Cert', issuer: 'Test Issuer', issue_date: '2023-01-01' }),
  });
  assert(
    unauthPost.status === 403,
    `Unauthenticated POST /api/admin/certifications rejected with 403 (Got: ${unauthPost.status})`
  );

  // 1.3 Unauthenticated Certifications Reorder POST
  const unauthReorder = await fetch(`${BASE_URL}/api/admin/certifications/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds: ['fake-id'] }),
  });
  assert(
    unauthReorder.status === 403,
    `Unauthenticated POST /api/admin/certifications/reorder rejected with 403 (Got: ${unauthReorder.status})`
  );

  // 1.4 Unauthenticated Certifications DELETE
  const unauthDelete = await fetch(`${BASE_URL}/api/admin/certifications/test-id`, {
    method: 'DELETE',
  });
  assert(
    unauthDelete.status === 403,
    `Unauthenticated DELETE /api/admin/certifications/[id] rejected with 403 (Got: ${unauthDelete.status})`
  );

  // 1.5 Unauthenticated Admin Page Visit
  const unauthPage = await fetch(`${BASE_URL}/admin/certifications`, {
    redirect: 'manual',
  });
  assert(
    unauthPage.status === 307 || unauthPage.status === 302,
    `Unauthenticated GET /admin/certifications redirects to login (Status: ${unauthPage.status})`
  );

  // --------------------------------------------------------------------------
  // 2. VALIDATION RULE TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Certification Validation Rules ---');

  // 2.1 Missing Title
  const noTitleRes = await fetch(`${BASE_URL}/api/admin/certifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      issuer: 'DeepLearning.AI',
      issue_date: '2023-05-15',
    }),
  });
  assert(
    noTitleRes.status === 400,
    `Missing certification title rejected with 400 Bad Request (Got: ${noTitleRes.status})`
  );

  // 2.2 Missing Issuer
  const noIssuerRes = await fetch(`${BASE_URL}/api/admin/certifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      title: 'MLOps Specialization',
      issue_date: '2023-05-15',
    }),
  });
  assert(
    noIssuerRes.status === 400,
    `Missing issuer rejected with 400 Bad Request (Got: ${noIssuerRes.status})`
  );

  // 2.3 Missing Issue Date
  const noDateRes = await fetch(`${BASE_URL}/api/admin/certifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      title: 'MLOps Specialization',
      issuer: 'DeepLearning.AI',
    }),
  });
  assert(
    noDateRes.status === 400,
    `Missing issue date rejected with 400 Bad Request (Got: ${noDateRes.status})`
  );

  // 2.4 Expiration Date Preceding Issue Date
  const invalidDateRes = await fetch(`${BASE_URL}/api/admin/certifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      title: 'MLOps Specialization',
      issuer: 'DeepLearning.AI',
      issue_date: '2023-05-15',
      expiration_date: '2022-01-01',
    }),
  });
  assert(
    invalidDateRes.status === 400,
    `Expiration date preceding issue date rejected with 400 (Got: ${invalidDateRes.status})`
  );

  // 2.5 Invalid Credential URL
  const invalidUrlRes = await fetch(`${BASE_URL}/api/admin/certifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      title: 'MLOps Specialization',
      issuer: 'DeepLearning.AI',
      issue_date: '2023-05-15',
      credential_url: 'javascript:alert(1)',
    }),
  });
  assert(
    invalidUrlRes.status === 400,
    `Invalid URL rejected with 400 Bad Request (Got: ${invalidUrlRes.status})`
  );

  // --------------------------------------------------------------------------
  // 3. CRUD & REORDER OPERATIONS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Certification CRUD Operations ---');

  // 3.1 Fetch initial certifications
  const getCertsRes = await fetch(`${BASE_URL}/api/admin/certifications`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(getCertsRes.status === 200, 'Authenticated GET /api/admin/certifications returns 200');
  const initialCertsData = await getCertsRes.json();
  const initialCount = initialCertsData.certifications?.length || 0;
  assert(initialCount >= 4, `Existing certifications retrieved (${initialCount} found)`);

  // 3.2 Create new certification
  const timestamp = Date.now();
  const newCertPayload = {
    title: `TensorFlow Developer Certificate ${timestamp}`,
    issuer: 'Google',
    issue_date: '2023-04-10',
    expiration_date: '2026-04-10',
    credential_id: `TF-CERT-${timestamp}`,
    credential_url: `https://www.credential.net/verify/${timestamp}`,
    image_url: '/images/certificate-tf.png',
    description: 'Practical competency in building and training neural networks using TensorFlow.',
    display_order: 10,
    enabled: true,
    status: 'published',
  };

  const createRes = await fetch(`${BASE_URL}/api/admin/certifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify(newCertPayload),
  });
  assert(createRes.status === 200, 'POST /api/admin/certifications returns 200 OK');
  const createData = await createRes.json();
  const createdCert = createData.certification;
  assert(
    createdCert && createdCert.title === newCertPayload.title,
    `Created certification "${createdCert?.title}"`
  );
  assert(
    createdCert?.issuer === 'Google' && createdCert?.credential_id === `TF-CERT-${timestamp}`,
    'Issuer and Credential ID properly saved'
  );

  // 3.3 Get certification by ID
  const getByIdRes = await fetch(`${BASE_URL}/api/admin/certifications/${createdCert.id}`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(getByIdRes.status === 200, 'GET /api/admin/certifications/[id] returns 200 OK');
  const byIdData = await getByIdRes.json();
  assert(byIdData.certification?.id === createdCert.id, 'Fetched certification matches created ID');

  // 3.4 Update certification
  const updatedDesc = 'Advanced hands-on certification in computer vision and NLP models in TensorFlow.';
  const updateRes = await fetch(`${BASE_URL}/api/admin/certifications/${createdCert.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      description: updatedDesc,
    }),
  });
  assert(updateRes.status === 200, 'PUT /api/admin/certifications/[id] returns 200 OK');
  const updateData = await updateRes.json();
  assert(
    updateData.certification?.description === updatedDesc,
    'Certification description updated successfully'
  );

  // 3.5 Reorder certifications
  const reorderRes = await fetch(`${BASE_URL}/api/admin/certifications/reorder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      orderedIds: [createdCert.id, ...(initialCertsData.certifications.map((c) => c.id).filter((id) => id !== createdCert.id))],
    }),
  });
  assert(reorderRes.status === 200, 'POST /api/admin/certifications/reorder returns 200 OK');

  // --------------------------------------------------------------------------
  // 4. VISIBILITY & PUBLIC INTEGRATION TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Visibility & Public Integration ---');

  // 4.1 Verify presence on public homepage
  const publicHomeRes = await fetch(`${BASE_URL}/`);
  assert(publicHomeRes.status === 200, 'Public homepage loads successfully (status 200)');
  const publicHtml = await publicHomeRes.text();
  assert(
    publicHtml.includes(newCertPayload.title),
    `Published certification "${newCertPayload.title}" is visible on public homepage`
  );
  assert(
    publicHtml.includes('Verify Credential'),
    'Public verification link action rendered for certification'
  );

  // 4.2 Disable certification via inline toggle
  const disableRes = await fetch(`${BASE_URL}/api/admin/certifications/${createdCert.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      enabled: false,
    }),
  });
  assert(disableRes.status === 200, 'PUT /api/admin/certifications/[id] disable returns 200 OK');

  // 4.3 Verify hidden from public portfolio
  const publicAfterDisableRes = await fetch(`${BASE_URL}/`);
  const publicAfterDisableHtml = await publicAfterDisableRes.text();
  assert(
    !publicAfterDisableHtml.includes(newCertPayload.title),
    `Disabled certification "${newCertPayload.title}" is hidden from public homepage`
  );

  // 4.4 Re-enable certification
  const reEnableRes = await fetch(`${BASE_URL}/api/admin/certifications/${createdCert.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      enabled: true,
      status: 'published',
    }),
  });
  assert(reEnableRes.status === 200, 'PUT /api/admin/certifications/[id] re-enable returns 200 OK');

  const publicAfterReEnableRes = await fetch(`${BASE_URL}/`);
  const publicAfterReEnableHtml = await publicAfterReEnableRes.text();
  assert(
    publicAfterReEnableHtml.includes(newCertPayload.title),
    `Re-enabled certification "${newCertPayload.title}" is visible again on public homepage`
  );

  // --------------------------------------------------------------------------
  // 5. DELETION TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Certification Deletion ---');

  const deleteRes = await fetch(`${BASE_URL}/api/admin/certifications/${createdCert.id}`, {
    method: 'DELETE',
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(deleteRes.status === 200, 'DELETE /api/admin/certifications/[id] returns 200 OK');

  const getDeletedRes = await fetch(`${BASE_URL}/api/admin/certifications/${createdCert.id}`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(
    getDeletedRes.status === 404,
    'GET after delete correctly returns 404 Not Found'
  );

  const publicAfterDeleteRes = await fetch(`${BASE_URL}/`);
  const publicAfterDeleteHtml = await publicAfterDeleteRes.text();
  assert(
    !publicAfterDeleteHtml.includes(newCertPayload.title),
    `Deleted certification "${newCertPayload.title}" is removed from public homepage`
  );

  // --------------------------------------------------------------------------
  // 6. ADMIN PAGE DELIVERY TEST
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Admin Certifications Page Delivery ---');

  const adminPageRes = await fetch(`${BASE_URL}/admin/certifications`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(adminPageRes.status === 200, 'Authenticated GET /admin/certifications returns 200 OK');
  const adminPageHtml = await adminPageRes.text();
  assert(
    adminPageHtml.includes('Certifications') && adminPageHtml.includes('Add Certification'),
    'Admin Certifications page renders title and primary action'
  );

  // --------------------------------------------------------------------------
  // 7. PUBLIC REGRESSION TEST
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Public Regression Testing ---');

  const fullHomeRes = await fetch(`${BASE_URL}/`);
  const fullHomeHtml = await fullHomeRes.text();

  assert(fullHomeHtml.includes('Mohamed Khaled'), 'Profile data intact');
  assert(fullHomeHtml.includes('About') || fullHomeHtml.includes('about'), 'About section intact');
  assert(fullHomeHtml.includes('Experience') || fullHomeHtml.includes('experience'), 'Experience section intact');
  assert(fullHomeHtml.includes('Skills') || fullHomeHtml.includes('skills'), 'Skills section intact');
  assert(fullHomeHtml.includes('Projects') || fullHomeHtml.includes('projects'), 'Projects section intact');
  assert(fullHomeHtml.includes('Certifications') || fullHomeHtml.includes('certifications'), 'Certifications section intact');
  assert(fullHomeHtml.includes('Contact') || fullHomeHtml.includes('contact'), 'Contact section intact');

  console.log('\n==========================================================');
  console.log(`🏁 TEST COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('==========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
