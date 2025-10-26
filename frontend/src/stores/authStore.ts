import { reactive, readonly } from 'vue'

interface User {
  id?: number
  email?: string
  nom?: string
}

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: User | null
}

const state = reactive<AuthState>({
  isAuthenticated: false,
  token: null,
  user: null
})

export const authStore = {
  state: readonly(state),

  init() {
    const token = localStorage.getItem('token')
    if (token) {
      state.token = token
      state.isAuthenticated = true
      // TODO: Récupérer les infos utilisateur depuis l'API avec le token
    }
  },

  login(token: string, user?: User) {
    state.token = token
    state.user = user || null
    state.isAuthenticated = true
    localStorage.setItem('token', token)
  },

  logout() {
    state.token = null
    state.user = null
    state.isAuthenticated = false
    localStorage.removeItem('token')
  },

  setUser(user: User) {
    state.user = user
  },

  isLoggedIn(): boolean {
    return state.isAuthenticated && state.token !== null
  }
}
