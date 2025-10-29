import { reactive, readonly } from 'vue'
import authService from '../services/authService'

interface User {
  email: string
  name: string
}

interface ProjectData {
  name: string
  description: string
  collaborateurs?: string[]
}

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: User | null
  error: string | null
}

const state = reactive<AuthState>({
  isAuthenticated: false,
  token: null,
  user: null,
  error: null
})

export const authStore = {

  state: readonly(state),

  init() {
    state.token = null
    state.isAuthenticated = false
    authService.removeToken()
  },

  async login(email: string, password: string) {
    state.error = null
    try {
      const response = await authService.login({ email, password })
      state.token = response.token
      state.user = {
        email: response.email,
        name: response.name
      }
      state.isAuthenticated = true
      authService.setToken(response.token)
      return response
    } catch (error: any) {
      state.error = error.message || 'Erreur de connexion'
      throw error
    }
  },

  async register(email: string, password: string, name: string) {
    state.error = null
    try {
      const response = await authService.register({ email, password, name })
      state.token = response.token
      state.user = {
        email: response.email,
        name: response.name
      }
      state.isAuthenticated = true
      authService.setToken(response.token)
      return response
    } catch (error: any) {
      state.error = error.message || "Erreur d'inscription"
      throw error
    }
  },

  logout() {
    state.token = null
    state.user = null
    state.isAuthenticated = false
    authService.removeToken()
  },

  setUser(user: User) {
    state.user = user
  },

  isLoggedIn(): boolean {
    return state.isAuthenticated && state.token !== null
  },

  getUser(): User | null {
    return state.user
  },

  getToken(): string | null {
    return state.token
  },

  async createProject(projectData: ProjectData) {
    state.error = null
    try {
      const response = await authService.createProject(projectData)
      return response
    } catch (error: any) {
      state.error = error.message || 'Erreur lors de la création du projet'
      throw error
    }
  },

  async getUsers() {
    state.error = null
    try {
      const response = await authService.getUsers()
      return response
    } catch (error: any) {
      state.error = error.message || 'Erreur lors de la récupération des utilisateurs'
      throw error
    }
  }
}


export default authStore