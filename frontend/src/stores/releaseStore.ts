import { reactive, readonly } from 'vue'
import releaseService, { type CreateReleaseRequest, type ReleaseResponse } from '../services/releaseService'

/**
 * State of the release store.
 */
interface ReleaseState {
  releases: ReleaseResponse[]
  error: string | null
  loading: boolean
}

const state = reactive<ReleaseState>({
  releases: [],
  error: null,
  loading: false
})

/**
 * Store managing release state.
 */
export const releaseStore = {
  /** Read-only state */
  state: readonly(state),

  /**
   * Create a new release
   * @param projectId Project ID
   * @param releaseData Release data
   * @returns The created release
   */
  async createRelease(projectId: string, releaseData: CreateReleaseRequest) {
    state.error = null
    state.loading = true
    try {
      const response = await releaseService.createRelease(projectId, releaseData)
      state.releases.unshift(response)
      return response
    } catch (error: any) {
      state.error = error.response?.data?.message || 'Error creating release'
      throw error
    } finally {
      state.loading = false
    }
  },

  /**
   * Get the list of releases sort by creation date descending
   * @param projectId Project ID
   * @returns A list of releases
   */
  async getReleases(projectId: string) {
    state.error = null
    state.loading = true
    try {
      const response = await releaseService.getReleases(projectId)
      state.releases = [...response].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      return response
    } catch (error: any) {
      state.error = error.response?.data?.message || 'Error loading releases'
      throw error
    } finally {
      state.loading = false
    }
  },

  /**
   * Resets release state.
   */
  clearReleases() {
    state.releases = []
    state.error = null
    state.loading = false
  }
}

export default releaseStore
