/**
 * Phase 7 Verification Test Suite
 * Tests About CMS, Experience CMS, Authentication/Authorization,
 * CRUD operations, Reordering, Visibility, and Public Integration.
 */

const BASE_URL = 'http://localhost:3000';
const ADMIN_COOKIE = 'sb-admin-auth-preview=active';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 STARTING PHASE 7 VERIFICATION TEST SUITE');
  console.log('====================================================\n');

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

  // 1.1 Unauthenticated About GET
  const unauthAbout = await fetch(`${BASE_URL}/api/admin/about`);
  assert(
    unauthAbout.status === 403,
    `Unauthenticated GET /api/admin/about rejected with 403 (Got: ${unauthAbout.status})`
  );

  // 1.2 Unauthenticated About POST
  const unauthAboutPost = await fetch(`${BASE_URL}/api/admin/about`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ heading: 'Test' }),
  });
  assert(
    unauthAboutPost.status === 403,
    `Unauthenticated POST /api/admin/about rejected with 403 (Got: ${unauthAboutPost.status})`
  );

  // 1.3 Unauthenticated Experience GET
  const unauthExp = await fetch(`${BASE_URL}/api/admin/experience`);
  assert(
    unauthExp.status === 403,
    `Unauthenticated GET /api/admin/experience rejected with 403 (Got: ${unauthExp.status})`
  );

  // 1.4 Unauthenticated Experience POST
  const unauthExpPost = await fetch(`${BASE_URL}/api/admin/experience`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company: 'Test' }),
  });
  assert(
    unauthExpPost.status === 403,
    `Unauthenticated POST /api/admin/experience rejected with 403 (Got: ${unauthExpPost.status})`
  );

  // 1.5 Unauthenticated Experience Reorder POST
  const unauthReorder = await fetch(`${BASE_URL}/api/admin/experience/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds: ['fake-id'] }),
  });
  assert(
    unauthReorder.status === 403,
    `Unauthenticated POST /api/admin/experience/reorder rejected with 403 (Got: ${unauthReorder.status})`
  );

  // --------------------------------------------------------------------------
  // 2. ABOUT CMS TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing About CMS ---');

  // 2.1 Authorized About GET
  const authAbout = await fetch(`${BASE_URL}/api/admin/about`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const aboutData = await authAbout.json();
  assert(
    authAbout.status === 200 && aboutData.success === true,
    `Authorized GET /api/admin/about returns 200 and data`
  );

  // 2.2 Authorized About POST (Update content)
  const testHeading = 'Architecting Next-Gen Neural Systems';
  const testDesc = 'Specialized in deploying large foundation models, deep reinforcement learning, and high-throughput real-time AI pipelines.';
  const testPillars = [
    { title: 'Neural Systems', description: 'Designing multi-modal vision-language transformers', icon: '🧠' },
    { title: 'Distributed Inference', description: 'Scaling models to sub-millisecond latencies', icon: '⚡' },
    { title: 'Production ML', description: 'Containerized deployment with continuous observability', icon: '🛠️' },
  ];

  const updateAboutRes = await fetch(`${BASE_URL}/api/admin/about`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      title: 'About Me',
      badge: 'About Mohamed Khaled',
      heading: testHeading,
      description: testDesc,
      pillars: testPillars,
      avatarUrl: '/images/about-profile.jpg',
      enabled: true,
      status: 'published',
    }),
  });
  const updateAboutJson = await updateAboutRes.json();
  assert(
    updateAboutRes.status === 200 && updateAboutJson.success === true,
    `Authorized POST /api/admin/about updates section successfully`
  );

  // 2.3 Verify Public Portfolio reflects updated About content
  const publicPageRes = await fetch(`${BASE_URL}/`);
  const publicHtml = await publicPageRes.text();
  assert(
    publicHtml.includes(testHeading),
    `Public portfolio rendered updated About heading: "${testHeading}"`
  );
  assert(
    publicHtml.includes('About Mohamed Khaled'),
    `Public portfolio rendered updated About badge`
  );

  // --------------------------------------------------------------------------
  // 3. EXPERIENCE CMS TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Experience CMS ---');

  // 3.1 Authorized Experience List GET
  const expListRes = await fetch(`${BASE_URL}/api/admin/experience`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const expListJson = await expListRes.json();
  assert(
    expListRes.status === 200 && Array.isArray(expListJson.experience),
    `Authorized GET /api/admin/experience returns experiences list (Count: ${expListJson.experience?.length})`
  );
  const initialCount = expListJson.experience?.length || 0;

  // 3.2 Experience Creation Validation (Missing required fields)
  const invalidExpRes = await fetch(`${BASE_URL}/api/admin/experience`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ company: '' }),
  });
  const invalidExpJson = await invalidExpRes.json();
  assert(
    invalidExpRes.status === 400 && invalidExpJson.error.includes('Company name is required'),
    `POST /api/admin/experience validates missing company (Status: ${invalidExpRes.status})`
  );

  // 3.3 Experience Creation (Valid)
  const newExpPayload = {
    company: 'DeepMind Technologies',
    role: 'Lead AI Research Engineer',
    employment_type: 'Full-time',
    location: 'London, UK',
    start_date: '2024-01-01',
    end_date: null,
    is_current: true,
    description: 'Leading frontier research on multi-agent reinforcement learning and autonomous robotic control.',
    responsibilities: [
      'Designed end-to-end transformer policy models for robotic arms.',
      'Mentored research fellows and spearheaded model evaluation suites.',
    ],
    technologies: ['PyTorch', 'JAX', 'MuJoCo', 'Ray', 'CUDA'],
    achievements: [
      'Boosted task sample efficiency by 3.5x using offline RL',
      'Filed 2 provisional patents for robotic motion synthesis',
    ],
    company_logo: '/images/deepmind-logo.png',
    enabled: true,
    status: 'published',
  };

  const createExpRes = await fetch(`${BASE_URL}/api/admin/experience`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify(newExpPayload),
  });
  const createExpJson = await createExpRes.json();
  assert(
    createExpRes.status === 200 && createExpJson.success === true && createExpJson.experience?.id,
    `POST /api/admin/experience creates entry successfully (ID: ${createExpJson.experience?.id})`
  );
  const createdId = createExpJson.experience?.id;

  // 3.4 Experience Read by ID
  const getByIdRes = await fetch(`${BASE_URL}/api/admin/experience/${createdId}`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const getByIdJson = await getByIdRes.json();
  assert(
    getByIdRes.status === 200 && getByIdJson.experience?.company === 'DeepMind Technologies',
    `GET /api/admin/experience/[id] returns matching record`
  );

  // 3.5 Experience Edit (Update role, achievements, and technologies)
  const updatedRole = 'Staff Artificial Intelligence Engineer';
  const editExpRes = await fetch(`${BASE_URL}/api/admin/experience/${createdId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      ...createExpJson.experience,
      role: updatedRole,
      technologies: ['PyTorch', 'JAX', 'Triton', 'TensorRT'],
      achievements: [
        'Boosted task sample efficiency by 3.5x using offline RL',
        'Filed 2 provisional patents for robotic motion synthesis',
        'Awarded Best Paper Nominee at CoRL 2024',
      ],
    }),
  });
  const editExpJson = await editExpRes.json();
  assert(
    editExpRes.status === 200 && editExpJson.experience?.role === updatedRole,
    `PUT /api/admin/experience/[id] updates role and achievements (Role: "${editExpJson.experience?.role}")`
  );

  // 3.6 Experience Reordering
  const listAfterCreate = await (
    await fetch(`${BASE_URL}/api/admin/experience`, { headers: { Cookie: ADMIN_COOKIE } })
  ).json();
  const allIds = listAfterCreate.experience.map((e) => e.id);
  // Reverse order
  const reversedIds = [...allIds].reverse();

  const reorderRes = await fetch(`${BASE_URL}/api/admin/experience/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ orderedIds: reversedIds }),
  });
  const reorderJson = await reorderRes.json();
  assert(
    reorderRes.status === 200 && reorderJson.success === true,
    `POST /api/admin/experience/reorder successfully updates sequence`
  );

  // 3.7 Experience Visibility Toggle (Disable -> verify hidden on public)
  const disableRes = await fetch(`${BASE_URL}/api/admin/experience/${createdId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      ...editExpJson.experience,
      enabled: false,
    }),
  });
  const disableJson = await disableRes.json();
  assert(
    disableRes.status === 200 && disableJson.experience?.enabled === false,
    `PUT /api/admin/experience/[id] disabled entry successfully`
  );

  // Verify public portfolio DOES NOT show disabled experience
  const publicAfterDisable = await (await fetch(`${BASE_URL}/`)).text();
  assert(
    !publicAfterDisable.includes(updatedRole),
    `Public portfolio hides disabled experience "${updatedRole}"`
  );

  // Re-enable and verify it reappears
  await fetch(`${BASE_URL}/api/admin/experience/${createdId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      ...editExpJson.experience,
      enabled: true,
    }),
  });
  const publicAfterReenable = await (await fetch(`${BASE_URL}/`)).text();
  assert(
    publicAfterReenable.includes(updatedRole),
    `Public portfolio displays re-enabled experience "${updatedRole}"`
  );

  // 3.8 Experience Deletion
  const deleteRes = await fetch(`${BASE_URL}/api/admin/experience/${createdId}`, {
    method: 'DELETE',
    headers: { Cookie: ADMIN_COOKIE },
  });
  const deleteJson = await deleteRes.json();
  assert(
    deleteRes.status === 200 && deleteJson.success === true,
    `DELETE /api/admin/experience/[id] deletes entry successfully`
  );

  // Verify record is gone
  const getDeletedRes = await fetch(`${BASE_URL}/api/admin/experience/${createdId}`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(
    getDeletedRes.status === 404,
    `GET /api/admin/experience/[id] returns 404 after deletion`
  );

  // Verify list count returns to initial
  const finalListRes = await (
    await fetch(`${BASE_URL}/api/admin/experience`, { headers: { Cookie: ADMIN_COOKIE } })
  ).json();
  assert(
    finalListRes.experience?.length === initialCount,
    `Experience count returned to baseline count of ${initialCount}`
  );

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
