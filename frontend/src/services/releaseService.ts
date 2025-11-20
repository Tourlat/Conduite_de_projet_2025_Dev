import axios from 'axios'
import { getHeaders } from '../utils/headers'

const API_URL = '/api/projects'

export interface ReleaseVersion {
  major: number
  minor: number
  patch: number
}

export interface CreateReleaseRequest {
  version: ReleaseVersion
  releaseNotes?: string
  issueIds?: number[]
}

export interface ReleaseResponse {
  id: number
  version: ReleaseVersion
  createdAt: string
  releaseNotes?: string
  creatorId: number
  issueIds: readonly number[]
  projectId: string
}

const releaseService = {
  async createRelease(projectId: string, releaseData: CreateReleaseRequest): Promise<ReleaseResponse> {
    const response = await axios.post(
      `${API_URL}/${projectId}/releases`,
      releaseData,
      { headers: getHeaders() }
    )
    return response.data
  },

  async getReleases(projectId: string): Promise<ReleaseResponse[]> {
    const response = await axios.get(
      `${API_URL}/${projectId}/releases`,
      { headers: getHeaders() }
    )
    return response.data
  }
}

export default releaseService
