import axios from 'axios'
import { getHeaders } from '../utils/headers'

const API_URL = 'http://localhost:8080/api/projects'

/**
 * Structure of a release version (SemVer).
 */
export interface ReleaseVersion {
  major: number
  minor: number
  patch: number
}

/**
 * Data required to create a release.
 */
export interface CreateReleaseRequest {
  version: ReleaseVersion
  releaseNotes?: string
  issueIds?: number[]
}

/**
 * Structure of a release response.
 */
export interface ReleaseResponse {
  id: number
  version: ReleaseVersion
  createdAt: string
  releaseNotes?: string
  creatorId: number
  issueIds: readonly number[]
  projectId: string
}

/**
 * Service managing release-related operations.
 */
const releaseService = {
  /**
   * Creates a new release for a project.
   * @param projectId - The project ID
   * @param releaseData - The data of the release to create
   * @returns The created release
   */
  async createRelease(projectId: string, releaseData: CreateReleaseRequest): Promise<ReleaseResponse> {
    const response = await axios.post(
      `${API_URL}/${projectId}/releases`,
      releaseData,
      { headers: getHeaders() }
    )
    return response.data
  },

  /**
   * Retrieves all releases of a project.
   * @param projectId - The project ID
   * @returns List of releases
   */
  async getReleases(projectId: string): Promise<ReleaseResponse[]> {
    const response = await axios.get(
      `${API_URL}/${projectId}/releases`,
      { headers: getHeaders() }
    )
    return response.data
  }
}

export default releaseService
