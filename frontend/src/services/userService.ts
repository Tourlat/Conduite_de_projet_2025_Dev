import axios from 'axios'
import type { ErrorResponse } from '../utils'
import { getHeaders } from '../utils'

const API_URL = 'http://localhost:8080/api/users'

/**
 * Data to update user information.
 */
export interface ChangeUserInfoRequest {
    email: string
    name: string
}

/**
 * Data to change user password.
 */
export interface ChangeUserPasswordRequest {
    email: string
    currentPassword: string
    newPassword: string
}

/**
 * User Data Transfer Object (DTO).
 */
export interface UserDto {
    id: number
    email: string
    name: string
}

/**
 * Simplified user interface.
 */
export interface User {
    email: string
    name?: string
}

/**
 * Service managing user-related operations.
 */
const userService = {

    /**
     * Get user by id
     * @param id number
     * @returns UserDto
     */
    async getUser(id: number): Promise<UserDto> {
        try {
            const response = await axios.get<UserDto>(`${API_URL}/${id}`, {
                headers: getHeaders()
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error retrieving data')
        }
    },

    /**
     * Retrieves the list of all users.
     * @returns List of users
     */
     async getUsers(): Promise<User[]> {
        try {
            const response = await axios.get<User[]>(`http://localhost:8080/api/users`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Error retrieving users')
        }
    },

    /**
     * Update user information
     * @param data ChangeUserInfoRequest
     * @returns UserDto
     */
    async updateUser(data: ChangeUserInfoRequest): Promise<UserDto> {
        try {
            const response = await axios.put<UserDto>(`${API_URL}/`, data, {
                headers: getHeaders()
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error during update')
        }
    },

    /**
     * Change user password
     * @param data ChangeUserPasswordRequest
     */
    async changePassword(data: ChangeUserPasswordRequest): Promise<void> {
        try {
            await axios.put(`${API_URL}/password`, data, {
                headers: getHeaders()
            })
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error changing password')
        }
    }


}

export default userService