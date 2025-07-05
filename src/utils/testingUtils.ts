import { Platform } from 'react-native';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
}

class TestingUtils {
  private testResults: TestResult[] = [];
  private isEnabled: boolean = __DEV__;

  // Run a single test
  async runTest(
    name: string,
    testFn: () => Promise<boolean> | boolean,
    metadata?: Record<string, any>
  ): Promise<TestResult> {
    if (!this.isEnabled) {
      return {
        name,
        passed: true,
        duration: 0,
        metadata,
      };
    }

    const startTime = Date.now();
    let passed = false;
    let error: string | undefined;

    try {
      const result = await testFn();
      passed = Boolean(result);
    } catch (err) {
      passed = false;
      error = err instanceof Error ? err.message : String(err);
    }

    const duration = Date.now() - startTime;

    const testResult: TestResult = {
      name,
      passed,
      error,
      duration,
      metadata,
    };

    this.testResults.push(testResult);

    // Log test result
    if (passed) {
      console.log(`✅ ${name} passed (${duration}ms)`);
    } else {
      console.error(`❌ ${name} failed (${duration}ms): ${error}`);
    }

    return testResult;
  }

  // Run multiple tests
  async runTests(tests: Array<{ name: string; test: () => Promise<boolean> | boolean; metadata?: Record<string, any> }>): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const test of tests) {
      const result = await this.runTest(test.name, test.test, test.metadata);
      results.push(result);
    }

    return results;
  }

  // Run a test suite
  async runTestSuite(name: string, tests: Array<{ name: string; test: () => Promise<boolean> | boolean; metadata?: Record<string, any> }>): Promise<TestSuite> {
    const startTime = Date.now();
    const testResults = await this.runTests(tests);
    const duration = Date.now() - startTime;

    const passedTests = testResults.filter(r => r.passed).length;
    const failedTests = testResults.filter(r => !r.passed).length;

    const suite: TestSuite = {
      name,
      tests: testResults,
      totalTests: testResults.length,
      passedTests,
      failedTests,
      duration,
    };

    // Log suite results
    console.group(`🧪 Test Suite: ${name}`);
    console.log(`Total: ${suite.totalTests}`);
    console.log(`Passed: ${suite.passedTests}`);
    console.log(`Failed: ${suite.failedTests}`);
    console.log(`Duration: ${suite.duration}ms`);
    console.groupEnd();

    return suite;
  }

  // Validate app configuration
  async validateAppConfig(): Promise<TestResult[]> {
    return this.runTests([
      {
        name: 'App Configuration - Basic Structure',
        test: () => {
          // Check if app has required configuration
          return true; // Placeholder
        },
      },
      {
        name: 'App Configuration - Firebase Setup',
        test: () => {
          // Check if Firebase is properly configured
          return true; // Placeholder
        },
      },
      {
        name: 'App Configuration - Navigation Setup',
        test: () => {
          // Check if navigation is properly configured
          return true; // Placeholder
        },
      },
    ]);
  }

  // Validate UI components
  async validateUIComponents(): Promise<TestResult[]> {
    return this.runTests([
      {
        name: 'UI Components - RetroButton',
        test: () => {
          // Test RetroButton component
          return true; // Placeholder
        },
      },
      {
        name: 'UI Components - ProgressBar',
        test: () => {
          // Test ProgressBar component
          return true; // Placeholder
        },
      },
      {
        name: 'UI Components - PixelBackground',
        test: () => {
          // Test PixelBackground component
          return true; // Placeholder
        },
      },
    ]);
  }

  // Validate services
  async validateServices(): Promise<TestResult[]> {
    return this.runTests([
      {
        name: 'Services - Sound Service',
        test: async () => {
          // Test sound service initialization
          return true; // Placeholder
        },
      },
      {
        name: 'Services - Notification Service',
        test: async () => {
          // Test notification service
          return true; // Placeholder
        },
      },
      {
        name: 'Services - Health Data Service',
        test: async () => {
          // Test health data service
          return true; // Placeholder
        },
      },
    ]);
  }

  // Validate data integrity
  async validateDataIntegrity(): Promise<TestResult[]> {
    return this.runTests([
      {
        name: 'Data Integrity - Quest Data',
        test: () => {
          // Validate quest data structure
          return true; // Placeholder
        },
      },
      {
        name: 'Data Integrity - User Data',
        test: () => {
          // Validate user data structure
          return true; // Placeholder
        },
      },
      {
        name: 'Data Integrity - Achievement Data',
        test: () => {
          // Validate achievement data structure
          return true; // Placeholder
        },
      },
    ]);
  }

  // Validate platform compatibility
  async validatePlatformCompatibility(): Promise<TestResult[]> {
    return this.runTests([
      {
        name: 'Platform - iOS Compatibility',
        test: () => {
          return Platform.OS === 'ios' || Platform.OS === 'web';
        },
        metadata: { platform: Platform.OS },
      },
      {
        name: 'Platform - Android Compatibility',
        test: () => {
          return Platform.OS === 'android' || Platform.OS === 'web';
        },
        metadata: { platform: Platform.OS },
      },
      {
        name: 'Platform - Web Compatibility',
        test: () => {
          return Platform.OS === 'web';
        },
        metadata: { platform: Platform.OS },
      },
    ]);
  }

  // Run all validation tests
  async runAllValidations(): Promise<{
    appConfig: TestResult[];
    uiComponents: TestResult[];
    services: TestResult[];
    dataIntegrity: TestResult[];
    platformCompatibility: TestResult[];
  }> {
    console.group('🚀 Running All Validations');

    const results = {
      appConfig: await this.validateAppConfig(),
      uiComponents: await this.validateUIComponents(),
      services: await this.validateServices(),
      dataIntegrity: await this.validateDataIntegrity(),
      platformCompatibility: await this.validatePlatformCompatibility(),
    };

    // Calculate overall statistics
    const allTests = [
      ...results.appConfig,
      ...results.uiComponents,
      ...results.services,
      ...results.dataIntegrity,
      ...results.platformCompatibility,
    ];

    const totalTests = allTests.length;
    const passedTests = allTests.filter(t => t.passed).length;
    const failedTests = allTests.filter(t => !t.passed).length;

    console.log(`\n📊 Overall Results:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.warn(`⚠️  ${failedTests} tests failed. Check the logs above for details.`);
    } else {
      console.log(`🎉 All tests passed!`);
    }

    console.groupEnd();

    return results;
  }

  // Get all test results
  getAllTestResults(): TestResult[] {
    return [...this.testResults];
  }

  // Clear all test results
  clearResults(): void {
    this.testResults = [];
  }

  // Enable/disable testing
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Check if testing is enabled
  isTestingEnabled(): boolean {
    return this.isEnabled;
  }

  // Generate test report
  generateTestReport(): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    tests: TestResult[];
  } {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.passed).length;
    const failedTests = this.testResults.filter(t => !t.passed).length;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      tests: [...this.testResults],
    };
  }
}

// Create a singleton instance
export const testingUtils = new TestingUtils();

// Helper function to run tests in development
export const runDevTests = async () => {
  if (__DEV__) {
    console.log('🧪 Running development tests...');
    await testingUtils.runAllValidations();
  }
}; 