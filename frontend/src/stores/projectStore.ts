import { reactive, readonly } from 'vue'
import projectService from '../services/projectService'
import userService from '../services/userService'

interface CreateProjectRequest {
  name: string
  description?: string
  collaborateurs?: string[]
}

interface ProjectResponse {
  id: string
  name: string
  description?: string
  collaborateurs?: string[]
}

interface ProjectState {
  projects: ProjectResponse[]
  users: any[]
  error: string | null
}

const state = reactive<ProjectState>({
  projects: [],
  users: [],
  error: null
})

/**
 * Project Store.
 * Manages the state of projects and users.
 */
export const projectStore = {

  // Expose read-only state
  state: readonly(state),

  /**
   * Creates a new project and adds it to the state.
   * @param projectData Data for the new project
   */
  async createProject(projectData: CreateProjectRequest) {
    state.error = null
    try {
      const response: ProjectResponse = await projectService.createProject(projectData)
      state.projects.push(response)
      return response
    } catch (error: any) {
      state.error = error.message || 'Error creating project'
      throw error
    }
  },

  /**
   * Fetches all projects and updates the state.
   */
  async getProjects() {
    state.error = null
    try {
      const response: ProjectResponse[] = await projectService.getProjects()
      state.projects = response
      return response
    } catch (error: any) {
      state.error = error.message || 'Error retrieving projects'
      throw error
    }
  },

  /**
   * Fetches all users and updates the state.
   */
  async getUsers() {
    state.error = null
    try {
      const response = await userService.getUsers()
      state.users = response
      return response
    } catch (error: any) {
      state.error = error.message || 'Error retrieving users'
      throw error
    }
  },

  /**
   * Retrieves a project by its ID from the local state.
   * @param id Project ID
   */
  getProjectById(id: string): ProjectResponse | undefined {
    return state.projects.find(p => p.id === id)
  },

  /**
   * Updates a project and reflects changes in the state.
   * @param projectId Project ID
   * @param data Data to update
   */
  async updateProject(projectId: string, data: { name: string; description?: string }) {
    state.error = null
    try {
      const response = await projectService.updateProject(projectId, data)
      const index = state.projects.findIndex(p => p.id === projectId)
      if (index !== -1) {
        state.projects[index] = response
      }
      return response
    } catch (error: any) {
      state.error = error.message || 'Error updating project'
      throw error
    }
  },

  /**
   * Fetches collaborators for a specific project.
   * @param projectId Project ID
   */
  async getProjectCollaborators(projectId: string) {
    state.error = null
    try {
      const response = await projectService.getProjectCollaborators(projectId)
      return response
    } catch (error: any) {
      state.error = error.message || 'Error retrieving collaborators'
      throw error
    }
  },

  /**
   * Adds collaborators to a project.
   * @param projectId Project ID
   * @param collaboratorEmails List of emails to add
   */
  async addProjectCollaborators(projectId: string, collaboratorEmails: string[]) {
    state.error = null
    try {
      const response = await projectService.addProjectCollaborators(projectId, collaboratorEmails)
      return response
    } catch (error: any) {
      state.error = error.message || 'Error adding collaborators'
      throw error
    }
  },

  /**
   * Removes a collaborator from a project.
   * @param projectId Project ID
   * @param collaboratorId Collaborator ID
   */
  async removeProjectCollaborator(projectId: string, collaboratorId: number) {
    state.error = null
    try {
      const response = await projectService.removeProjectCollaborator(projectId, collaboratorId)
      return response
    } catch (error: any) {
      state.error = error.message || 'Erreur lors de la suppression du collaborateur'
      throw error
    }
  },

  /**
   * Clears the store state.
   */
  clear() {
    state.projects = []
    state.users = []
    state.error = null
  },

  /**
   * Gets the current error message.
   */
  getError(): string | null {
    return state.error
  }
}

export default projectStore
