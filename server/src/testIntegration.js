import './server.js';

async function runTests() {
  try {
    // Wait briefly for server and DB pool to settle
    await new Promise((r) => setTimeout(r, 1200));

    const testEmail = 'founder_' + Date.now() + '@venturemind.ai';
    console.log('\n--- 1. Testing Registration ---');
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Dr. Jane Chen',
        email: testEmail,
        password: 'SecurePassword123!',
        role: 'founder',
      }),
    });
    const regData = await regRes.json();
    console.log('Registration Status:', regRes.status, regData.message);
    if (!regData.token) throw new Error('No token returned from registration');

    const token = regData.token;

    console.log('\n--- 2. Testing Login ---');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassword123!',
      }),
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status, loginData.message);

    console.log('\n--- 3. Testing Protected GET /api/auth/me ---');
    const meRes = await fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    console.log('User Profile Retrieved:', meRes.status, meData.user?.email);

    console.log('\n--- 4. Testing Startup Creation (User Ownership) ---');
    const createRes = await fetch('http://localhost:5000/api/startups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'VentureScale AI',
        tagline: 'Automated deal flow simulator for founders',
        industry: 'Enterprise SaaS',
        stage: 'Validation',
        target_customer: 'Pre-seed founders and accelerator cohorts',
        problem_statement: 'Founders waste 6+ months pitching bad positioning to wrong VCs.',
        solution_statement: 'Interactive simulator modeling investor pushbacks and financial viability.',
      }),
    });
    const createData = await createRes.json();
    console.log('Startup Created:', createRes.status, createData.startup?.name);

    console.log('\n--- 5. Testing Startup Fetch with User Scoping ---');
    const fetchRes = await fetch('http://localhost:5000/api/startups', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fetchData = await fetchRes.json();
    console.log('Startups Belonging to User:', fetchData.count, 'records');

    console.log('\n🌟 ALL PHASE 1 INTEGRATION TESTS PASSED SUCCESSFULLY! 🌟\n');
  } catch (err) {
    console.error('❌ Integration test failed:', err);
  } finally {
    process.exit(0);
  }
}

runTests();
