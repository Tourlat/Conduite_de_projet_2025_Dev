import { describe, it, expect, beforeEach, vi } from 'vitest'
import testStore from '../testStore'
import testService from '../../services/testservice'

// Mock the test service
vi.mock('../../services/testservice', () => ({
  default: {
    getTestsByIssue: vi.fn(),
    createTest: vi.fn(),
    deleteTest: vi.fn()
  }
}))

describe('testStore', () => {
  beforeEach(() => {
    // Clear store state before each test
    testStore.clear()
    vi.clearAllMocks()
  })

  describe('loadTests', () => {
    it('should load tests successfully', async () => {
      const mockTests = [
        { id: 1, programCode: 'code1', testCode: 'test1', issueId: 1, creatorId: 1, createdAt: '2024-01-01' },
        { id: 2, programCode: 'code2', testCode: 'test2', issueId: 1, creatorId: 1, createdAt: '2024-01-02' }
      ]
      
      vi.mocked(testService.getTestsByIssue).mockResolvedValue(mockTests)

      const result = await testStore.loadTests('project-1', 1)

      expect(testService.getTestsByIssue).toHaveBeenCalledWith('project-1', 1)
      expect(testStore.state.savedTests).toEqual(mockTests)
      expect(result).toEqual(mockTests)
      expect(testStore.state.loading).toBe(false)
      expect(testStore.state.error).toBe(null)
    })

    it('should handle load tests error', async () => {
      const errorMessage = 'Network error'
      vi.mocked(testService.getTestsByIssue).mockRejectedValue(new Error(errorMessage))

      await expect(testStore.loadTests('project-1', 1)).rejects.toThrow(errorMessage)
      
      expect(testStore.state.error).toBe(errorMessage)
      expect(testStore.state.loading).toBe(false)
    })
  })

  describe('createTest', () => {
    it('should create a test successfully', async () => {
      const newTest = {
        id: 3,
        programCode: 'new code',
        testCode: 'new test',
        issueId: 1,
        creatorId: 1,
        createdAt: '2024-01-03'
      }
      
      vi.mocked(testService.createTest).mockResolvedValue(newTest)

      const request = {
        programCode: 'new code',
        testCode: 'new test'
      }

      const result = await testStore.createTest('project-1', 1, request)

      expect(testService.createTest).toHaveBeenCalledWith('project-1', 1, request)
      expect(testStore.state.savedTests).toHaveLength(1)
      expect(testStore.state.savedTests[0]).toEqual(newTest)
      expect(result).toEqual(newTest)
      expect(testStore.state.loading).toBe(false)
      expect(testStore.state.error).toBe(null)
    })

    it('should handle create test error', async () => {
      const errorMessage = 'Failed to create test'
      vi.mocked(testService.createTest).mockRejectedValue(new Error(errorMessage))

      const request = { programCode: 'code', testCode: 'test' }

      await expect(testStore.createTest('project-1', 1, request)).rejects.toThrow(errorMessage)
      
      expect(testStore.state.error).toBe(errorMessage)
      expect(testStore.state.loading).toBe(false)
    })
  })

  describe('deleteTest', () => {
    it('should delete a test successfully', async () => {
      // Pre-populate store with tests via loadTests
      const mockTests = [
        { id: 1, programCode: 'code1', testCode: 'test1', issueId: 1, creatorId: 1, createdAt: '2024-01-01' },
        { id: 2, programCode: 'code2', testCode: 'test2', issueId: 1, creatorId: 1, createdAt: '2024-01-02' }
      ]
      vi.mocked(testService.getTestsByIssue).mockResolvedValue(mockTests)
      await testStore.loadTests('project-1', 1)

      vi.mocked(testService.deleteTest).mockResolvedValue(undefined)

      await testStore.deleteTest('project-1', 1, 1)

      expect(testService.deleteTest).toHaveBeenCalledWith('project-1', 1, 1)
      expect(testStore.state.savedTests).toHaveLength(1)
      expect(testStore.state.savedTests[0].id).toBe(2)
      expect(testStore.state.loading).toBe(false)
      expect(testStore.state.error).toBe(null)
    })

    it('should handle delete test error', async () => {
      const errorMessage = 'Failed to delete test'
      vi.mocked(testService.deleteTest).mockRejectedValue(new Error(errorMessage))

      await expect(testStore.deleteTest('project-1', 1, 1)).rejects.toThrow(errorMessage)
      
      expect(testStore.state.error).toBe(errorMessage)
      expect(testStore.state.loading).toBe(false)
    })
  })

  describe('setCurrentCode', () => {
    it('should update current code', () => {
      const code = 'console.log("Hello World")'
      testStore.setCurrentCode(code)
      expect(testStore.state.currentCode).toBe(code)
    })
  })

  describe('setCurrentTests', () => {
    it('should update current tests', () => {
      const tests = 'describe("test", () => {})'
      testStore.setCurrentTests(tests)
      expect(testStore.state.currentTests).toBe(tests)
    })
  })

  describe('loadSavedTest', () => {
    it('should load a saved test into current code and tests', () => {
      const test = {
        id: 1,
        programCode: 'saved code',
        testCode: 'saved test',
        issueId: 1,
        creatorId: 1,
        createdAt: '2024-01-01'
      }

      testStore.loadSavedTest(test)

      expect(testStore.state.currentCode).toBe('saved code')
      expect(testStore.state.currentTests).toBe('saved test')
    })
  })

  describe('setResults', () => {
    it('should set test results', () => {
      const results = { success: true, output: 'All tests passed' }
      testStore.setResults(results)
      expect(testStore.state.results).toEqual(results)
    })

    it('should clear results when set to null', () => {
      testStore.setResults({ success: false, error: 'Error' })
      testStore.setResults(null)
      expect(testStore.state.results).toBe(null)
    })
  })

  describe('setIsRunning', () => {
    it('should update running state', () => {
      testStore.setIsRunning(true)
      expect(testStore.state.isRunning).toBe(true)
      
      testStore.setIsRunning(false)
      expect(testStore.state.isRunning).toBe(false)
    })
  })

  describe('clearResults', () => {
    it('should clear test results', () => {
      testStore.setResults({ success: true, output: 'output' })
      testStore.clearResults()
      expect(testStore.state.results).toBe(null)
    })
  })

  describe('clearError', () => {
    it('should clear error message', async () => {
      // Trigger an error first
      vi.mocked(testService.getTestsByIssue).mockRejectedValue(new Error('Some error'))
      try {
        await testStore.loadTests('project-1', 1)
      } catch {
        // Expected to fail
      }
      
      expect(testStore.state.error).toBe('Some error')
      testStore.clearError()
      expect(testStore.state.error).toBe(null)
    })
  })

  describe('getTestById', () => {
    it('should return test with matching id', async () => {
      const tests = [
        { id: 1, programCode: 'code1', testCode: 'test1', issueId: 1, creatorId: 1, createdAt: '2024-01-01' },
        { id: 2, programCode: 'code2', testCode: 'test2', issueId: 1, creatorId: 1, createdAt: '2024-01-02' }
      ]
      
      vi.mocked(testService.getTestsByIssue).mockResolvedValue(tests)
      await testStore.loadTests('project-1', 1)

      const found = testStore.getTestById(2)
      expect(found).toEqual(tests[1])
    })

    it('should return undefined if test not found', () => {
      const found = testStore.getTestById(999)
      expect(found).toBeUndefined()
    })
  })

  describe('clear', () => {
    it('should reset all state to initial values', async () => {
      // Set some state
      const mockTests = [
        { id: 1, programCode: 'code', testCode: 'test', issueId: 1, creatorId: 1, createdAt: '2024-01-01' }
      ]
      vi.mocked(testService.getTestsByIssue).mockResolvedValue(mockTests)
      await testStore.loadTests('project-1', 1)
      
      testStore.setCurrentCode('code')
      testStore.setCurrentTests('tests')
      testStore.setResults({ success: true, output: 'output' })
      testStore.setIsRunning(true)

      // Clear
      testStore.clear()

      // Verify all cleared
      expect(testStore.state.savedTests).toEqual([])
      expect(testStore.state.currentCode).toBe('')
      expect(testStore.state.currentTests).toBe('')
      expect(testStore.state.results).toBe(null)
      expect(testStore.state.isRunning).toBe(false)
      expect(testStore.state.loading).toBe(false)
      expect(testStore.state.error).toBe(null)
    })
  })
})
