import { describe, it, expect, vi, beforeEach } from 'vitest'
import testService from '../testservice'
import axios from 'axios'

vi.mock('axios')
vi.mock('../../utils', () => ({
  getHeaders: vi.fn(() => ({ Authorization: 'Bearer mock-token' }))
}))

describe('testService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTest', () => {
    it('devrait créer un nouveau test avec succès', async () => {
      const mockResponse = {
        id: 1,
        programCode: 'const x = 42;',
        testCode: 'console.log(x);',
        issueId: 123,
        creatorId: 1,
        createdAt: '2024-01-01T10:00:00'
      }

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse })

      const result = await testService.createTest('project-1', 123, {
        programCode: 'const x = 42;',
        testCode: 'console.log(x);'
      })

      expect(axios.post).toHaveBeenCalledWith(
        '/api/projects/project-1/issues/123/tests',
        {
          programCode: 'const x = 42;',
          testCode: 'console.log(x);'
        },
        { headers: { Authorization: 'Bearer mock-token' } }
      )
      expect(result).toEqual(mockResponse)
    })

    it('devrait gérer les erreurs lors de la création d\'un test', async () => {
      const errorMessage = 'Failed to create test'
      vi.mocked(axios.post).mockRejectedValue(new Error(errorMessage))

      await expect(
        testService.createTest('project-1', 123, {
          programCode: 'code',
          testCode: 'test'
        })
      ).rejects.toThrow(errorMessage)
    })

    it('devrait envoyer les bons en-têtes pour la création', async () => {
      const mockResponse = {
        id: 1,
        programCode: 'code',
        testCode: 'test',
        issueId: 123,
        creatorId: 1,
        createdAt: '2024-01-01T10:00:00'
      }

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse })

      await testService.createTest('project-1', 123, {
        programCode: 'code',
        testCode: 'test'
      })

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        { headers: { Authorization: 'Bearer mock-token' } }
      )
    })
  })

  describe('getTestsByIssue', () => {
    it('devrait récupérer tous les tests d\'une issue', async () => {
      const mockTests = [
        {
          id: 1,
          programCode: 'const a = 1;',
          testCode: 'console.log(a);',
          issueId: 456,
          creatorId: 1,
          createdAt: '2024-01-01T10:00:00'
        },
        {
          id: 2,
          programCode: 'const b = 2;',
          testCode: 'console.log(b);',
          issueId: 456,
          creatorId: 2,
          createdAt: '2024-01-02T10:00:00'
        }
      ]

      vi.mocked(axios.get).mockResolvedValue({ data: mockTests })

      const result = await testService.getTestsByIssue('project-2', 456)

      expect(axios.get).toHaveBeenCalledWith(
        '/api/projects/project-2/issues/456/tests',
        { headers: { Authorization: 'Bearer mock-token' } }
      )
      expect(result).toEqual(mockTests)
      expect(result).toHaveLength(2)
    })

    it('devrait retourner un tableau vide si aucun test n\'existe', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] })

      const result = await testService.getTestsByIssue('project-1', 123)

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('devrait gérer les erreurs lors de la récupération des tests', async () => {
      const errorMessage = 'Failed to fetch tests'
      vi.mocked(axios.get).mockRejectedValue(new Error(errorMessage))

      await expect(
        testService.getTestsByIssue('project-1', 123)
      ).rejects.toThrow(errorMessage)
    })

    it('devrait construire l\'URL correctement', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] })

      await testService.getTestsByIssue('my-project', 999)

      expect(axios.get).toHaveBeenCalledWith(
        '/api/projects/my-project/issues/999/tests',
        expect.any(Object)
      )
    })
  })

  describe('deleteTest', () => {
    it('devrait supprimer un test avec succès', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: undefined })

      await testService.deleteTest('project-1', 123, 1)

      expect(axios.delete).toHaveBeenCalledWith(
        '/api/projects/project-1/issues/123/tests/1',
        { headers: { Authorization: 'Bearer mock-token' } }
      )
    })

    it('devrait gérer les erreurs lors de la suppression', async () => {
      const errorMessage = 'Test not found'
      vi.mocked(axios.delete).mockRejectedValue(new Error(errorMessage))

      await expect(
        testService.deleteTest('project-1', 123, 999)
      ).rejects.toThrow(errorMessage)
    })

    it('devrait construire l\'URL de suppression correctement', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: undefined })

      await testService.deleteTest('project-abc', 456, 789)

      expect(axios.delete).toHaveBeenCalledWith(
        '/api/projects/project-abc/issues/456/tests/789',
        { headers: { Authorization: 'Bearer mock-token' } }
      )
    })

    it('devrait inclure les en-têtes d\'authentification', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: undefined })

      await testService.deleteTest('project-1', 123, 1)

      expect(axios.delete).toHaveBeenCalledWith(
        expect.any(String),
        { headers: { Authorization: 'Bearer mock-token' } }
      )
    })

    it('devrait ne pas retourner de valeur après suppression', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: undefined })

      const result = await testService.deleteTest('project-1', 123, 1)

      expect(result).toBeUndefined()
    })
  })

  describe('Gestion des types', () => {
    it('devrait respecter l\'interface TestResponse pour createTest', async () => {
      const mockResponse = {
        id: 1,
        programCode: 'const x = 1;',
        testCode: 'expect(x).toBe(1);',
        issueId: 100,
        creatorId: 5,
        createdAt: '2024-01-01T10:00:00'
      }

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse })

      const result = await testService.createTest('project-1', 100, {
        programCode: 'const x = 1;',
        testCode: 'expect(x).toBe(1);'
      })

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('programCode')
      expect(result).toHaveProperty('testCode')
      expect(result).toHaveProperty('issueId')
      expect(result).toHaveProperty('creatorId')
      expect(result).toHaveProperty('createdAt')
    })

    it('devrait respecter l\'interface CreateTestRequest', async () => {
      const request = {
        programCode: 'function add(a, b) { return a + b; }',
        testCode: 'expect(add(2, 3)).toBe(5);'
      }

      vi.mocked(axios.post).mockResolvedValue({
        data: {
          id: 1,
          ...request,
          issueId: 1,
          creatorId: 1,
          createdAt: '2024-01-01T10:00:00'
        }
      })

      await testService.createTest('project-1', 1, request)

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          programCode: expect.any(String),
          testCode: expect.any(String)
        }),
        expect.any(Object)
      )
    })
  })

  describe('Intégration avec getHeaders', () => {
    it('devrait appeler getHeaders pour tous les appels API', async () => {
      const { getHeaders } = await import('../../utils')
      
      vi.mocked(axios.post).mockResolvedValue({ data: {} })
      vi.mocked(axios.get).mockResolvedValue({ data: [] })
      vi.mocked(axios.delete).mockResolvedValue({ data: undefined })

      await testService.createTest('p1', 1, { programCode: 'c', testCode: 't' })
      await testService.getTestsByIssue('p1', 1)
      await testService.deleteTest('p1', 1, 1)

      expect(getHeaders).toHaveBeenCalledTimes(3)
    })
  })

  describe('Gestion des erreurs réseau', () => {
    it('devrait gérer les erreurs de timeout', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Network timeout'))

      await expect(
        testService.getTestsByIssue('project-1', 1)
      ).rejects.toThrow('Network timeout')
    })

    it('devrait gérer les erreurs 401 Unauthorized', async () => {
      const error = new Error('Unauthorized')
      vi.mocked(axios.post).mockRejectedValue(error)

      await expect(
        testService.createTest('project-1', 1, { programCode: 'c', testCode: 't' })
      ).rejects.toThrow('Unauthorized')
    })

    it('devrait gérer les erreurs 404 Not Found', async () => {
      const error = new Error('Not found')
      vi.mocked(axios.delete).mockRejectedValue(error)

      await expect(
        testService.deleteTest('project-1', 1, 999)
      ).rejects.toThrow('Not found')
    })

    it('devrait gérer les erreurs 500 Server Error', async () => {
      const error = new Error('Internal server error')
      vi.mocked(axios.get).mockRejectedValue(error)

      await expect(
        testService.getTestsByIssue('project-1', 1)
      ).rejects.toThrow('Internal server error')
    })
  })
})
