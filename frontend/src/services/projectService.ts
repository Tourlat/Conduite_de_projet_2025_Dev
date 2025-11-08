const API_URL = 'http://localhost:8080/api/projects'
import type { ErrorResponse } from '../utils'
import { getUserId, getUserEmail } from '../utils'

import axios from 'axios'



interface CreateProjectRequest {
    name: string
    description?: string
    collaborateurs?: string[]
}

interface ProjectResponse {
    id: string
    name: string
    description?: string
    collaborateurs?: string[]
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

const projectService = {
    async createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
        try {
            const userId = getUserId().toString()
            const userEmail = getUserEmail()

            if (!userId || !userEmail) {
                throw new Error('Utilisateur non connecté')
            }

            const requestData = {
                name: data.name,
                description: data.description || null,
                collaborateurs: data.collaborateurs || [],
                user: {
                    id: parseInt(userId),
                    email: userEmail
                }
            }

            const response = await axios.post<ProjectResponse>(`${API_URL}`, requestData)
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

   

    async getProjects(): Promise<ProjectResponse[]> {
        try {
            const response = await axios.get<ProjectResponse[]>(`${API_URL}`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Erreur lors de la récupération des projets')
        }
    },

    async updateProject(projectId: string, data: { name: string; description?: string }): Promise<ProjectResponse> {
        try {
            const response = await axios.put<ProjectResponse>(`${API_URL}/${projectId}`, data)
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur lors de la mise à jour du projet'
            )
            throw new Error(message)
        }
    },

    async getProjectCollaborators(projectId: string): Promise<any[]> {
        try {
            const response = await axios.get(`${API_URL}/${projectId}/collaborators`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Erreur lors de la récupération des collaborateurs')
        }
    },

    async addProjectCollaborators(projectId: string, collaboratorEmails: string[]): Promise<any[]> {
        try {
            const response = await axios.post(`${API_URL}/${projectId}/collaborators`, {
                collaborators: collaboratorEmails
            })
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur lors de l\'ajout des collaborateurs'
            )
            throw new Error(message)
        }
    },

    async removeProjectCollaborator(projectId: string, collaboratorId: number): Promise<any[]> {
        try {
            const response = await axios.delete(`${API_URL}/${projectId}/collaborators/${collaboratorId}`)
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur lors de la suppression du collaborateur'
            )
            throw new Error(message)
        }
    }
}

export default projectService