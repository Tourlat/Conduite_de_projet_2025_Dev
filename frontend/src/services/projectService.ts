import type { ErrorResponse } from '../utils'
import { getUserId, getUserEmail } from '../utils'
import axios from 'axios'

const API_URL = '/api/projects'

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

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'CLOSED'

export interface CreateIssueRequest {
    title: string
    description?: string
    priority: IssuePriority
    storyPoints: number
    status?: IssueStatus
    assigneeId?: number
}

export interface UpdateIssueRequest {
    title?: string
    description?: string
    priority?: IssuePriority
    storyPoints?: number
    status?: IssueStatus
    assigneeId?: number
}

export interface IssueResponse {
    id: number
    title: string
    description?: string
    priority: IssuePriority
    storyPoints: number
    status: IssueStatus
    projectId: string
    creatorId: number
    assigneeId?: number
    createdAt: string
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface CreateTaskRequest {
    title: string
    description?: string
    definitionOfDone?: string
    status?: TaskStatus
    assigneeId?: number
}

export interface TaskResponse {
    id: number
    title: string
    description?: string
    definitionOfDone?: string
    status: TaskStatus
    issueId: number
    assigneeId?: number
    creatorId?: number
    projectId?: string
    createdAt: string
}

export interface CreateSprintRequest {
    name: string
    startDate: string
    endDate: string
    issueIds?: number[]
}

export interface UpdateSprintRequest {
    name?: string
    startDate?: string
    endDate?: string
    issueIds?: number[]
}

export interface SprintResponse {
    id: number
    name: string
    startDate: string
    endDate: string
    projectId: string
    issueIds: number[]
    createdAt: string
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
    },
    
    async createIssue(projectId: string, data: CreateIssueRequest): Promise<IssueResponse> {
        try {
            const response = await axios.post<IssueResponse>(`${API_URL}/${projectId}/issues`, data)
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur lors de la création du ticket'
            )
            throw new Error(message)
        }
    },

    async getIssuesByProject(projectId: string): Promise<IssueResponse[]> {
        try {
            const response = await axios.get<IssueResponse[]>(`${API_URL}/${projectId}/issues`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Erreur lors de la récupération des issues')
        }
    },

    async updateIssue(projectId: string, issueId: number, data: UpdateIssueRequest): Promise<IssueResponse> {
        try {
            const response = await axios.put<IssueResponse>(`${API_URL}/${projectId}/issues/${issueId}`, data)
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur lors de la mise à jour de l\'issue'
            )
            throw new Error(message)
        }
    },

    async deleteIssue(projectId: string, issueId: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/${projectId}/issues/${issueId}`)
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur lors de la suppression de l\'issue'
            )
            throw new Error(message)
        }
    },

    // Task methods
    async createTask(projectId: string, issueId: number, data: CreateTaskRequest): Promise<TaskResponse> {
        try {
            const response = await axios.post<TaskResponse>(`${API_URL}/${projectId}/issues/${issueId}/tasks`, data)
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur lors de la création de la tâche'
            )
            throw new Error(message)
        }
    },

    async getTasksByIssue(projectId: string, issueId: number): Promise<TaskResponse[]> {
        try {
            const response = await axios.get<TaskResponse[]>(`${API_URL}/${projectId}/issues/${issueId}/tasks`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Erreur lors de la récupération des tâches')
        }
    },

    async updateTask(projectId: string, issueId: number, taskId: number, data: Partial<CreateTaskRequest>): Promise<TaskResponse> {
        try {
            const response = await axios.put<TaskResponse>(`${API_URL}/${projectId}/issues/${issueId}/tasks/${taskId}`, data)
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur lors de la mise à jour de la tâche'
            )
            throw new Error(message)
        }
    },

    async deleteTask(projectId: string, issueId: number, taskId: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/${projectId}/issues/${issueId}/tasks/${taskId}`)
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur lors de la suppression de la tâche'
            )
            throw new Error(message)
        }
    },

    // Sprint methods
    async createSprint(projectId: string, data: CreateSprintRequest): Promise<SprintResponse> {
        try {
            const response = await axios.post<SprintResponse>(`${API_URL}/${projectId}/sprints`, data)
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur lors de la création du sprint'
            )
            throw new Error(message)
        }
    },

    async getSprintsByProject(projectId: string): Promise<SprintResponse[]> {
        try {
            const response = await axios.get<SprintResponse[]>(`${API_URL}/${projectId}/sprints`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Erreur lors de la récupération des sprints')
        }
    },

    async getSprint(projectId: string, sprintId: number): Promise<SprintResponse> {
        try {
            const response = await axios.get<SprintResponse>(`${API_URL}/${projectId}/sprints/${sprintId}`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Erreur lors de la récupération du sprint')
        }
    },

    async updateSprint(projectId: string, sprintId: number, data: UpdateSprintRequest): Promise<SprintResponse> {
        try {
            const response = await axios.put<SprintResponse>(`${API_URL}/${projectId}/sprints/${sprintId}`, data)
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur lors de la mise à jour du sprint'
            )
            throw new Error(message)
        }
    },

    async deleteSprint(projectId: string, sprintId: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/${projectId}/sprints/${sprintId}`)
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Erreur lors de la suppression du sprint'
            )
            throw new Error(message)
        }
    },

    async getIssuesBySprint(projectId: string, sprintId: number): Promise<IssueResponse[]> {
        try {
            const response = await axios.get<IssueResponse[]>(`${API_URL}/${projectId}/sprints/${sprintId}/issues`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Erreur lors de la récupération des issues du sprint')
        }
    }
}

export default projectService