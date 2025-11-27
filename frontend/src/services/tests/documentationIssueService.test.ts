import { describe, it, expect, vi, beforeEach } from 'vitest'
import documentationIssueService from '../../services/documentationIssueService'
import axios from 'axios'

vi.mock('axios')

describe('documentationIssueService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait récupérer les issues liées à une documentation', async () => {
    const mockData = [
      {
        id: 1,
        documentationId: 1,
        issueId: 1,
        issueTitle: 'Bug fix',
        issuePriority: 'HIGH',
        issueStatus: 'TODO',
        createdAt: '2024-01-01T10:00:00'
      },
      {
        id: 2,
        documentationId: 1,
        issueId: 2,
        issueTitle: 'Feature request',
        issuePriority: 'MEDIUM',
        issueStatus: 'IN_PROGRESS',
        createdAt: '2024-01-02T10:00:00'
      }
    ]

    vi.mocked(axios.get).mockResolvedValue({ data: mockData })

    const result = await documentationIssueService.getIssuesByDocumentation(1)

    expect(axios.get).toHaveBeenCalledWith('/api/documentation-issues/documentation/1')
    expect(result).toEqual(mockData)
  })

  it('devrait récupérer les documentations liées à une issue', async () => {
    const mockData = [
      {
        id: 1,
        documentationId: 1,
        issueId: 1,
        issueTitle: 'Bug fix',
        issuePriority: 'HIGH',
        issueStatus: 'TODO',
        createdAt: '2024-01-01T10:00:00'
      }
    ]

    vi.mocked(axios.get).mockResolvedValue({ data: mockData })

    const result = await documentationIssueService.getDocumentationsByIssue(1)

    expect(axios.get).toHaveBeenCalledWith('/api/documentation-issues/issue/1')
    expect(result).toEqual(mockData)
  })

  it('devrait lier une documentation à une issue', async () => {
    const mockData = {
      id: 1,
      documentationId: 1,
      issueId: 2,
      issueTitle: 'New feature',
      issuePriority: 'MEDIUM',
      issueStatus: 'TODO',
      createdAt: '2024-01-03T10:00:00'
    }

    vi.mocked(axios.post).mockResolvedValue({ data: mockData })

    const result = await documentationIssueService.linkDocumentationToIssue(1, 2)

    expect(axios.post).toHaveBeenCalledWith('/api/documentation-issues/documentation/1/issue/2')
    expect(result).toEqual(mockData)
  })

  it('devrait délier une documentation d\'une issue', async () => {
    vi.mocked(axios.delete).mockResolvedValue({ data: undefined })

    await documentationIssueService.unlinkDocumentationFromIssue(1, 2)

    expect(axios.delete).toHaveBeenCalledWith('/api/documentation-issues/documentation/1/issue/2')
  })

  it('devrait gérer les erreurs lors de la récupération des issues', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('Network error'))

    await expect(documentationIssueService.getIssuesByDocumentation(1)).rejects.toThrow(
      'Network error'
    )
  })

  it('devrait gérer les erreurs lors de la liaison', async () => {
    vi.mocked(axios.post).mockRejectedValue(new Error('Link already exists'))

    await expect(documentationIssueService.linkDocumentationToIssue(1, 2)).rejects.toThrow(
      'Link already exists'
    )
  })

  it('devrait gérer les erreurs lors du déliage', async () => {
    vi.mocked(axios.delete).mockRejectedValue(new Error('Link not found'))

    await expect(documentationIssueService.unlinkDocumentationFromIssue(1, 2)).rejects.toThrow(
      'Link not found'
    )
  })
})
