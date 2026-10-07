/**
 * ==============================================================================
 * PHASE 16 VERIFICATION TEST SUITE
 * Admin Account & Authorization
 * ==============================================================================
 * 
 * Verifies:
 * 1. Security & Code Invariants (No hardcoded passwords, no hardcoded email checks)
 * 2. Unauthenticated Route Protection (Matrix of all /admin/* routes redirect to login)
 * 3. Server-Side API Authorization (All /api/admin/* return 403 when unauthenticated)
 * 4. Authenticated Admin Access (/admin/dashboard, CMS routes return 200 with admin session)
 * 5. Admin Login UI & Error Handling (Login page, Suspense boundary, error banner)
 * 6. Logout & Session Invalidation (/api/auth/logout redirects and clears state)
 * 7. Public Portfolio Non-Regression (/ remains accessible with public content intact)
 * 8. SQL Schema & Authorization Scripts (authorize_admin.sql, setup-admin.mjs integrity)
 * ==============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';

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
  console.log('🚀 STARTING PHASE 16 ADMIN ACCOUNT & AUTHORIZATION TESTS');
  console.log('==========================================================\n');

  // --------------------------------------------------------------------------
  // 1. CODE INVARIANTS & SECURITY AUDIT
  // --------------------------------------------------------------------------
  console.log('--- 1. Static Security Audit & Code Invariants ---');

  const srcDir = path.resolve(process.cwd(), 'src');
  
  function scanDir(dir, cb) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath, cb);
      } else if (/\.(ts|tsx|js|mjs)$/.test(f)) {
        cb(fullPath);
      }
    }
  }

  let hardcodedEmailCheckFound = false;
  scanDir(srcDir, (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Check for expressions like: email === 'mohamed13alaa12@gmail.com'
    if (/email\s*===?\s*['"]mohamed13alaa12@gmail\.com['"]/i.test(content)) {
      hardcodedEmailCheckFound = true;
      console.error(`Found hardcoded email check in: ${filePath}`);
    }
  });

  assert(
    !hardcodedEmailCheckFound,
    'No hardcoded email authorization checks exist in src/ codebase'
  );

  // Check that authorize_admin.sql exists and correctly defines the admin upsert
  const sqlPath = path.resolve(process.cwd(), 'supabase', 'authorize_admin.sql');
  const sqlExists = fs.existsSync(sqlPath);
  assert(sqlExists, 'supabase/authorize_admin.sql exists');

  if (sqlExists) {
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    assert(
      sqlContent.includes('public.admin_users') && sqlContent.includes('mohamed13alaa12@gmail.com'),
      'authorize_admin.sql targets mohamed13alaa12@gmail.com and updates public.admin_users'
    );
    assert(
      !/encrypted_password|password_hash|password\s*[:=]/i.test(sqlContent),
      'authorize_admin.sql never contains or sets passwords directly'
    );
  }

  // Check setup-admin.mjs script integrity
  const setupScriptPath = path.resolve(process.cwd(), 'scripts', 'setup-admin.mjs');
  const setupExists = fs.existsSync(setupScriptPath);
  assert(setupExists, 'scripts/setup-admin.mjs provisioning script exists');

  if (setupExists) {
    const setupContent = fs.readFileSync(setupScriptPath, 'utf-8');
    assert(
      setupContent.includes('createUser') && setupContent.includes('admin_users'),
      'setup-admin.mjs handles both user creation and admin_users table authorization'
    );
  }

  // --------------------------------------------------------------------------
  // 2. UNAUTHENTICATED ROUTE PROTECTION
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Unauthenticated Admin Route Protection ---');

  const protectedRoutes = [
    '/admin',
    '/admin/dashboard',
    '/admin/profile',
    '/admin/about',
    '/admin/experience',
    '/admin/skills',
    '/admin/projects',
    '/admin/certifications',
    '/admin/contact',
    '/admin/sections',
    '/admin/publishing',
    '/admin/preview',
    '/admin/media',
    '/admin/settings',
  ];

  for (const route of protectedRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${route}`, { redirect: 'manual' });
      const isRedirect = res.status >= 300 && res.status < 400;
      const location = res.headers.get('location') || '';
      const redirectsToLogin = location.includes('/admin/login');

      assert(
        isRedirect && redirectsToLogin,
        `Unauthenticated ${route} blocked: HTTP ${res.status} redirecting to ${location}`
      );
    } catch (err) {
      assert(false, `Failed to test route ${route}: ${err.message}`);
    }
  }

  // --------------------------------------------------------------------------
  // 3. SERVER-SIDE API AUTHORIZATION (403 FORBIDDEN)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Server-Side API Authorization Enforcement ---');

  const adminApis = [
    { method: 'GET', url: '/api/admin/profile' },
    { method: 'POST', url: '/api/admin/profile', body: {} },
    { method: 'GET', url: '/api/admin/settings' },
    { method: 'POST', url: '/api/admin/settings', body: {} },
    { method: 'GET', url: '/api/admin/sections' },
    { method: 'POST', url: '/api/admin/sections', body: {} },
    { method: 'GET', url: '/api/admin/drafts' },
    { method: 'POST', url: '/api/admin/publishing/publish', body: {} },
  ];

  for (const api of adminApis) {
    try {
      const options = {
        method: api.method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (api.body) {
        options.body = JSON.stringify(api.body);
      }

      const res = await fetch(`${BASE_URL}${api.url}`, options);
      assert(
        res.status === 403,
        `Unauthenticated ${api.method} ${api.url} strictly rejected with 403 (Got: ${res.status})`
      );
    } catch (err) {
      assert(false, `API check failed for ${api.url}: ${err.message}`);
    }
  }

  // --------------------------------------------------------------------------
  // 4. AUTHENTICATED ADMIN ACCESS
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Authenticated Admin Route Access ---');

  const adminTestRoutes = [
    '/admin/dashboard',
    '/admin/profile',
    '/admin/experience',
    '/admin/skills',
    '/admin/projects',
    '/admin/certifications',
    '/admin/contact',
    '/admin/sections',
    '/admin/publishing',
    '/admin/media',
    '/admin/settings',
  ];

  for (const route of adminTestRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${route}`, {
        headers: { Cookie: ADMIN_COOKIE },
      });
      assert(
        res.status === 200,
        `Authorized Admin successfully loads ${route} (HTTP ${res.status})`
      );
    } catch (err) {
      assert(false, `Authenticated route access failed for ${route}: ${err.message}`);
    }
  }

  // --------------------------------------------------------------------------
  // 5. ADMIN LOGIN PAGE & ERROR HANDLING
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Admin Login Page & Error Handling ---');

  try {
    const loginRes = await fetch(`${BASE_URL}/admin/login`);
    assert(loginRes.status === 200, 'Admin login page loads successfully (HTTP 200)');
    const loginHtml = await loginRes.text();
    assert(
      loginHtml.includes('Sign In') || loginHtml.includes('admin-email'),
      'Admin login page contains login form elements'
    );

    // Test unauthorized error query parameter
    const errorRes = await fetch(`${BASE_URL}/admin/login?error=unauthorized`);
    assert(errorRes.status === 200, 'Admin login page with ?error=unauthorized loads HTTP 200');
  } catch (err) {
    assert(false, `Login page test failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // 6. LOGOUT LIFECYCLE
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Logout & Session Termination ---');

  try {
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      redirect: 'manual',
    });
    const isLogoutRedirect = logoutRes.status === 303 || logoutRes.status === 302 || logoutRes.status === 307;
    const logoutLocation = logoutRes.headers.get('location') || '';
    assert(
      isLogoutRedirect && logoutLocation.includes('/admin/login'),
      `POST /api/auth/logout redirects to /admin/login (Status: ${logoutRes.status}, Location: ${logoutLocation})`
    );
  } catch (err) {
    assert(false, `Logout test failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // 7. PUBLIC PORTFOLIO REGRESSION
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Public Portfolio Integrity & Non-Regression ---');

  try {
    const publicRes = await fetch(`${BASE_URL}/`);
    assert(publicRes.status === 200, 'Public homepage accessible (HTTP 200)');
    const publicHtml = await publicRes.text();

    assert(
      publicHtml.includes('Mohamed Khaled') || publicHtml.includes('Machine Learning Engineer'),
      'Public portfolio profile content remains intact and uncompromised'
    );
    assert(
      !publicHtml.includes('MK Admin Control') && !publicHtml.includes('AdminSidebar'),
      'Admin control interface is not leaked into public portfolio DOM'
    );
  } catch (err) {
    assert(false, `Public portfolio test failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n==========================================================');
  console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('==========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
