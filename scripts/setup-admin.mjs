/**
 * ==============================================================================
 * PHASE 16 — ADMIN ACCOUNT SETUP & AUTHORIZATION SCRIPT
 * Target Account: mohamed13alaa12@gmail.com
 * ==============================================================================
 * Security Standards:
 * - Passwords are NEVER written to disk, committed to Git, or printed to stdout.
 * - Uses Supabase Auth Admin API (createUser/updateUserById).
 * - Ensures user_id is properly recorded in public.admin_users.
 * - Idempotent: checks for existing user to prevent duplicate accounts.
 * ==============================================================================
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const TARGET_EMAIL = 'mohamed13alaa12@gmail.com';

// 1. Resolve environment credentials from process or .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envExamplePath = path.resolve(process.cwd(), '.env.example');

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  const targetEnv = fs.existsSync(envPath) ? envPath : (fs.existsSync(envExamplePath) ? envExamplePath : null);
  if (targetEnv) {
    const lines = fs.readFileSync(targetEnv, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = trimmed.replace('NEXT_PUBLIC_SUPABASE_URL=', '').trim();
      }
      if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        serviceRoleKey = trimmed.replace('SUPABASE_SERVICE_ROLE_KEY=', '').trim();
      }
    }
  }
}

const isConfigured =
  supabaseUrl &&
  !supabaseUrl.includes('your-project-id') &&
  serviceRoleKey &&
  !serviceRoleKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

console.log('\n======================================================');
console.log('   PHASE 16 — ADMIN ACCOUNT & AUTHORIZATION PROVISIONING');
console.log('======================================================\n');
console.log(`[Target Account] Email: ${TARGET_EMAIL}`);
console.log(`[Target Endpoint] Supabase URL: ${supabaseUrl || 'NOT SET'}`);
console.log(`[Service Role Key] ${serviceRoleKey ? 'Configured (Active)' : 'NOT SET'}\n`);

async function promptPassword() {
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter secure password for the new admin account (input hidden): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  if (!isConfigured) {
    console.log('ℹ [Notice] Live Supabase Service Role Key is not configured in .env.local.');
    console.log('ℹ Automated direct API provisioning requires SUPABASE_SERVICE_ROLE_KEY.\n');
    console.log('------------------------------------------------------');
    console.log('MANUAL PROVISIONING INSTRUCTIONS FOR PROJECT OWNER:');
    console.log('------------------------------------------------------');
    console.log('1. Go to your Supabase Dashboard -> Authentication -> Users.');
    console.log('2. Click "Add User" -> "Create User".');
    console.log(`3. Email: "${TARGET_EMAIL}"`);
    console.log('4. Enter your desired secure password and ensure "Auto-confirm Email" is checked.');
    console.log('5. Navigate to Supabase SQL Editor and run:');
    console.log('   supabase/authorize_admin.sql');
    console.log('   (or execute the SQL snippet below:)\n');
    console.log(`   INSERT INTO public.admin_users (user_id, role)`);
    console.log(`   SELECT id, 'admin' FROM auth.users WHERE lower(email) = lower('${TARGET_EMAIL}')`);
    console.log(`   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';\n`);
    console.log('------------------------------------------------------\n');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('🔍 Checking if account already exists in Supabase Auth...');
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('✖ Error querying Supabase Auth users:', listError.message);
    process.exit(1);
  }

  const normalizedTarget = TARGET_EMAIL.toLowerCase();
  const existingUser = usersData.users.find(
    (u) => (u.email || '').toLowerCase() === normalizedTarget
  );

  let userId;

  if (existingUser) {
    console.log(`✔ Found existing account in auth.users (ID: ${existingUser.id}).`);
    console.log('  Skipping creation to avoid duplicate user accounts.');
    userId = existingUser.id;

    // Update app_metadata
    console.log('⚡ Updating app_metadata to assign admin role...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      app_metadata: { role: 'admin' },
    });

    if (updateError) {
      console.warn('  ⚠️ Note: Could not update app_metadata:', updateError.message);
    } else {
      console.log('  ✔ app_metadata.role = "admin" updated successfully.');
    }
  } else {
    console.log(`Account "${TARGET_EMAIL}" does not exist yet. Preparing creation...`);
    const password = await promptPassword();

    if (!password) {
      console.error('✖ Password is required to create a new user account. Aborted.');
      process.exit(1);
    }

    console.log('⚡ Creating user via Supabase Auth Admin API...');
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: TARGET_EMAIL,
      password: password,
      email_confirm: true,
      app_metadata: { role: 'admin' },
    });

    if (createError || !createData.user) {
      console.error('✖ User creation failed:', createError?.message || 'Unknown error');
      process.exit(1);
    }

    userId = createData.user.id;
    console.log(`✔ User account created successfully in auth.users (ID: ${userId}).`);
  }

  // 2. Ensure public.admin_users record exists
  console.log('⚡ Ensuring public.admin_users authorization record exists...');
  const { error: adminUpsertError } = await supabase.from('admin_users').upsert(
    {
      user_id: userId,
      role: 'admin',
    },
    { onConflict: 'user_id' }
  );

  if (adminUpsertError) {
    console.error('✖ Failed to upsert public.admin_users record:', adminUpsertError.message);
    process.exit(1);
  }

  // 3. Verify public.admin_users
  const { data: verifyRecord, error: verifyError } = await supabase
    .from('admin_users')
    .select('user_id, role, created_at')
    .eq('user_id', userId)
    .single();

  if (verifyError || !verifyRecord) {
    console.error('✖ Verification query failed:', verifyError?.message);
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('✔ PHASE 16 AUTHORIZATION COMPLETE & VERIFIED');
  console.log('======================================================');
  console.log(`User ID:        ${verifyRecord.user_id}`);
  console.log(`Email:          ${TARGET_EMAIL}`);
  console.log(`Admin Role:     ${verifyRecord.role}`);
  console.log(`Authorized At:  ${verifyRecord.created_at}`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Fatal error during setup:', err);
  process.exit(1);
});
