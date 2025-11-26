import axios from 'axios'

const API_URL = '/api/documentation-issues'

export interface DocumentationIssueDto {
  id?: number
  documentationId: number
  issueId: number
  issueTitle: string
  issuePriority: string
  issueStatus: string
  createdAt?: string
}

const documentationIssueService = {
  /**
   * Retrieves all issues linked to a documentation.
   * @param documentationId - The ID of the documentation.
   * @returns A list of linked issues.
   */
  async getIssuesByDocumentation(documentationId: number): Promise<DocumentationIssueDto[]> {
    const response = await axios.get<DocumentationIssueDto[]>(
      `${API_URL}/documentation/${documentationId}`
    )
    return response.data
  },

  /**
   * Retrieves all documentations linked to an issue.
   * @param issueId - The ID of the issue.
   * @returns A list of linked documentations.
   */
  async getDocumentationsByIssue(issueId: number): Promise<DocumentationIssueDto[]> {
    const response = await axios.get<DocumentationIssueDto[]>(`${API_URL}/issue/${issueId}`)
    return response.data
  },

  /**
   * Links a documentation to an issue.
   * @param documentationId - The ID of the documentation.
   * @param issueId - The ID of the issue.
   * @returns The created link.
   */
  async linkDocumentationToIssue(
    documentationId: number,
    issueId: number
  ): Promise<DocumentationIssueDto> {
    const response = await axios.post<DocumentationIssueDto>(
      `${API_URL}/documentation/${documentationId}/issue/${issueId}`
    )
    return response.data
  },

  /**
   * Unlinks a documentation from an issue.
   * @param documentationId - The ID of the documentation.
   * @param issueId - The ID of the issue.
   */
  async unlinkDocumentationFromIssue(documentationId: number, issueId: number): Promise<void> {
    await axios.delete(`${API_URL}/documentation/${documentationId}/issue/${issueId}`)
  }
}

export default documentationIssueService
