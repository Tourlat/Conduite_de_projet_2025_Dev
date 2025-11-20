import axios from 'axios'
import { setUserData, getAuthToken, clearUserData } from '../utils/localStorage'
import type { ErrorResponse } from '../utils'

const API_URL = '/api/auth'

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    name: string
}

export interface AuthResponse {
    id: number
    token: string
    email: string
    name: string
}

/**
 * Maps HTTP error codes and business error codes to readable user messages.
 * @param status HTTP Code (e.g., 401, 404)
 * @param errorCode Specific error code returned by the backend (e.g., 'EMAIL_ALREADY_EXISTS')
 * @param defaultMessage Default message if no match is found
 */
export const getErrorMessage = (status: number, errorCode: string, defaultMessage: string): string => {
    const errorMap: { [key: number]: { [key: string]: string } } = {
        409: {
            EMAIL_ALREADY_EXISTS: 'This email is already in use'
        },
        401: {
            INVALID_CREDENTIALS: 'Incorrect email or password',
            BAD_CREDENTIALS: 'Incorrect email or password'
        },
        404: {
            USER_NOT_FOUND: 'User not found'
        },
        400: {
            VALIDATION_ERROR: 'Invalid data'
        }
    }

    return errorMap[status]?.[errorCode] || defaultMessage
}

/**
 * Stores logged-in user information in LocalStorage.
 * This function is called after successful login or registration.
 */
export function addDatasInLocalStorage(data: AuthResponse): void {
    setUserData(data)
}

const authService = {
    /**
     * Authenticates the user with the API.
     * On success, stores the token and user info.
     */
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
                errorData?.message || 'Connection error'
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
                errorData?.message || "Registration error"
            )
            throw new Error(message)
        }
    },

    /**
     * Retrieves the stored authentication token.
     * @returns The JWT token or null if not found.
     */
    getToken(): string | null {
        return getAuthToken()
    },

    /**
     * Sets the authentication token for Axios requests.
     * @param token - The JWT token.
     */
    setToken(token: string): void {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },

    /**
     * Removes the authentication token from Axios requests.
     */
    removeToken(): void {
        delete axios.defaults.headers.common['Authorization']
    },

    /**
     * Clears all authentication data (logout).
     */
    clearAuthData(): void {
        clearUserData()
        authService.removeToken()
    },

    /**
     * Initializes the token on application startup if it exists.
     */
    initializeToken(): void {
        const token = getAuthToken()
        if (token) {
            authService.setToken(token)
        }
    }
}

export default authService