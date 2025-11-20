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

// Initialize state from LocalStorage to persist session
const token = getAuthToken()
const userData = getUserData()

// Global reactive state (private, not exported directly to avoid uncontrolled mutations)
const state = reactive<AuthState>({
  isAuthenticated: token !== null,
  token: token,
  user: userData ? { id: userData.userId, email: userData.userEmail, name: userData.userName } : null,
  error: null
})

/**
 * Authentication Store (Reactive Store Pattern).
 * Exposes read-only state and methods to modify it.
 */
export const authStore = {

  // Expose read-only state for components
  state: readonly(state),

  /**
   * Initializes Axios token on application startup.
   */
  init() {
    authService.initializeToken()
  },

  async login(email: string, password: string) {
    state.error = null
    try {
      const response = await authService.login({ email, password })
      // Update reactive state
      state.token = response.token
      state.user = {
        id: response.id,
        email: response.email,
        name: response.name
      }
      state.isAuthenticated = true
      return response
    } catch (error: any) {
      state.error = error.message || 'Connection error'
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
      state.error = error.message || "Registration error"
      throw error
    }
  },

  /**
   * Logs out the user.
   * Removes token and resets state.
   */
  logout() {
    state.token = null
    state.user = null
    state.isAuthenticated = false
    authService.clearAuthData()
  },

  /**
   * Updates the user in the state.
   * @param user - The new user data
   */
  setUser(user: User) {
    state.user = user
  },

  /**
   * Vérifie si l'utilisateur est connecté.
   * @returns true si connecté, false sinon
   */
  isLoggedIn(): boolean {
    return state.isAuthenticated && state.token !== null
  },

  /**
   * Récupère l'utilisateur actuel.
   * @returns L'utilisateur ou null
   */
  getUser(): User | null {
    return state.user
  },

  /**
   * Récupère le token actuel.
   * @returns Le token ou null
   */
  getToken(): string | null {
    return state.token
  },
}

export default authStore