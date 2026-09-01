process.env.PORT = 5050;
const { server } = require('../server');
const assert = require('assert');

const PORT = 5050;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function runTests() {
  console.log('\n=======================================');
  console.log('STARTING INTEGRATION TEST SUITE...');
  console.log('=======================================');

  let doctorCookie = '';
  let researcherCookie = '';
  let patientIdForTest = '';

  try {
    // Test Case 1: Server Health Check
    console.log('\n[Test 1] Health Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(healthRes.status, 200, 'Health check failed');
    const healthJson = await healthRes.json();
    assert.strictEqual(healthJson.success, true);
    console.log('✔ Passed');

    // Test Case 2: Login Failure with invalid credentials
    console.log('\n[Test 2] Login failure checking...');
    const failRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad@credentials.com', password: 'wrongpassword' })
    });
    assert.strictEqual(failRes.status, 401, 'Should block invalid credentials');
    console.log('✔ Passed');

    // Test Case 3: Login Success as Doctor
    console.log('\n[Test 3] Login success as Doctor...');
    const docRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doctor@healthforecast.com', password: 'password123' })
    });
    assert.strictEqual(docRes.status, 200, 'Doctor login failed');
    const docJson = await docRes.json();
    assert.strictEqual(docJson.user.role, 'doctor');
    // Extract set-cookie headers
    const rawCookies = docRes.headers.get('set-cookie');
    if (rawCookies) {
      doctorCookie = rawCookies.split(',').map(c => c.split(';')[0]).join('; ');
    }
    console.log('✔ Passed');

    // Test Case 4: Protected patient routes without Token
    console.log('\n[Test 4] Accessing protected route without credentials...');
    const blockRes = await fetch(`${BASE_URL}/api/patients`);
    assert.strictEqual(blockRes.status, 401, 'Should block unauthorized traffic');
    console.log('✔ Passed');

    // Test Case 5: Fetch Patients with Doctor credentials
    console.log('\n[Test 5] Fetching assigned patients as Doctor...');
    const patRes = await fetch(`${BASE_URL}/api/patients`, {
      headers: {
        'Cookie': doctorCookie
      }
    });
    assert.strictEqual(patRes.status, 200, 'Failed to fetch patients with valid session cookie');
    const patJson = await patRes.json();
    assert.ok(patJson.count >= 0);
    if (patJson.data.length > 0) {
      patientIdForTest = patJson.data[0]._id;
      console.log(`Fetched assigned patient: ${patJson.data[0].firstName} ${patJson.data[0].lastName}`);
    }
    console.log('✔ Passed');

    // Test Case 6: Login as Researcher
    console.log('\n[Test 6] Login as Researcher...');
    const resRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'researcher@healthforecast.com', password: 'password123' })
    });
    assert.strictEqual(resRes.status, 200, 'Researcher login failed');
    const resJson = await resRes.json();
    assert.strictEqual(resJson.user.role, 'researcher');
    const rawResCookies = resRes.headers.get('set-cookie');
    if (rawResCookies) {
      researcherCookie = rawResCookies.split(',').map(c => c.split(';')[0]).join('; ');
    }
    console.log('✔ Passed');

    // Test Case 7: Block Researcher from registering patients (RBAC check)
    console.log('\n[Test 7] Block Researcher from writing data (RBAC check)...');
    const writeBlockRes = await fetch(`${BASE_URL}/api/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': researcherCookie
      },
      body: JSON.stringify({
        firstName: 'Unauthorized',
        lastName: 'Patient',
        gender: 'Male'
      })
    });
    assert.strictEqual(writeBlockRes.status, 403, 'Researcher should be forbidden from writing patients');
    console.log('✔ Passed');

    console.log('\n=======================================');
    console.log('ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ✔');
    console.log('=======================================');
    
  } catch (error) {
    console.error('\n❌ INTEGRATION TEST FAILED:');
    console.error(error);
    process.exitCode = 1;
  } finally {
    console.log('\nShutting down integration test server...');
    server.close(() => {
      console.log('Server terminated.');
      process.exit();
    });
  }
}

// Allow time for DB connection before starting tests
setTimeout(runTests, 2000);
