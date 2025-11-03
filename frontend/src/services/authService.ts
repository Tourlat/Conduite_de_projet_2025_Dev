import axios from 'axios'

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

interface User {
    email: string
    nom?: string
}

interface ErrorResponse {
    status: number
    message: string
    error: string
    timestamp: string
    path: string
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

function addDatasInLocalStorage(token: string, email: string, name: string, id: number): void {
    localStorage.setItem('authToken', token)
    localStorage.setItem('userEmail', email)
    localStorage.setItem('userName', name)
    localStorage.setItem('userId', id.toString())
}

const authService = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/login`, credentials)
            addDatasInLocalStorage(response.data.token, response.data.email, response.data.name, response.data.id)
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
            addDatasInLocalStorage(response.data.token, response.data.email, response.data.name, response.data.id)
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
        return null
    },

    setToken(token: string): void {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },

    removeToken(): void {
        delete axios.defaults.headers.common['Authorization']
        localStorage.removeItem('authToken')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userName')
    },

    async createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
        try {
            const userId = localStorage.getItem('userId')
            const userEmail = localStorage.getItem('userEmail')
            
            if (!userId || !userEmail) {
                throw new Error('Utilisateur non connecté')
            }

            const requestData = {
                name: data.name,
                description: data.description || null,
                user: {
                    id: parseInt(userId),
                    email: userEmail
                }
            }

            const response = await axios.post<ProjectResponse>(`http://localhost:8080/api/projects`, requestData)
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur lors de la création du projet'
            )
            throw new Error(message)
        }
    },

    async getUsers(): Promise<User[]> {
        try {
            const response = await axios.get<User[]>(`http://localhost:8080/api/users`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Erreur lors de la récupération des utilisateurs')
        }
    }
}

export default authService