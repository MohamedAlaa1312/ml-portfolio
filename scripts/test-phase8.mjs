/**
 * Phase 8 Verification Test Suite
 * Tests Skills CMS, Category Management, Reordering, Rename Cascade,
 * Safe Deletion, Authentication/Authorization, and Public Integration.
 */

const BASE_URL = 'http://localhost:3000';
const ADMIN_COOKIE = 'sb-admin-auth-preview=active';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 STARTING PHASE 8 SKILLS CMS VERIFICATION SUITE');
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

  // 1.1 Unauthenticated Skills GET
  const unauthSkillsGet = await fetch(`${BASE_URL}/api/admin/skills`);
  assert(
    unauthSkillsGet.status === 403,
    `Unauthenticated GET /api/admin/skills rejected with 403 (Got: ${unauthSkillsGet.status})`
  );

  // 1.2 Unauthenticated Skills POST
  const unauthSkillsPost = await fetch(`${BASE_URL}/api/admin/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PyTorch', category: 'ML' }),
  });
  assert(
    unauthSkillsPost.status === 403,
    `Unauthenticated POST /api/admin/skills rejected with 403 (Got: ${unauthSkillsPost.status})`
  );

  // 1.3 Unauthenticated Skills Reorder POST
  const unauthSkillsReorder = await fetch(`${BASE_URL}/api/admin/skills/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds: ['fake-id'] }),
  });
  assert(
    unauthSkillsReorder.status === 403,
    `Unauthenticated POST /api/admin/skills/reorder rejected with 403 (Got: ${unauthSkillsReorder.status})`
  );

  // 1.4 Unauthenticated Categories GET
  const unauthCatsGet = await fetch(`${BASE_URL}/api/admin/skills/categories`);
  assert(
    unauthCatsGet.status === 403,
    `Unauthenticated GET /api/admin/skills/categories rejected with 403 (Got: ${unauthCatsGet.status})`
  );

  // 1.5 Unauthenticated Categories POST
  const unauthCatsPost = await fetch(`${BASE_URL}/api/admin/skills/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'New Cat' }),
  });
  assert(
    unauthCatsPost.status === 403,
    `Unauthenticated POST /api/admin/skills/categories rejected with 403 (Got: ${unauthCatsPost.status})`
  );

  // 1.6 Unauthenticated Categories Reorder POST
  const unauthCatsReorder = await fetch(`${BASE_URL}/api/admin/skills/categories/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds: ['cat-1'] }),
  });
  assert(
    unauthCatsReorder.status === 403,
    `Unauthenticated POST /api/admin/skills/categories/reorder rejected with 403 (Got: ${unauthCatsReorder.status})`
  );

  // 1.7 Unauthenticated Categories DELETE
  const unauthCatsDelete = await fetch(`${BASE_URL}/api/admin/skills/categories?id=test`, {
    method: 'DELETE',
  });
  assert(
    unauthCatsDelete.status === 403,
    `Unauthenticated DELETE /api/admin/skills/categories rejected with 403 (Got: ${unauthCatsDelete.status})`
  );

  // --------------------------------------------------------------------------
  // 2. CATEGORY CRUD & VALIDATION TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Category Management CRUD ---');

  // 2.1 Authenticated GET Categories
  const authCatsGet = await fetch(`${BASE_URL}/api/admin/skills/categories`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(authCatsGet.status === 200, `Authenticated GET /api/admin/skills/categories returns 200`);
  const catsData = await authCatsGet.json();
  assert(
    Array.isArray(catsData.categories) && catsData.categories.length > 0,
    `Initial categories returned (${catsData.categories?.length} found)`
  );

  // 2.2 Create Category
  const testCatName = `MLOps Test ${Date.now()}`;
  const createCatRes = await fetch(`${BASE_URL}/api/admin/skills/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      name: testCatName,
      description: 'Model deployment, monitoring, and scaling pipelines.',
      icon: '🚀',
      enabled: true,
    }),
  });
  assert(createCatRes.status === 200, `POST /api/admin/skills/categories returns 200`);
  const createCatData = await createCatRes.json();
  const createdCat = createCatData.category;
  assert(
    createdCat && createdCat.name === testCatName && createdCat.icon === '🚀',
    `Created category "${createdCat?.name}" with icon "${createdCat?.icon}"`
  );

  // 2.3 Duplicate Category Rejection
  const dupCatRes = await fetch(`${BASE_URL}/api/admin/skills/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ name: testCatName }),
  });
  assert(
    dupCatRes.status === 400,
    `Duplicate category name correctly rejected with 400 Bad Request`
  );

  // 2.4 Reorder Categories
  const allCatsRes = await fetch(`${BASE_URL}/api/admin/skills/categories`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const allCats = (await allCatsRes.json()).categories;
  const reorderedCatIds = [createdCat.id, ...allCats.filter((c) => c.id !== createdCat.id).map((c) => c.id)];

  const reorderCatsRes = await fetch(`${BASE_URL}/api/admin/skills/categories/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ orderedIds: reorderedCatIds }),
  });
  assert(reorderCatsRes.status === 200, `POST /api/admin/skills/categories/reorder returns 200`);

  // --------------------------------------------------------------------------
  // 3. SKILL CRUD & VALIDATION TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Skill CRUD & Reordering ---');

  // 3.1 Authenticated GET Skills
  const authSkillsGet = await fetch(`${BASE_URL}/api/admin/skills`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(authSkillsGet.status === 200, `Authenticated GET /api/admin/skills returns 200`);
  const skillsPayload = await authSkillsGet.json();
  assert(
    Array.isArray(skillsPayload.skills) && skillsPayload.skills.length > 0,
    `Initial skills returned (${skillsPayload.skills?.length} found)`
  );

  // 3.2 Validation: Missing Skill Name
  const invalidNameRes = await fetch(`${BASE_URL}/api/admin/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ name: '', category: testCatName }),
  });
  assert(invalidNameRes.status === 400, `POST without skill name rejected with 400`);

  // 3.3 Validation: Invalid Proficiency
  const invalidProfRes = await fetch(`${BASE_URL}/api/admin/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ name: 'Ray', category: testCatName, proficiency: 150 }),
  });
  assert(invalidProfRes.status === 400, `POST with proficiency > 100 rejected with 400`);

  // 3.4 Create Valid Skill assigned to our test category
  const skillName = `Ray / MLflow ${Date.now()}`;
  const createSkillRes = await fetch(`${BASE_URL}/api/admin/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      name: skillName,
      category: testCatName,
      proficiency: 92,
      icon: '⚡',
      enabled: true,
    }),
  });
  assert(createSkillRes.status === 200, `POST /api/admin/skills returns 200`);
  const createSkillData = await createSkillRes.json();
  const createdSkill = createSkillData.skill;
  assert(
    createdSkill && createdSkill.name === skillName && createdSkill.proficiency === 92,
    `Created skill "${createdSkill?.name}" under category "${createdSkill?.category}"`
  );

  // 3.5 GET Skill by ID
  const getSkillRes = await fetch(`${BASE_URL}/api/admin/skills/${createdSkill.id}`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(getSkillRes.status === 200, `GET /api/admin/skills/[id] returns 200`);
  const getSkillData = await getSkillRes.json();
  assert(
    getSkillData.skill?.id === createdSkill.id,
    `Skill fetched by ID matches created skill`
  );

  // 3.6 Update Skill
  const updateSkillRes = await fetch(`${BASE_URL}/api/admin/skills/${createdSkill.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      proficiency: 96,
      enabled: true,
    }),
  });
  assert(updateSkillRes.status === 200, `PUT /api/admin/skills/[id] returns 200`);
  const updatedSkillData = await updateSkillRes.json();
  assert(
    updatedSkillData.skill?.proficiency === 96,
    `Updated skill proficiency to ${updatedSkillData.skill?.proficiency}`
  );

  // 3.7 Reorder Skills
  const reorderSkillsRes = await fetch(`${BASE_URL}/api/admin/skills/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ orderedIds: [createdSkill.id] }),
  });
  assert(reorderSkillsRes.status === 200, `POST /api/admin/skills/reorder returns 200`);

  // --------------------------------------------------------------------------
  // 4. CATEGORY RENAME CASCADE TEST
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Category Rename Cascade ---');

  const renamedCatName = `Renamed MLOps ${Date.now()}`;
  const renameCatRes = await fetch(`${BASE_URL}/api/admin/skills/categories`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      id: createdCat.id,
      name: renamedCatName,
      icon: '🤖',
    }),
  });
  assert(renameCatRes.status === 200, `PUT /api/admin/skills/categories rename returns 200`);

  // Verify the skill assigned to the old category was cascaded to the new category name
  const checkSkillCascade = await fetch(`${BASE_URL}/api/admin/skills/${createdSkill.id}`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const checkSkillData = await checkSkillCascade.json();
  assert(
    checkSkillData.skill?.category === renamedCatName,
    `Cascade confirmed: Skill category automatically updated to "${checkSkillData.skill?.category}"`
  );

  // --------------------------------------------------------------------------
  // 5. CATEGORY SAFE DELETION TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Category Safe Deletion ---');

  // 5.1 Safe Deletion: Deleting category with assigned skills must fail without force
  const safeDeleteFail = await fetch(
    `${BASE_URL}/api/admin/skills/categories?id=${createdCat.id}`,
    {
      method: 'DELETE',
      headers: { Cookie: ADMIN_COOKIE },
    }
  );
  assert(
    safeDeleteFail.status === 400,
    `Category deletion prevented with 400 when category contains skills`
  );
  const safeDeleteFailData = await safeDeleteFail.json();
  assert(
    safeDeleteFailData.canForce === true && safeDeleteFailData.skillCount > 0,
    `Error response indicates ${safeDeleteFailData.skillCount} assigned skill(s) and provides canForce flag`
  );

  // 5.2 Clean up the skill
  const deleteSkillRes = await fetch(`${BASE_URL}/api/admin/skills/${createdSkill.id}`, {
    method: 'DELETE',
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(deleteSkillRes.status === 200, `DELETE /api/admin/skills/[id] returns 200`);

  // 5.3 Category deletion now succeeds cleanly since 0 skills remain
  const safeDeleteSuccess = await fetch(
    `${BASE_URL}/api/admin/skills/categories?id=${createdCat.id}`,
    {
      method: 'DELETE',
      headers: { Cookie: ADMIN_COOKIE },
    }
  );
  assert(
    safeDeleteSuccess.status === 200,
    `Category deletion succeeded with 200 once skills were removed`
  );

  // --------------------------------------------------------------------------
  // 6. PUBLIC PORTFOLIO INTEGRATION
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Public Portfolio Integration ---');

  const publicRes = await fetch(`${BASE_URL}/`);
  assert(publicRes.status === 200, `Public homepage loads successfully (status 200)`);
  const publicHtml = await publicRes.text();

  assert(
    publicHtml.includes('id="skills"') || publicHtml.includes('Capabilities') || publicHtml.includes('Skills'),
    `Public page renders Skills section with heading & anchor`
  );

  assert(
    publicHtml.includes('Machine Learning') && publicHtml.includes('Python'),
    `Public Skills section displays standard ML engineering categories & competencies`
  );

  // --------------------------------------------------------------------------
  // 7. ADMIN UI PAGE ACCESS
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Testing Admin Skills Page Access ---');

  // 7.1 Unauthenticated Admin Page redirect
  const unauthPageRes = await fetch(`${BASE_URL}/admin/skills`, {
    redirect: 'manual',
  });
  assert(
    unauthPageRes.status === 307 || unauthPageRes.status === 302 || unauthPageRes.status === 303,
    `Unauthenticated GET /admin/skills redirects to login (Status: ${unauthPageRes.status})`
  );

  // 7.2 Authenticated Admin Page
  const authPageRes = await fetch(`${BASE_URL}/admin/skills`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(authPageRes.status === 200, `Authenticated GET /admin/skills returns 200 OK`);
  const adminHtml = await authPageRes.text();
  assert(
    adminHtml.includes('Skills &amp; Capabilities') || adminHtml.includes('Skills & Capabilities'),
    `Admin Skills page renders SkillsManager title`
  );

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n====================================================');
  console.log(`🏁 TEST COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
