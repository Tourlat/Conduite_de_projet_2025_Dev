/**
 * LocalStorage utility functions
 * Centralized getters and setters for user data stored in localStorage
 */

/**
 * Get the authentication token from localStorage
 * @returns {string | null} The auth token or null if not found
 */
export const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken')
}

/**
 * Set the authentication token in localStorage
 * @param {string} token - The authentication token
 */
export const setAuthToken = (token: string): void => {
    localStorage.setItem('authToken', token)
}

/**
 * Get the user ID from localStorage
 * @returns {number} The parsed user ID, or 0 if not found
 */
export const getUserId = (): number => {
    const id = localStorage.getItem('userId')
    return id ? parseInt(id) : 0
}

/**
 * Set the user ID in localStorage
 * @param {number} id - The user ID
 */
export const setUserId = (id: number): void => {
    localStorage.setItem('userId', id.toString())
}

/**
 * Get the user email from localStorage
 * @returns {string | null} The user email or null if not found
 */
export const getUserEmail = (): string | null => {
    return localStorage.getItem('userEmail')
}

/**
 * Set the user email in localStorage
 * @param {string} email - The user email
 */
export const setUserEmail = (email: string): void => {
    localStorage.setItem('userEmail', email)
}

/**
 * Get the user name from localStorage
 * @returns {string | null} The user name or null if not found
 */
export const getUserName = (): string | null => {
    return localStorage.getItem('userName')
}

/**
 * Set the user name in localStorage
 * @param {string} name - The user name
 */
export const setUserName = (name: string): void => {
    localStorage.setItem('userName', name)
}

/**
 * Get all user data from localStorage at once
 * @returns {object} Object containing userId, userEmail, userName, and authToken
 */
export const getUserData = () => {
    return {
        userId: getUserId(),
        userEmail: getUserEmail(),
        userName: getUserName(),
        authToken: getAuthToken()
    }
}

/**
 * Set all user data in localStorage at once
 * @param {object} data - Object containing token, email, name, and id
 */
export const setUserData = (data: { token: string; email: string; name: string; id: number }): void => {
    setAuthToken(data.token)
    setUserEmail(data.email)
    setUserName(data.name)
    setUserId(data.id)
}

/**
 * Clear all user data from localStorage (logout)
 */
export const clearUserData = (): void => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authToken exists
 */
export const isAuthenticated = (): boolean => {
    return !!getAuthToken()
}
