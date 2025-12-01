import { reactive, readonly } from 'vue'
import testService, { type TestResponse, type CreateTestRequest } from '../services/testservice'

interface TestState {
  savedTests: TestResponse[]
  currentCode: string
  currentTests: string
  results: TestResult | null
  isRunning: boolean
  loading: boolean
  error: string | null
}

interface TestResult {
  success: boolean
  output?: string
  error?: string
}

const state = reactive<TestState>({
  savedTests: [],
  currentCode: '',
  currentTests: '',
  results: null,
  isRunning: false,
  loading: false,
  error: null
})

/**
 * Test Store (Reactive Store Pattern).
 * Manages test execution state, saved tests, and test playground data.
 */
export const testStore = {
  // Expose read-only state
  state: readonly(state),

  /**
   * Load saved tests for a specific issue
   * @param projectId Project ID
   * @param issueId Issue ID
   */
  async loadTests(projectId: string, issueId: number) {
    state.loading = true
    state.error = null
    try {
      const tests = await testService.getTestsByIssue(projectId, issueId)
      state.savedTests = tests
      return tests
    } catch (error: any) {
      state.error = error.message || 'Error loading tests'
      throw error
    } finally {
      state.loading = false
    }
  },

  /**
   * Create and save a new test
   * @param projectId Project ID
   * @param issueId Issue ID
   * @param request Test data (code and tests)
   */
  async createTest(projectId: string, issueId: number, request: CreateTestRequest) {
    state.loading = true
    state.error = null
    try {
      const createdTest = await testService.createTest(projectId, issueId, request)
      state.savedTests.push(createdTest)
      return createdTest
    } catch (error: any) {
      state.error = error.message || 'Error creating test'
      throw error
    } finally {
      state.loading = false
    }
  },

  /**
   * Delete a saved test
   * @param projectId Project ID
   * @param issueId Issue ID
   * @param testId Test ID to delete
   */
  async deleteTest(projectId: string, issueId: number, testId: number) {
    state.loading = true
    state.error = null
    try {
      await testService.deleteTest(projectId, issueId, testId)
      state.savedTests = state.savedTests.filter(t => t.id !== testId)
    } catch (error: any) {
      state.error = error.message || 'Error deleting test'
      throw error
    } finally {
      state.loading = false
    }
  },

  /**
   * Update current code in the playground
   * @param code New code content
   */
  setCurrentCode(code: string) {
    state.currentCode = code
  },

  /**
   * Update current tests in the playground
   * @param tests New tests content
   */
  setCurrentTests(tests: string) {
    state.currentTests = tests
  },

  /**
   * Load a saved test into the playground
   * @param test Test to load
   */
  loadSavedTest(test: TestResponse) {
    state.currentCode = test.programCode
    state.currentTests = test.testCode
  },

  /**
   * Set test execution results
   * @param results Test execution results
   */
  setResults(results: TestResult | null) {
    state.results = results
  },

  /**
   * Set test running state
   * @param isRunning Whether tests are currently running
   */
  setIsRunning(isRunning: boolean) {
    state.isRunning = isRunning
  },

  /**
   * Clear all test results
   */
  clearResults() {
    state.results = null
  },

  /**
   * Clear error message
   */
  clearError() {
    state.error = null
  },

  /**
   * Get a specific saved test by ID
   * @param testId Test ID
   */
  getTestById(testId: number): TestResponse | undefined {
    return state.savedTests.find(t => t.id === testId)
  },

  /**
   * Clear the store state
   */
  clear() {
    state.savedTests = []
    state.currentCode = ''
    state.currentTests = ''
    state.results = null
    state.isRunning = false
    state.loading = false
    state.error = null
  }
}

export default testStore
