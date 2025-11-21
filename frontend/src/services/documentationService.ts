import axios from 'axios'

const API_URL = '/api/projects'

export interface DocumentationDto {
    id?: number
    title: string
    content: string
    createdAt?: string
    updatedAt?: string
}

const documentationService = {
    /**
     * Retrieves all documentation for a project.
     * @param projectId - The ID of the project.
     * @returns A list of documentation.
     */
    async getDocumentationByProject(projectId: string): Promise<DocumentationDto[]> {
        const response = await axios.get<DocumentationDto[]>(`${API_URL}/${projectId}/docs`)
        return response.data
    },

    /**
     * Creates a new documentation.
     * @param projectId - The ID of the project.
     * @param doc - The documentation data.
     * @returns The created documentation.
     */
    async createDocumentation(projectId: string, doc: DocumentationDto): Promise<DocumentationDto> {
        const response = await axios.post<DocumentationDto>(`${API_URL}/${projectId}/docs`, doc)
        return response.data
    },

    /**
     * Updates an existing documentation.
     * @param projectId - The ID of the project.
     * @param docId - The ID of the documentation.
     * @param doc - The updated documentation data.
     * @returns The updated documentation.
     */
    async updateDocumentation(projectId: string, docId: number, doc: DocumentationDto): Promise<DocumentationDto> {
        const response = await axios.put<DocumentationDto>(`${API_URL}/${projectId}/docs/${docId}`, doc)
        return response.data
    },

    /**
     * Deletes a documentation.
     * @param projectId - The ID of the project.
     * @param docId - The ID of the documentation.
     */
    async deleteDocumentation(projectId: string, docId: number): Promise<void> {
        await axios.delete(`${API_URL}/${projectId}/docs/${docId}`)
    }
}

export default documentationService
