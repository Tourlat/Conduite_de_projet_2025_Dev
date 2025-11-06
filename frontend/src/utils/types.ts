
/**
 * Standard error response from the backend API
 */
export interface ErrorResponse {
    status: number
    message: string
    error: string
    timestamp: string
    path: string
}

/**
 * User creator information
 */
export interface Creator {
    id: number
    email: string
    name: string
}

/**
 * Project interface with UUID
 */
export interface Project {
    id: string
    name: string
    description?: string
    createdAt?: string
    creator?: Creator
}

/**
 * User interface
 */
export interface User {
    id: number
    email: string
    name: string
}