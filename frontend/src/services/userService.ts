import axios from 'axios'
import type { ErrorResponse } from '../utils'
import { getHeaders } from '../utils'

const API_URL = '/api/users'

interface ChangeUserInfoRequest {
    email: string
    name: string
}

interface ChangeUserPasswordRequest {
    email: string
    currentPassword: string
    newPassword: string
}
interface UserDto {
    id: number
    email: string
    name: string
}

interface User {
    email: string
    name?: string
}

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
            throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des données')
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
            throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour')
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
            throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe')
        }
    }


}

export default userService