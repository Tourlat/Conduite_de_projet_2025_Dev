import axios from 'axios'
import { getHeaders } from '../utils'

export interface TestResponse {
  id: number
  programCode: string
  testCode: string
  issueId: number
  creatorId: number
  createdAt: string
}

export interface CreateTestRequest {
  programCode: string
  testCode: string
}

const testService = {
  async createTest(
    projectId: string,
    issueId: number,
    request: CreateTestRequest
  ): Promise<TestResponse> {
    const response = await axios.post(
      `/api/projects/${projectId}/issues/${issueId}/tests`,
      request,
      { headers: getHeaders() }
    )
    return response.data
  },

  async getTestsByIssue(projectId: string, issueId: number): Promise<TestResponse[]> {
    const response = await axios.get(
      `/api/projects/${projectId}/issues/${issueId}/tests`,
      { headers: getHeaders() }
    )
    return response.data
  },

  async deleteTest(projectId: string, issueId: number, testId: number): Promise<void> {
    await axios.delete(
      `/api/projects/${projectId}/issues/${issueId}/tests/${testId}`,
      { headers: getHeaders() }
    )
  }
}

export default testService