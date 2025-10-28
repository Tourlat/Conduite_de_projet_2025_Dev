import axios from 'axios'

const API_URL = 'http://localhost:8080/auth'

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

interface AuthResponse {
  token: string
  email: string
  firstName: string
  lastName: string
}

const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/login`, credentials)
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/register`, data)
    return response.data
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  setToken(token: string): void {
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  },

  removeToken(): void {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }
}

export default authService