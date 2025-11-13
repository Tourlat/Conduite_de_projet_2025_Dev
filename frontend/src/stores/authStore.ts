import { reactive, readonly } from 'vue'
import { getAuthToken, getUserData } from '../utils/localStorage'
import authService from '../services/authService'

interface User {
  id: number
  email: string | null
  name: string | null
}

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: User | null
  error: string | null
}

const token = getAuthToken()
const userData = getUserData()

const state = reactive<AuthState>({
  isAuthenticated: token !== null,
  token: token,
  user: userData ? { id: userData.userId, email: userData.userEmail, name: userData.userName } : null,
  error: null
})

export const authStore = {

  state: readonly(state),

  init() {
    authService.initializeToken()
  },

  async login(email: string, password: string) {
    state.error = null
    try {
      const response = await authService.login({ email, password })
      state.token = response.token
      state.user = {
        id: response.id,
        email: response.email,
        name: response.name
      }
      state.isAuthenticated = true
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
        id: response.id,
        email: response.email,
        name: response.name
      }
      state.isAuthenticated = true
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
    authService.clearAuthData()
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
}

export default authStore