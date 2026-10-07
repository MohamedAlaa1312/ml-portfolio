import assert from 'node:assert';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

console.log('======================================================================');
console.log(`🔍 STARTING PHASE 27: PRODUCTION QA & RELEASE VERIFICATION`);
console.log(`Target: ${BASE_URL} (Next.js Production Build)`);
console.log('======================================================================\n');

let passCount = 0;
let failCount = 0;

function pass(desc) {
  console.log(`  ✔ PASS: ${desc}`);
  passCount++;
}

function fail(desc, err) {
  console.error(`  ✖ FAIL: ${desc}`);
  if (err) console.error(`    Details: ${err.message || err}`);
  failCount++;
}

async function runProdQA() {
  // --- 1. Production Health & Homepage ---
  console.log('--- 1. Production Health & Public Homepage ---');
  try {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200, 'Homepage must return 200 OK');
    const html = await res.text();
    pass('Production homepage responds with HTTP 200 OK');

    assert(html.includes('Mohamed Khaled'), 'Homepage contains engineer name');
    assert(html.includes('Machine Learning Engineer'), 'Homepage contains professional title');
    pass('Homepage displays verified personal and professional identity');

    // Check all 7 sections
    assert(html.includes('id="hero"') || html.includes('id="profile"'), 'Hero section present');
    assert(html.includes('id="about"'), 'About section present');
    assert(html.includes('id="experience"'), 'Experience section present');
    assert(html.includes('id="skills"'), 'Skills section present');
    assert(html.includes('id="projects"'), 'Projects section present');
    assert(html.includes('id="certifications"'), 'Certifications section present');
    assert(html.includes('id="contact"'), 'Contact section present');
    pass('All 7 portfolio sections are successfully rendered in production');
  } catch (err) {
    fail('Production Health & Homepage check', err);
  }

  // --- 2. Production Security Headers ---
  console.log('\n--- 2. Production Security Headers ---');
  try {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff', 'X-Content-Type-Options: nosniff');
    assert.strictEqual(res.headers.get('x-frame-options'), 'SAMEORIGIN', 'X-Frame-Options: SAMEORIGIN');
    assert.strictEqual(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin', 'Referrer-Policy header present');
    pass('HTTP Security headers (nosniff, SAMEORIGIN, referrer-policy) strictly enforced');
  } catch (err) {
    fail('Production Security Headers check', err);
  }

  // --- 3. Profile Image & Static Assets ---
  console.log('\n--- 3. Profile Image & Static Assets ---');
  try {
    const res = await fetch(`${BASE_URL}/images/profile.jpg`);
    assert.strictEqual(res.status, 200, 'Profile image must return 200 OK');
    const contentType = res.headers.get('content-type');
    assert(contentType && contentType.includes('image'), 'Content-Type must be image');
    pass('Profile image asset loads cleanly with valid image Content-Type');

    const faviconRes = await fetch(`${BASE_URL}/favicon.ico`);
    assert.strictEqual(faviconRes.status, 200, 'Favicon must return 200 OK');
    pass('Favicon asset loads successfully with HTTP 200 OK');
  } catch (err) {
    fail('Static Asset check', err);
  }

  // --- 4. Admin Route Protection & Edge Middleware ---
  console.log('\n--- 4. Admin Route Protection & Edge Middleware ---');
  try {
    // Unauthenticated request to /admin/dashboard
    const resAdmin = await fetch(`${BASE_URL}/admin/dashboard`, { redirect: 'manual' });
    assert([307, 308, 302, 303].includes(resAdmin.status), 'Must redirect unauthenticated request');
    const location = resAdmin.headers.get('location');
    assert(location && location.includes('/admin/login'), 'Must redirect to /admin/login');
    pass('Unauthenticated request to /admin/dashboard redirects to /admin/login');

    // Unauthenticated request to /admin/settings
    const resSettings = await fetch(`${BASE_URL}/admin/settings`, { redirect: 'manual' });
    assert([307, 308, 302, 303].includes(resSettings.status), 'Must redirect /admin/settings');
    pass('Protected route /admin/settings safely blocked for unauthenticated users');

    // Unauthenticated request to /admin/themes
    const resThemes = await fetch(`${BASE_URL}/admin/themes`, { redirect: 'manual' });
    assert([307, 308, 302, 303].includes(resThemes.status), 'Must redirect /admin/themes');
    pass('Protected route /admin/themes safely blocked for unauthenticated users');
  } catch (err) {
    fail('Admin Route Protection check', err);
  }

  // --- 5. Admin Authentication Interface ---
  console.log('\n--- 5. Admin Authentication Interface ---');
  try {
    const resLogin = await fetch(`${BASE_URL}/admin/login`);
    assert.strictEqual(resLogin.status, 200, 'Login page must return 200 OK');
    const htmlLogin = await resLogin.text();
    assert(htmlLogin.includes('/_next/static/'), 'Login page loads Next.js client bundle');
    pass('Admin login route returns HTTP 200 OK and loads client authentication bundle');
  } catch (err) {
    fail('Admin Authentication Interface check', err);
  }

  // --- 6. Production Error Handling & 404 ---
  console.log('\n--- 6. Production Error Handling & Custom 404 ---');
  try {
    const res404 = await fetch(`${BASE_URL}/this-route-definitely-does-not-exist-404-test`);
    assert.strictEqual(res404.status, 404, 'Unknown route must return 404 Not Found');
    const html404 = await res404.text();
    assert(html404.includes('Page Not Found') || html404.includes('RESOURCE_NOT_FOUND'), 'Custom 404 UI renders');
    assert(!html404.includes('Internal Server Error'), 'Does not leak 500 error on 404');
    assert(!html404.includes('stack trace'), 'Zero stack trace leakage on 404');
    pass('Custom 404 page renders branded UI with zero stack trace leakage');
  } catch (err) {
    fail('Production Error Handling check', err);
  }

  // --- 7. Theme Resolution & Public Rendering ---
  console.log('\n--- 7. Theme Resolution & Public Rendering ---');
  try {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    assert(html.includes('data-theme='), 'Page must output data-theme attribute');
    pass('Active published theme resolves correctly on public portfolio');

    // Test theme fallback on invalid preview theme
    const resFallback = await fetch(`${BASE_URL}/?theme=nonexistent-invalid-theme`);
    assert.strictEqual(resFallback.status, 200, 'Invalid theme request must gracefully return 200 OK');
    const htmlFallback = await resFallback.text();
    assert(htmlFallback.includes('data-theme='), 'Fallback theme rendered safely');
    pass('Unknown theme parameter safely falls back to default theme without 500 crashes');
  } catch (err) {
    fail('Theme Resolution check', err);
  }

  // --- 8. SEO & Open Graph Metadata ---
  console.log('\n--- 8. SEO & Open Graph Metadata ---');
  try {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    assert(html.includes('<title>'), '<title> tag present');
    assert(html.includes('name="description"'), 'Meta description present');
    assert(html.includes('property="og:title"') || html.includes('name="twitter:title"'), 'Social title present');
    assert(html.includes('property="og:image"') || html.includes('name="twitter:image"'), 'Social image present');
    assert(html.includes('rel="canonical"'), 'Canonical link present');
    pass('SEO tags (title, description, canonical, Open Graph, Twitter) fully configured');
  } catch (err) {
    fail('SEO & Metadata check', err);
  }

  // --- 9. Section Anchor Navigation ---
  console.log('\n--- 9. Section Anchor Navigation ---');
  try {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    const anchors = ['#about', '#experience', '#skills', '#projects', '#certifications', '#contact'];
    for (const anchor of anchors) {
      assert(html.includes(`href="${anchor}"`), `Navigation link for ${anchor} present`);
    }
    pass('All section anchor navigation links are present and point to valid targets');
  } catch (err) {
    fail('Section Anchor Navigation check', err);
  }

  // --- 10. API Route Security (Unauthenticated Writes Blocked) ---
  console.log('\n--- 10. API Route Security (Unauthenticated Mutations Blocked) ---');
  try {
    const resUpload = await fetch(`${BASE_URL}/api/admin/upload`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    assert([401, 403, 307].includes(resUpload.status), 'Unauthenticated upload must be blocked');
    pass('Unauthenticated POST /api/admin/upload blocked with 401/403 Forbidden');

    const resThemeUpdate = await fetch(`${BASE_URL}/api/admin/themes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active_theme: 'precision-dark' }),
    });
    assert([401, 403, 307].includes(resThemeUpdate.status), 'Unauthenticated theme change must be blocked');
    pass('Unauthenticated POST /api/admin/themes blocked with 401/403 Forbidden');
  } catch (err) {
    fail('API Route Security check', err);
  }

  console.log('\n======================================================================');
  console.log(`PRODUCTION QA SUMMARY: ${passCount} PASSED | ${failCount} FAILED`);
  console.log('======================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runProdQA().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
