import { reactive, readonly } from 'vue'
import releaseService, { type CreateReleaseRequest, type ReleaseResponse } from '../services/releaseService'

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

export const releaseStore = {
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
      state.error = error.response?.data?.message || 'Erreur lors de la création de la release'
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
      state.error = error.response?.data?.message || 'Erreur lors du chargement des releases'
      throw error
    } finally {
      state.loading = false
    }
  },

  clearReleases() {
    state.releases = []
    state.error = null
    state.loading = false
  }
}

export default releaseStore
