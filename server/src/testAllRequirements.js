import { server } from './server.js';
import { getPool } from './config/db.js';

async function runComprehensiveTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  try {
    await new Promise((r) => setTimeout(r, 1200));
    const port = server.address().port;
    const BASE_URL = `http://localhost:${port}`;
    console.log(`📡 Connected to test server at ${BASE_URL}`);
    const pool = getPool();

    const timestamp = Date.now();
    const testEmail = `founder_${timestamp}@example.com`;
    const password = 'StrongPassword123!';

    // ──────────────────────────────────────────
    // 1. TEST REGISTRATION & VALIDATION
    // ──────────────────────────────────────────
    console.log('▶ [1] Testing Registration Validation & Account Creation...');

    // Test mismatched passwords
    const badRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test Founder',
        email: testEmail,
        password: password,
        confirm_password: 'DifferentPassword123!',
        terms: true,
      }),
    });
    console.log('   Mismatched password response:', badRegRes.status, '(Expected 400)');
    if (badRegRes.status !== 400) throw new Error('Expected 400 for password mismatch');

    // Test missing terms
    const noTermsRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test Founder',
        email: testEmail,
        password: password,
        confirm_password: password,
        terms: false,
      }),
    });
    console.log('   Unchecked terms response:', noTermsRes.status, '(Expected 400)');
    if (noTermsRes.status !== 400) throw new Error('Expected 400 for unchecked terms');

    // Successful registration
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test Founder',
        email: testEmail,
        password: password,
        confirm_password: password,
        terms: true,
      }),
    });
    const regData = await regRes.json();
    console.log('   Valid registration status:', regRes.status, regData.message);
    console.log('   Requires verification flag:', regData.requires_verification);
    if (!regData.success || !regData.requires_verification) {
      throw new Error('Registration did not require verification');
    }

    const unverifiedToken = regData.token;

    // ──────────────────────────────────────────
    // 2. TEST OTP RECORD IN DATABASE
    // ──────────────────────────────────────────
    console.log('\n▶ [2] Verifying OTP Record in MySQL database...');
    const [verRows] = await pool.execute(
      `SELECT v.*, u.email_verified 
       FROM email_verifications v
       JOIN users u ON v.user_id = u.id
       WHERE u.email = ? AND v.used = 0
       ORDER BY v.created_at DESC LIMIT 1`,
      [testEmail]
    );

    if (verRows.length === 0) throw new Error('No OTP record found in database');
    console.log('   OTP Hash stored:', verRows[0].otp_hash.substring(0, 25) + '... (bcrypt hashed)');
    console.log('   Initial attempts:', verRows[0].attempts);
    console.log('   User email_verified status in DB:', verRows[0].email_verified, '(Expected 0)');

    // ──────────────────────────────────────────
    // 3. TEST ACCESS CONTROL ON UNVERIFIED USER
    // ──────────────────────────────────────────
    console.log('\n▶ [3] Testing Access Control (Unverified user blocked from startups)...');
    const blockedRes = await fetch(`${BASE_URL}/api/startups`, {
      headers: { Authorization: `Bearer ${unverifiedToken}` },
    });
    const blockedData = await blockedRes.json();
    console.log('   Startup access for unverified account:', blockedRes.status, blockedData.message);
    if (blockedRes.status !== 403) throw new Error('Expected 403 Forbidden for unverified user');

    // ──────────────────────────────────────────
    // 4. TEST INCORRECT OTP
    // ──────────────────────────────────────────
    console.log('\n▶ [4] Testing Incorrect OTP Submission...');
    const wrongOtpRes = await fetch(`${BASE_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '000000' }),
    });
    const wrongOtpData = await wrongOtpRes.json();
    console.log('   Wrong OTP response:', wrongOtpRes.status, wrongOtpData.message);
    if (wrongOtpRes.status !== 400) throw new Error('Expected 400 for incorrect OTP');

    // Check attempts incremented in DB
    const [attRows] = await pool.execute(
      `SELECT attempts FROM email_verifications WHERE id = ?`,
      [verRows[0].id]
    );
    console.log('   Attempts incremented in DB to:', attRows[0].attempts, '(Expected 1)');
    if (attRows[0].attempts !== 1) throw new Error('Attempts count did not increment');

    // ──────────────────────────────────────────
    // 5. TEST RESEND COOLDOWN & RESEND FUNCTIONALITY
    // ──────────────────────────────────────────
    console.log('\n▶ [5] Testing Resend OTP Cooldown (60s rate limit)...');
    const resendCooldownRes = await fetch(`${BASE_URL}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const cooldownData = await resendCooldownRes.json();
    console.log('   Immediate resend response:', resendCooldownRes.status, cooldownData.message);
    if (resendCooldownRes.status !== 429) throw new Error('Expected 429 Too Many Requests for cooldown');

    // ──────────────────────────────────────────
    // 6. TEST CORRECT OTP VERIFICATION
    // ──────────────────────────────────────────
    console.log('\n▶ [6] Testing Correct OTP Verification...');
    const bcrypt = await import('bcryptjs');
    const knownOTP = '789123';
    const newHash = await bcrypt.default.hash(knownOTP, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Insert fresh verification code
    await pool.execute(
      `UPDATE email_verifications SET used = 1 WHERE user_id = ?`,
      [verRows[0].user_id]
    );
    await pool.execute(
      `INSERT INTO email_verifications (user_id, otp_hash, expires_at, attempts, used)
       VALUES (?, ?, ?, 0, 0)`,
      [verRows[0].user_id, newHash, expiresAt]
    );

    const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: knownOTP }),
    });
    const verifyData = await verifyRes.json();
    console.log('   Correct OTP status:', verifyRes.status, verifyData.message);
    console.log('   User verified in response:', verifyData.user?.email_verified);
    if (!verifyData.success || !verifyData.user?.email_verified) {
      throw new Error('Email verification failed');
    }

    const verifiedToken = verifyData.token;

    // Check DB updated
    const [uRows] = await pool.execute(
      `SELECT email_verified FROM users WHERE id = ?`,
      [verRows[0].user_id]
    );
    console.log('   Database user email_verified column:', uRows[0].email_verified, '(Expected 1)');

    // ──────────────────────────────────────────
    // 7. TEST LOGIN WITH VERIFIED ACCOUNT
    // ──────────────────────────────────────────
    console.log('\n▶ [7] Testing Login With Verified Account...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password }),
    });
    const loginData = await loginRes.json();
    console.log('   Login status:', loginRes.status, loginData.message);
    console.log('   Requires verification flag after verification:', loginData.requires_verification, '(Expected false)');
    if (loginData.requires_verification !== false) {
      throw new Error('Verified account still shows requires_verification');
    }

    // ──────────────────────────────────────────
    // 8. TEST PROTECTED STARTUP ACCESS AFTER VERIFICATION
    // ──────────────────────────────────────────
    console.log('\n▶ [8] Testing Protected Startup Creation with Verified Account...');
    const startupRes = await fetch(`${BASE_URL}/api/startups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${verifiedToken}`,
      },
      body: JSON.stringify({
        name: 'Apex AI Sizing',
        tagline: 'Autonomous market intelligence for B2B startups',
        industry: 'Enterprise SaaS',
        stage: 'Validation',
        target_customer: 'Pre-seed founders and incubator directors',
        problem_statement: 'Market sizing spreadsheets are outdated and take weeks to research.',
        solution_statement: 'Instant automated TAM/SAM/SOM calculation using verified industry benchmarks.',
      }),
    });
    const startupData = await startupRes.json();
    console.log('   Startup created response:', startupRes.status, startupData.startup?.name);
    if (startupRes.status !== 201) throw new Error('Startup creation failed for verified user');

    // Fetch user's startups
    const listRes = await fetch(`${BASE_URL}/api/startups`, {
      headers: { Authorization: `Bearer ${verifiedToken}` },
    });
    const listData = await listRes.json();
    console.log('   Startups retrieved:', listData.count, 'records owned by user');
    if (listData.count !== 1) throw new Error('Startup list count mismatch');

    console.log('\n====================================================');
    console.log('🎉 ALL 8 BACKEND & SECURITY VERIFICATION CHECKS PASSED!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    process.exit(0);
  }
}

runComprehensiveTests();
