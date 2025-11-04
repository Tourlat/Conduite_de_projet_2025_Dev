
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