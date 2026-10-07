/**
 * Phase 9 Verification Test Suite
 * Tests Projects CMS, Project CRUD, Slug Generation, Technologies Association,
 * Reordering, Status/Visibility Filtering, Security/Authorization, and Public Integration.
 */

const BASE_URL = 'http://localhost:3000';
const ADMIN_COOKIE = 'sb-admin-auth-preview=active';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 STARTING PHASE 9 PROJECTS CMS VERIFICATION SUITE');
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

  // 1.1 Unauthenticated Projects GET
  const unauthProjectsGet = await fetch(`${BASE_URL}/api/admin/projects`);
  assert(
    unauthProjectsGet.status === 403,
    `Unauthenticated GET /api/admin/projects rejected with 403 (Got: ${unauthProjectsGet.status})`
  );

  // 1.2 Unauthenticated Projects POST
  const unauthProjectsPost = await fetch(`${BASE_URL}/api/admin/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test Project', short_description: 'Test' }),
  });
  assert(
    unauthProjectsPost.status === 403,
    `Unauthenticated POST /api/admin/projects rejected with 403 (Got: ${unauthProjectsPost.status})`
  );

  // 1.3 Unauthenticated Projects Reorder POST
  const unauthProjectsReorder = await fetch(`${BASE_URL}/api/admin/projects/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds: ['fake-id'] }),
  });
  assert(
    unauthProjectsReorder.status === 403,
    `Unauthenticated POST /api/admin/projects/reorder rejected with 403 (Got: ${unauthProjectsReorder.status})`
  );

  // 1.4 Unauthenticated Projects DELETE
  const unauthProjectsDelete = await fetch(`${BASE_URL}/api/admin/projects/fake-id`, {
    method: 'DELETE',
  });
  assert(
    unauthProjectsDelete.status === 403,
    `Unauthenticated DELETE /api/admin/projects/[id] rejected with 403 (Got: ${unauthProjectsDelete.status})`
  );

  // 1.5 Unauthenticated Admin Page redirect
  const unauthPageRes = await fetch(`${BASE_URL}/admin/projects`, {
    redirect: 'manual',
  });
  assert(
    unauthPageRes.status === 307 || unauthPageRes.status === 302 || unauthPageRes.status === 303,
    `Unauthenticated GET /admin/projects redirects to login (Status: ${unauthPageRes.status})`
  );

  // --------------------------------------------------------------------------
  // 2. PROJECT VALIDATION TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Project Validation Rules ---');

  // 2.1 Missing Title
  const missingTitleRes = await fetch(`${BASE_URL}/api/admin/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ title: '', short_description: 'A test project' }),
  });
  assert(
    missingTitleRes.status === 400,
    `Missing project title rejected with 400 Bad Request`
  );

  // 2.2 Missing Short Description
  const missingDescRes = await fetch(`${BASE_URL}/api/admin/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ title: 'Valid Title', short_description: '' }),
  });
  assert(
    missingDescRes.status === 400,
    `Missing short description rejected with 400 Bad Request`
  );

  // 2.3 Invalid GitHub URL
  const invalidUrlRes = await fetch(`${BASE_URL}/api/admin/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      title: 'Valid Title',
      short_description: 'Valid Desc',
      github_url: 'ftp://not-allowed-scheme',
    }),
  });
  assert(
    invalidUrlRes.status === 400,
    `Invalid URL rejected with 400 Bad Request`
  );

  // --------------------------------------------------------------------------
  // 3. PROJECT CRUD & SLUG TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Project CRUD Operations ---');

  // 3.1 Authenticated GET Projects
  const authProjectsGet = await fetch(`${BASE_URL}/api/admin/projects`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(authProjectsGet.status === 200, `Authenticated GET /api/admin/projects returns 200`);
  const projectsData = await authProjectsGet.json();
  assert(
    Array.isArray(projectsData.projects) && projectsData.projects.length > 0,
    `Existing projects retrieved (${projectsData.projects?.length} found)`
  );

  // 3.2 Create Project
  const testTitle = `Vision Transformer VQA ${Date.now()}`;
  const createRes = await fetch(`${BASE_URL}/api/admin/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      title: testTitle,
      short_description: 'Multimodal visual question answering system trained on paired image-text tokens.',
      full_description: 'Deep neural network combining ViT image encoder and RoBERTa text transformer with cross-attention heads.',
      technologies: ['PyTorch', 'Transformers', 'OpenCV', 'Python'],
      github_url: 'https://github.com/example/vit-vqa',
      live_url: 'https://demo.example.com/vqa',
      thumbnail_url: '/images/project-vit-vqa.jpg',
      featured: true,
      status: 'published',
      enabled: true,
    }),
  });
  assert(createRes.status === 200, `POST /api/admin/projects returns 200 OK`);
  const createData = await createRes.json();
  const createdProject = createData.project;
  assert(
    createdProject && createdProject.title === testTitle,
    `Created project "${createdProject?.title}"`
  );
  assert(
    Boolean(createdProject?.slug) && createdProject.slug.includes('vision-transformer-vqa'),
    `Auto-generated URL slug "${createdProject?.slug}"`
  );
  assert(
    Array.isArray(createdProject?.technologies) && createdProject.technologies.includes('PyTorch'),
    `Associated technologies properly saved (${createdProject?.technologies?.join(', ')})`
  );

  // 3.3 Fetch Project by ID
  const getByIdRes = await fetch(`${BASE_URL}/api/admin/projects/${createdProject.id}`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(getByIdRes.status === 200, `GET /api/admin/projects/[id] returns 200 OK`);
  const getByIdData = await getByIdRes.json();
  assert(
    getByIdData.project?.id === createdProject.id,
    `Fetched project matches created ID`
  );

  // 3.4 Update Project
  const updateRes = await fetch(`${BASE_URL}/api/admin/projects/${createdProject.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      short_description: 'Updated multimodal system with improved cross-attention latency.',
      featured: false,
    }),
  });
  assert(updateRes.status === 200, `PUT /api/admin/projects/[id] returns 200 OK`);
  const updateData = await updateRes.json();
  assert(
    updateData.project?.short_description === 'Updated multimodal system with improved cross-attention latency.',
    `Project description updated successfully`
  );

  // 3.5 Reorder Projects
  const reorderRes = await fetch(`${BASE_URL}/api/admin/projects/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ orderedIds: [createdProject.id] }),
  });
  assert(reorderRes.status === 200, `POST /api/admin/projects/reorder returns 200 OK`);

  // --------------------------------------------------------------------------
  // 4. VISIBILITY & PUBLIC PORTFOLIO INTEGRATION
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Visibility & Public Integration ---');

  // 4.1 Verify newly published project appears on the public page
  const publicRes1 = await fetch(`${BASE_URL}/`);
  assert(publicRes1.status === 200, `Public homepage loads successfully (status 200)`);
  const publicHtml1 = await publicRes1.text();
  assert(
    publicHtml1.includes(testTitle),
    `Published project "${testTitle}" is visible on public homepage`
  );

  // 4.2 Disable project (enabled: false / draft)
  const disableRes = await fetch(`${BASE_URL}/api/admin/projects/${createdProject.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      enabled: false,
      status: 'draft',
    }),
  });
  assert(disableRes.status === 200, `PUT /api/admin/projects/[id] disable returns 200 OK`);

  // 4.3 Verify disabled project disappears from public page
  const publicRes2 = await fetch(`${BASE_URL}/`);
  const publicHtml2 = await publicRes2.text();
  assert(
    !publicHtml2.includes(testTitle),
    `Disabled project "${testTitle}" is hidden from public homepage`
  );

  // 4.4 Re-enable project (enabled: true / published)
  const reEnableRes = await fetch(`${BASE_URL}/api/admin/projects/${createdProject.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      enabled: true,
      status: 'published',
    }),
  });
  assert(reEnableRes.status === 200, `PUT /api/admin/projects/[id] re-enable returns 200 OK`);

  const publicRes3 = await fetch(`${BASE_URL}/`);
  const publicHtml3 = await publicRes3.text();
  assert(
    publicHtml3.includes(testTitle),
    `Re-enabled project "${testTitle}" is visible again on public homepage`
  );

  // --------------------------------------------------------------------------
  // 5. PROJECT DELETION TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Project Deletion ---');

  const deleteRes = await fetch(`${BASE_URL}/api/admin/projects/${createdProject.id}`, {
    method: 'DELETE',
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(deleteRes.status === 200, `DELETE /api/admin/projects/[id] returns 200 OK`);

  // Verify project is no longer found
  const getDeletedRes = await fetch(`${BASE_URL}/api/admin/projects/${createdProject.id}`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(getDeletedRes.status === 404, `GET after delete correctly returns 404 Not Found`);

  // Verify removed from public homepage
  const publicRes4 = await fetch(`${BASE_URL}/`);
  const publicHtml4 = await publicRes4.text();
  assert(
    !publicHtml4.includes(testTitle),
    `Deleted project "${testTitle}" is removed from public homepage`
  );

  // --------------------------------------------------------------------------
  // 6. ADMIN UI PAGE ACCESS
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Admin Projects Page Delivery ---');

  const authPageRes = await fetch(`${BASE_URL}/admin/projects`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(authPageRes.status === 200, `Authenticated GET /admin/projects returns 200 OK`);
  const adminHtml = await authPageRes.text();
  assert(
    adminHtml.includes('Projects') && adminHtml.includes('Add Project'),
    `Admin Projects page renders title and primary action`
  );

  // --------------------------------------------------------------------------
  // 7. REGRESSION TEST FOR EXISTING MODULES
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Public Regression Testing ---');

  assert(
    adminHtml.includes('Mohamed Khaled') || publicHtml1.includes('Mohamed Khaled'),
    `Profile data intact`
  );
  assert(
    publicHtml1.includes('id="about"') || publicHtml1.includes('About Me'),
    `About section intact`
  );
  assert(
    publicHtml1.includes('id="experience"') || publicHtml1.includes('Experience'),
    `Experience section intact`
  );
  assert(
    publicHtml1.includes('id="skills"') || publicHtml1.includes('Capabilities'),
    `Skills section intact`
  );
  assert(
    publicHtml1.includes('id="projects"') || publicHtml1.includes('Portfolio'),
    `Projects section intact`
  );
  assert(
    publicHtml1.includes('id="certifications"') || publicHtml1.includes('Certifications'),
    `Certifications section intact`
  );
  assert(
    publicHtml1.includes('id="contact"') || publicHtml1.includes('Get In Touch'),
    `Contact section intact`
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
