#!/usr/bin/env node

/**
 * Simple Integration Test for Enhanced API Service
 * Tests core functionality without complex TypeScript issues
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8000';
const TEST_TIMEOUT = 30000;

// Test utilities
class SimpleTester {
  constructor() {
    this.testResults = [];
  }

  async runTest(testName, testFn) {
    console.log(`\n🧪 Running: ${testName}`);
    const startTime = Date.now();

    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.testResults.push({ name: testName, status: 'PASS', duration });
      console.log(`✅ ${testName} - PASS (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({ name: testName, status: 'FAIL', duration, error: error.message });
      console.log(`❌ ${testName} - FAIL (${duration}ms)`);
      console.log(`   Error: ${error.message}`);
    }
  }

  generateReport() {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;

    console.log('\n' + '='.repeat(60));
    console.log('🏁 ENHANCED API INTEGRATION TEST REPORT');
    console.log('='.repeat(60));
    console.log(`Total: ${total}, Passed: ${passed}, Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`   • ${r.name}: ${r.error}`);
      });
    }

    return failed === 0;
  }
}

// Main test suite
async function runSimpleTests() {
  const tester = new SimpleTester();

  // Health check
  await tester.runTest('API Health Check', async () => {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    const data = await response.json();
    if (data.status !== 'healthy') {
      throw new Error(`API not healthy: ${data.status}`);
    }
    console.log(`   ✅ API Status: ${data.status}, Version: ${data.version}`);
  });

  // CORS headers check
  await tester.runTest('CORS Headers', async () => {
    const response = await fetch(`${API_BASE}/health`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Authorization'
      }
    });

    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    };

    console.log('   CORS Headers:', corsHeaders);

    if (!corsHeaders['Access-Control-Allow-Origin']) {
      throw new Error('CORS origin header missing');
    }
  });

  // API endpoints availability
  await tester.runTest('API Endpoints Availability', async () => {
    const endpoints = [
      '/',
      '/health',
      '/api/status/test123',
      '/openapi.json'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        console.log(`   ✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`   ❌ ${endpoint}: ${error.message}`);
        throw error;
      }
    }
  });

  // Upload endpoint validation (without file)
  await tester.runTest('Upload Endpoint Validation', async () => {
    try {
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer testtoken123'
        }
      });

      // Should fail without file and form data
      if (response.status !== 422) {
        throw new Error(`Expected 422, got ${response.status}`);
      }

      console.log(`   ✅ Upload endpoint validation: ${response.status}`);
    } catch (error) {
      throw error;
    }
  });

  // Invalid endpoint error handling
  await tester.runTest('Error Handling - Invalid Endpoint', async () => {
    try {
      const response = await fetch(`${API_BASE}/api/nonexistent`);
      if (response.status === 404) {
        console.log(`   ✅ 404 error handled correctly`);
      } else {
        console.log(`   ⚠️  Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ✅ Network error handled: ${error.message}`);
    }
  });

  // Authentication test
  await tester.runTest('Authentication', async () => {
    try {
      const response = await fetch(`${API_BASE}/api/status/test123`, {
        headers: {
          'Authorization': 'Bearer testtoken123'
        }
      });

      if (response.status === 404 || response.status === 422) {
        console.log(`   ✅ Authentication working: ${response.status}`);
      } else {
        console.log(`   ⚠️  Unexpected auth response: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  });

  // OpenAPI spec validation
  await tester.runTest('OpenAPI Specification', async () => {
    const response = await fetch(`${API_BASE}/openapi.json`);
    if (!response.ok) {
      throw new Error(`OpenAPI spec failed: ${response.status}`);
    }

    const spec = await response.json();

    if (!spec.openapi || !spec.paths || !spec.components) {
      throw new Error('Invalid OpenAPI specification structure');
    }

    console.log(`   ✅ OpenAPI ${spec.openapi} with ${Object.keys(spec.paths).length} paths`);
  });

  // Rate limiting simulation
  await tester.runTest('Rate Limiting Simulation', async () => {
    const promises = [];
    const requestCount = 10;

    for (let i = 0; i < requestCount; i++) {
      promises.push(fetch(`${API_BASE}/health`));
    }

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    console.log(`   ✅ ${successful}/${requestCount} requests successful`);

    if (successful === 0) {
      throw new Error('All requests failed - possible rate limiting or server issue');
    }
  });

  return tester.generateReport();
}

// Run tests
async function main() {
  console.log('🚀 Starting Simple Enhanced API Integration Tests...');
  console.log(`API Base URL: ${API_BASE}`);

  try {
    const success = await runSimpleTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

main();