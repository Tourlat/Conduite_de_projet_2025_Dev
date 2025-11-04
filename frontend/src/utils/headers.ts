import { getAuthToken } from './localStorage'

/**
 * Get standard HTTP headers with Bearer token authentication
 * @returns {object} Headers object with Authorization and Content-Type
 */
export const getHeaders = () => {
    const token = getAuthToken()
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
}