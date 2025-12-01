#!/usr/bin/env node

/**
 * Enhanced Integration Tests for AutoFund AI
 * Tests the complete API integration with retry logic, error handling, and optimistic updates
 */

import { enhancedApiService, ApiError } from './app/services/enhanced-api';
import {
  ProcessResponse,
  TaskStatus,
  AnalysisResult,
  UploadRequest,
  FileDownloadType
} from './types/generated-api';
import fs from 'fs';
import path from 'path';

// Test configuration
const API_BASE = 'http://localhost:8000';
const TEST_TIMEOUT = 120000; // 2 minutes
const TEST_PDF_PATH = './IES - 2023.pdf';
const TEST_RESULTS_DIR = './test_results';

// Test utilities
class IntegrationTester {
  private testResults: Array<{
    testName: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    duration: number;
    error?: string;
    details?: any;
  }> = [];

  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
    // Ensure test results directory exists
    if (!fs.existsSync(TEST_RESULTS_DIR)) {
      fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
    }
  }

  async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    console.log(`\n🧪 Running: ${testName}`);

    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        status: 'PASS',
        duration,
      });
      console.log(`✅ ${testName} - PASS (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.testResults.push({
        testName,
        status: 'FAIL',
        duration,
        error: errorMessage,
        details: error
      });
      console.log(`❌ ${testName} - FAIL (${duration}ms)`);
      console.log(`   Error: ${errorMessage}`);
    }
  }

  async skipTest(testName: string, reason: string): Promise<void> {
    console.log(`\n⏭️  Skipping: ${testName} - ${reason}`);
    this.testResults.push({
      testName,
      status: 'SKIP',
      duration: 0,
      error: reason
    });
  }

  generateReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const skipped = this.testResults.filter(r => r.status === 'SKIP').length;
    const total = this.testResults.length;

    console.log('\n' + '='.repeat(80));
    console.log('🏁 ENHANCED API INTEGRATION TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Skipped: ${skipped} ⏭️`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${totalDuration}ms`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`   • ${r.testName}: ${r.error}`);
        });
    }

    if (skipped > 0) {
      console.log('\n⏭️  Skipped Tests:');
      this.testResults
        .filter(r => r.status === 'SKIP')
        .forEach(r => {
          console.log(`   • ${r.testName}: ${r.error}`);
        });
    }

    // Save detailed report to file
    const reportPath = path.join(TEST_RESULTS_DIR, `integration_report_${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: {
        total,
        passed,
        failed,
        skipped,
        successRate: (passed / total) * 100,
        totalDuration
      },
      tests: this.testResults,
      timestamp: new Date().toISOString()
    }, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Main test suite
async function runIntegrationTests() {
  const tester = new IntegrationTester();

  // Check if test PDF exists
  const testPdfExists = fs.existsSync(TEST_PDF_PATH);

  // Initialize enhanced API service
  const apiService = new enhancedApiService({
    baseURL: API_BASE,
    retryConfig: {
      maxRetries: 2,
      baseDelay: 500,
      maxDelay: 5000,
      backoffFactor: 1.5
    }
  });

  // Health check test
  await tester.runTest('Health Check', async () => {
    const health = await apiService.healthCheck();
    if (health.status !== 'healthy') {
      throw new Error(`API health check failed: ${health.status}`);
    }
    console.log(`   API Status: ${health.status}`);
  });

  // Connectivity test
  await tester.runTest('Connectivity Detection', async () => {
    const isOnline = apiService.isOnlineStatus();
    if (!isOnline) {
      throw new Error('API service reports offline status');
    }
    console.log(`   Connectivity: ${isOnline ? 'Online' : 'Offline'}`);
  });

  // Error handling test - invalid endpoint
  await tester.runTest('Error Handling - Invalid Endpoint', async () => {
    try {
      await apiService['request']({
        url: '/api/nonexistent',
        method: 'GET'
      });
      throw new Error('Should have thrown an error for invalid endpoint');
    } catch (error) {
      if (error instanceof ApiError) {
        console.log(`   Error handled correctly: ${error.message} (${error.status})`);
      } else {
        throw error;
      }
    }
  });

  // Error handling test - timeout simulation
  await tester.runTest('Error Handling - Timeout', async () => {
    try {
      // Simulate timeout with very short timeout
      await apiService['request']({
        url: '/health',
        method: 'GET',
        timeout: 1 // 1ms timeout should trigger
      });
      throw new Error('Should have timed out');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'TIMEOUT') {
        console.log(`   Timeout handled correctly: ${error.message}`);
      } else {
        throw error;
      }
    }
  });

  // Retry logic test - simulate retry
  await tester.runTest('Retry Logic Test', async () => {
    let requestCount = 0;

    // Add interceptor to count requests
    apiService.addInterceptor({
      onRequest: async (config) => {
        requestCount++;
        if (requestCount < 2) {
          // Simulate failure on first attempt
          throw new ApiError('Simulated failure', 500, 'SIMULATED_ERROR', true);
        }
        return config;
      }
    });

    await apiService.healthCheck();

    if (requestCount < 2) {
      throw new Error(`Expected at least 2 requests due to retry, got ${requestCount}`);
    }

    console.log(`   Retry logic executed ${requestCount} requests`);
  });

  // File upload validation test
  if (testPdfExists) {
    await tester.runTest('File Upload - Validation', async () => {
      const testFile = new File([fs.readFileSync(TEST_PDF_PATH)], 'test.pdf', {
        type: 'application/pdf'
      });

      const uploadData: UploadRequest = {
        nif: '508123456',
        ano_exercicio: '2023',
        designacao_social: 'Test Company Ltd',
        email: 'test@example.com',
        context: 'Integration test upload'
      };

      // Test progress tracking
      let progressUpdates = 0;
      const progressPromise = new Promise<UploadProgress[]>((resolve) => {
        const progressArray: UploadProgress[] = [];
        apiService.uploadFile(testFile, uploadData, (progress) => {
          progressArray.push(progress);
          progressUpdates++;
          if (progress.percentage === 100) {
            resolve(progressArray);
          }
        });
      });

      // This should succeed with proper validation
      const progress = await progressPromise;

      if (progressUpdates === 0) {
        throw new Error('No progress updates received');
      }

      console.log(`   Upload progress tracked: ${progressUpdates} updates`);
      console.log(`   Final progress: ${progress[progress.length - 1]?.percentage || 0}%`);
    });
  } else {
    await tester.skipTest('File Upload - Validation', `Test PDF not found at ${TEST_PDF_PATH}`);
  }

  // File upload error handling - invalid file type
  await tester.runTest('File Upload - Invalid File Type', async () => {
    const invalidFile = new File(['test content'], 'test.txt', {
      type: 'text/plain'
    });

    const uploadData: UploadRequest = {
      nif: '508123456',
      ano_exercicio: '2023',
      designacao_social: 'Test Company Ltd',
      email: 'test@example.com'
    };

    try {
      await apiService.uploadFile(invalidFile, uploadData);
      throw new Error('Should have rejected non-PDF file');
    } catch (error) {
      if (error instanceof ApiError) {
        console.log(`   Invalid file type handled: ${error.message}`);
      } else {
        throw error;
      }
    }
  });

  // Task status polling test
  if (testPdfExists) {
    await tester.runTest('Task Status Polling', async () => {
      const testFile = new File([fs.readFileSync(TEST_PDF_PATH)], 'test.pdf', {
        type: 'application/pdf'
      });

      const uploadData: UploadRequest = {
        nif: '508123456',
        ano_exercicio: '2023',
        designacao_social: 'Test Company Ltd',
        email: 'test@example.com'
      };

      // Upload file to get task ID
      const uploadResponse = await apiService.uploadFile(testFile, uploadData);

      if (!uploadResponse.task_id) {
        throw new Error('No task ID returned from upload');
      }

      // Test status polling
      let statusCount = 0;
      let finalStatus: TaskStatus | null = null;

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Status polling timeout'));
        }, 30000);

        apiService.pollTaskStatus(uploadResponse.task_id, (status) => {
          statusCount++;
          finalStatus = status;

          console.log(`   Status update ${statusCount}: ${status.status}`);

          if (status.status === 'completed' || status.status === 'error') {
            clearTimeout(timeout);
            resolve();
          }
        });
      });

      if (statusCount === 0) {
        throw new Error('No status updates received');
      }

      console.log(`   Polled status ${statusCount} times`);
      console.log(`   Final status: ${finalStatus?.status}`);
    });
  } else {
    await tester.skipTest('Task Status Polling', `Test PDF not found at ${TEST_PDF_PATH}`);
  }

  // Optimistic updates test
  await tester.runTest('Optimistic Updates', async () => {
    const { optimisticUpdateManager } = await import('./app/services/enhanced-api');

    // Test adding optimistic update
    const testData = { test: 'data', timestamp: Date.now() };
    const updateKey = 'test_optimistic_update';

    optimisticUpdateManager.addUpdate(updateKey, testData);

    // Verify update was added
    const pendingUpdate = optimisticUpdateManager.getPendingUpdate(updateKey);
    if (!pendingUpdate) {
      throw new Error('Optimistic update not found');
    }

    // Test rollback
    const rolledBackData = optimisticUpdateManager.rollbackUpdate(updateKey);
    if (rolledBackData !== testData) {
      throw new Error('Rollback returned incorrect data');
    }

    // Verify update was removed
    const removedUpdate = optimisticUpdateManager.getPendingUpdate(updateKey);
    if (removedUpdate) {
      throw new Error('Optimistic update not removed after rollback');
    }

    console.log('   Optimistic updates working correctly');
  });

  // Cache functionality test
  await tester.runTest('Cache Functionality', async () => {
    // Clear cache first
    apiService.clearCache();

    // First request should fetch from API
    const startTime1 = Date.now();
    const health1 = await apiService.healthCheck();
    const duration1 = Date.now() - startTime1;

    // Second request should use cache (faster)
    const startTime2 = Date.now();
    const health2 = await apiService.healthCheck();
    const duration2 = Date.now() - startTime2;

    // Cache should make second request faster
    if (duration2 >= duration1) {
      console.warn(`   Cache may not be working: ${duration1}ms vs ${duration2}ms`);
    }

    if (health1.status !== health2.status) {
      throw new Error('Cached response differs from original');
    }

    console.log(`   Cache test: ${duration1}ms vs ${duration2}ms`);
  });

  // Offline scenario simulation
  await tester.runTest('Offline Scenario', async () => {
    // Simulate offline status
    const originalOnlineStatus = apiService.isOnlineStatus();

    // Note: In a real scenario, you'd use navigator.offline simulation
    // For this test, we'll verify the offline queue functionality
    const queueLength = apiService.getOfflineQueueLength();

    // Queue should be empty when online
    if (queueLength > 0) {
      throw new Error(`Offline queue not empty when online: ${queueLength} items`);
    }

    console.log(`   Offline queue length: ${queueLength}`);
    console.log(`   Online status: ${originalOnlineStatus}`);
  });

  // TypeScript type validation test
  await tester.runTest('TypeScript Type Validation', async () => {
    const {
      isTaskStatus,
      isAnalysisResult,
      isValidationError,
      isApiError
    } = await import('./types/generated-api');

    // Test task status validation
    const validTaskStatus: TaskStatus = {
      task_id: 'test123',
      status: 'completed',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };

    if (!isTaskStatus(validTaskStatus)) {
      throw new Error('Task status validation failed');
    }

    // Test invalid task status
    if (isTaskStatus({ invalid: 'object' })) {
      throw new Error('Task status validation should have failed');
    }

    // Test analysis result validation
    const validAnalysisResult: AnalysisResult = {
      metadata: {
        nif: '508123456',
        ano_exercicio: '2023',
        designacao_social: 'Test',
        email: 'test@example.com',
        data_processamento: new Date().toISOString()
      },
      dados_financeiros: {
        volume_negocios: 1000000,
        ebitda: 150000,
        autonomia_financeira: 0.45,
        liquidez_geral: 1.8,
        margem_ebitda: 0.15
      },
      analise: {
        rating: 'MÉDIO',
        recomendacoes: ['Test recommendation']
      },
      ficheiros_gerados: {
        excel: 'test.xlsx',
        json: 'test.json'
      },
      download_urls: {
        excel: '/download/test/excel',
        json: '/download/test/json'
      }
    };

    if (!isAnalysisResult(validAnalysisResult)) {
      throw new Error('Analysis result validation failed');
    }

    console.log('   TypeScript type validation working correctly');
  });

  // Generate final report
  tester.generateReport();

  // Exit with appropriate code
  const failedTests = tester.testResults.filter(r => r.status === 'FAIL').length;
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('🚀 Starting Enhanced API Integration Tests...');
  console.log(`API Base URL: ${API_BASE}`);
  console.log(`Test Timeout: ${TEST_TIMEOUT}ms`);

  runIntegrationTests().catch((error) => {
    console.error('\n💥 Test suite failed to start:', error);
    process.exit(1);
  });
}

export { IntegrationTester };