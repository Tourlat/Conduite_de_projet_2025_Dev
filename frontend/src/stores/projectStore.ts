import { reactive, readonly } from 'vue'
import projectService from '../services/projectService'
import userService from '../services/userService'

interface CreateProjectRequest {
  name: string
  description?: string
  collaborateurs?: string[]
}

interface ProjectResponse {
  id: number
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

export const projectStore = {

  state: readonly(state),

  async createProject(projectData: CreateProjectRequest) {
    state.error = null
    try {
      const response: ProjectResponse = await projectService.createProject(projectData)
      state.projects.push(response)
      return response
    } catch (error: any) {
      state.error = error.message || 'Erreur lors de la création du projet'
      throw error
    }
  },

  async getProjects() {
    state.error = null
    try {
      const response: ProjectResponse[] = await projectService.getProjects()
      state.projects = response
      return response
    } catch (error: any) {
      state.error = error.message || 'Erreur lors de la récupération des projets'
      throw error
    }
  },

  async getUsers() {
    state.error = null
    try {
      const response = await userService.getUsers()
      state.users = response
      return response
    } catch (error: any) {
      state.error = error.message || 'Erreur lors de la récupération des utilisateurs'
      throw error
    }
  },

  getProjectById(id: number): ProjectResponse | undefined {
    return state.projects.find(p => p.id === id)
  },

  clear() {
    state.projects = []
    state.users = []
    state.error = null
  },

  getError(): string | null {
    return state.error
  }
}

export default projectStore
