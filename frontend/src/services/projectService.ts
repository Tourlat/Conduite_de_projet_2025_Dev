import type { ErrorResponse } from '../utils'
import { getUserId, getUserEmail } from '../utils'
import axios from 'axios'

const API_URL = '/api/projects'

export interface CreateProjectRequest {
    name: string
    description?: string
    collaborateurs?: string[]
}

export interface ProjectResponse {
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
 * Service for managing projects, issues, sprints, and tasks.
 * Handles API communication for all project-related operations.
 */
const projectService = {
    /**
     * Creates a new project.
     * @param projectData Data for the new project
     * @returns The created project
     */
    async createProject(projectData: CreateProjectRequest): Promise<ProjectResponse> {
        try {
            const userId = getUserId().toString()
            const userEmail = getUserEmail()

            if (!userId || !userEmail) {
                throw new Error('User not logged in')
            }

            const requestData = {
                name: projectData.name,
                description: projectData.description || null,
                collaborateurs: projectData.collaborateurs || [],
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
                errorData?.message || 'Error creating project'
            )
            throw new Error(message)
        }
    },

   

    /**
     * Retrieves the list of all projects.
     * @returns List of projects
     */
    async getProjects(): Promise<ProjectResponse[]> {
        try {
            const response = await axios.get<ProjectResponse[]>(`${API_URL}`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Error retrieving projects')
        }
    },

    /**
     * Updates an existing project.
     * @param projectId - Project ID
     * @param data - Data to update
     * @returns The updated project
     */
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
                errorData?.message || 'Error updating project'
            )
            throw new Error(message)
        }
    },

    /**
     * Retrieves collaborators of a project.
     * @returns List of collaborators
     */
    async getProjectCollaborators(projectId: string): Promise<any[]> {
        try {
            const response = await axios.get(`${API_URL}/${projectId}/collaborators`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Error retrieving collaborators')
        }
    },

    /**
     * Adds collaborators to a project.
     * @param projectId - Project ID
     * @param collaboratorEmails - List of collaborator emails
     * @returns Updated list of collaborators
     */
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
                errorData?.message || 'Error adding collaborators'
            )
            throw new Error(message)
        }
    },

    /**
     * Removes a collaborator from a project.
     * @param projectId - Project ID
     * @param collaboratorId - Collaborator ID
     * @returns Updated list of collaborators
     */
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
                errorData?.message || 'Error removing collaborator'
            )
            throw new Error(message)
        }
    },
    
    /**
     * Creates a new issue.
     * @param projectId - Project ID
     * @param data - Issue data
     * @returns The created issue
     */
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
                errorData?.message || 'Error creating issue'
            )
            throw new Error(message)
        }
    },

    /**
     * Retrieves all issues of a project.
     * @param projectId - Project ID
     * @returns List of issues
     */
    async getIssuesByProject(projectId: string): Promise<IssueResponse[]> {
        try {
            const response = await axios.get<IssueResponse[]>(`${API_URL}/${projectId}/issues`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Error retrieving issues')
        }
    },

    /**
     * Updates an issue.
     * @param projectId - Project ID
     * @param issueId - Issue ID
     * @param data - Data to update
     * @returns The updated issue
     */
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
                errorData?.message || 'Error updating issue'
            )
            throw new Error(message)
        }
    },

    /**
     * Deletes an issue.
     * @param projectId - Project ID
     * @param issueId - Issue ID
     */
    async deleteIssue(projectId: string, issueId: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/${projectId}/issues/${issueId}`)
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Error deleting issue'
            )
            throw new Error(message)
        }
    },

    // Task methods
    /**
     * Creates a new task for an issue.
     * @param projectId - Project ID
     * @param issueId - Issue ID
     * @param data - Task data
     * @returns The created task
     */
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
                errorData?.message || 'Error creating task'
            )
            throw new Error(message)
        }
    },

    /**
     * Retrieves tasks of an issue.
     * @param projectId - Project ID
     * @param issueId - Issue ID
     * @returns List of tasks
     */
    async getTasksByIssue(projectId: string, issueId: number): Promise<TaskResponse[]> {
        try {
            const response = await axios.get<TaskResponse[]>(`${API_URL}/${projectId}/issues/${issueId}/tasks`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Error retrieving tasks')
        }
    },

    /**
     * Updates a task.
     * @param projectId - Project ID
     * @param issueId - Issue ID
     * @param taskId - Task ID
     * @param data - Data to update
     * @returns The updated task
     */
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
                errorData?.message || 'Error updating task'
            )
            throw new Error(message)
        }
    },

    /**
     * Deletes a task.
     * @param projectId - Project ID
     * @param issueId - Issue ID
     * @param taskId - Task ID
     */
    async deleteTask(projectId: string, issueId: number, taskId: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/${projectId}/issues/${issueId}/tasks/${taskId}`)
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Error deleting task'
            )
            throw new Error(message)
        }
    },

    // Sprint methods
    /**
     * Creates a new sprint.
     * @param projectId - Project ID
     * @param data - Sprint data
     * @returns The created sprint
     */
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
                errorData?.message || 'Error creating sprint'
            )
            throw new Error(message)
        }
    },

    /**
     * Retrieves all sprints of a project.
     * @param projectId - Project ID
     * @returns List of sprints
     */
    async getSprintsByProject(projectId: string): Promise<SprintResponse[]> {
        try {
            const response = await axios.get<SprintResponse[]>(`${API_URL}/${projectId}/sprints`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Error retrieving sprints')
        }
    },

    /**
     * Retrieves a specific sprint.
     * @param projectId - Project ID
     * @param sprintId - Sprint ID
     * @returns The sprint
     */
    async getSprint(projectId: string, sprintId: number): Promise<SprintResponse> {
        try {
            const response = await axios.get<SprintResponse>(`${API_URL}/${projectId}/sprints/${sprintId}`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Error retrieving sprint')
        }
    },

    /**
     * Updates a sprint.
     * @param projectId - Project ID
     * @param sprintId - Sprint ID
     * @param data - Data to update
     * @returns The updated sprint
     */
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
                errorData?.message || 'Error updating sprint'
            )
            throw new Error(message)
        }
    },

    /**
     * Deletes a sprint.
     * @param projectId - Project ID
     * @param sprintId - Sprint ID
     */
    async deleteSprint(projectId: string, sprintId: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/${projectId}/sprints/${sprintId}`)
        } catch (error: any) {
            const status = error.response?.status
            const errorData: ErrorResponse = error.response?.data
            const message = getErrorMessage(
                status,
                errorData?.error,
                errorData?.message || 'Error deleting sprint'
            )
            throw new Error(message)
        }
    },

    /**
     * Retrieves issues associated with a sprint.
     * @param projectId - Project ID
     * @param sprintId - Sprint ID
     * @returns List of sprint issues
     */
    async getIssuesBySprint(projectId: string, sprintId: number): Promise<IssueResponse[]> {
        try {
            const response = await axios.get<IssueResponse[]>(`${API_URL}/${projectId}/sprints/${sprintId}/issues`)
            return response.data
        } catch (error: any) {
            const errorData: ErrorResponse = error.response?.data
            throw new Error(errorData?.message || 'Error retrieving sprint issues')
        }
    }
}

export default projectService