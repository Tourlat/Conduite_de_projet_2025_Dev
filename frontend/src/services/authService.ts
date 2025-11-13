import axios from 'axios'
import { setUserData, getAuthToken, clearUserData } from '../utils/localStorage'
import type { ErrorResponse } from '../utils'

const API_URL = 'http://localhost:8080/auth'

interface LoginRequest {
    email: string
    password: string
}

interface RegisterRequest {
    email: string
    password: string
    name: string
}

interface AuthResponse {
    id: number
    token: string
    email: string
    name: string
}

const getErrorMessage = (status: number, errorCode: string, defaultMessage: string): string => {
    const errorMap: { [key: number]: { [key: string]: string } } = {
        409: {
            EMAIL_ALREADY_EXISTS: 'Cet email est déjà utilisé'
        },
        401: {
            INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
            BAD_CREDENTIALS: 'Email ou mot de passe incorrect'
        },
        404: {
            USER_NOT_FOUND: 'Utilisateur non trouvé'
        },
        400: {
            VALIDATION_ERROR: 'Données invalides'
        }
    }

    return errorMap[status]?.[errorCode] || defaultMessage
}

function addDatasInLocalStorage(data: AuthResponse): void {
    setUserData(data)
}

const authService = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/login`, credentials)
            addDatasInLocalStorage(response.data)
            authService.setToken(response.data.token)
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur de connexion'
            )
            throw new Error(message)
        }
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/register`, data)
            addDatasInLocalStorage(response.data)
            authService.setToken(response.data.token)
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data

            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || "Erreur lors de l'inscription"
            )
            throw new Error(message)
        }
    },

    getToken(): string | null {
        return getAuthToken()
    },

    setToken(token: string): void {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },

    removeToken(): void {
        delete axios.defaults.headers.common['Authorization']
    },

    clearAuthData(): void {
        clearUserData()
        authService.removeToken()
    },

    initializeToken(): void {
        const token = getAuthToken()
        if (token) {
            authService.setToken(token)
        }
    }
}

export default authService