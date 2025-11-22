import { describe, it, expect, vi, beforeEach } from 'vitest'
import { projectStore } from '../projectStore'
import projectService from '../../services/projectService'
import userService from '../../services/userService'

vi.mock('../../services/projectService', () => ({
  default: {
    createProject: vi.fn(),
    getProjects: vi.fn(),
    updateProject: vi.fn(),
    getProjectCollaborators: vi.fn(),
    addProjectCollaborators: vi.fn(),
    removeProjectCollaborator: vi.fn()
  }
}))

vi.mock('../../services/userService', () => ({
  default: {
    getUsers: vi.fn()
  }
}))

describe('projectStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    projectStore.clear()
  })

  describe('createProject', () => {
    it('devrait créer un projet avec succès', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: 'Test description'
      }

      vi.mocked(projectService.createProject).mockResolvedValue(mockProject)

      const result = await projectStore.createProject({
        name: 'Test Project',
        description: 'Test description'
      })

      expect(result).toEqual(mockProject)
      expect(projectStore.state.projects).toContainEqual(mockProject)
    })

    it('devrait gérer les erreurs de création', async () => {
      const mockError = new Error('Creation failed')
      vi.mocked(projectService.createProject).mockRejectedValue(mockError)

      await expect(
        projectStore.createProject({ name: 'Test' })
      ).rejects.toThrow('Creation failed')

      expect(projectStore.state.error).toBe('Creation failed')
    })
  })

  describe('getProjects', () => {
    it('devrait récupérer tous les projets', async () => {
      const mockProjects = [
        { id: 'p1', name: 'Project 1' },
        { id: 'p2', name: 'Project 2' }
      ]

      vi.mocked(projectService.getProjects).mockResolvedValue(mockProjects)

      const result = await projectStore.getProjects()

      expect(result).toEqual(mockProjects)
      expect(projectStore.state.projects).toEqual(mockProjects)
    })

    it('devrait gérer les erreurs de récupération', async () => {
      const mockError = new Error('Fetch failed')
      vi.mocked(projectService.getProjects).mockRejectedValue(mockError)

      await expect(projectStore.getProjects()).rejects.toThrow('Fetch failed')
      expect(projectStore.state.error).toBe('Fetch failed')
    })
  })

  describe('getUsers', () => {
    it('devrait récupérer tous les utilisateurs', async () => {
      const mockUsers = [
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'user2@example.com', name: 'User 2' }
      ]

      vi.mocked(userService.getUsers).mockResolvedValue(mockUsers)

      const result = await projectStore.getUsers()

      expect(result).toEqual(mockUsers)
      expect(projectStore.state.users).toEqual(mockUsers)
    })

    it('devrait gérer les erreurs', async () => {
      const mockError = new Error('Users fetch failed')
      vi.mocked(userService.getUsers).mockRejectedValue(mockError)

      await expect(projectStore.getUsers()).rejects.toThrow('Users fetch failed')
    })
  })

  describe('getProjectById', () => {
    it('devrait récupérer un projet par ID', async () => {
      const mockProjects = [
        { id: 'p1', name: 'Project 1' },
        { id: 'p2', name: 'Project 2' }
      ]

      vi.mocked(projectService.getProjects).mockResolvedValue(mockProjects)
      await projectStore.getProjects()

      const project = projectStore.getProjectById('p1')
      expect(project).toEqual({ id: 'p1', name: 'Project 1' })
    })

    it('devrait retourner undefined si non trouvé', () => {
      const project = projectStore.getProjectById('non-existent')
      expect(project).toBeUndefined()
    })
  })

  describe('updateProject', () => {
    it('devrait mettre à jour un projet', async () => {
      // Setup initial state
      const mockProjects = [{ id: 'p1', name: 'Old Name' }]
      vi.mocked(projectService.getProjects).mockResolvedValue(mockProjects)
      await projectStore.getProjects()

      const updatedProject = { id: 'p1', name: 'New Name', description: 'Updated' }
      vi.mocked(projectService.updateProject).mockResolvedValue(updatedProject)

      const result = await projectStore.updateProject('p1', {
        name: 'New Name',
        description: 'Updated'
      })

      expect(result).toEqual(updatedProject)
      expect(projectStore.state.projects[0]).toEqual(updatedProject)
    })

    it('devrait gérer les erreurs de mise à jour', async () => {
      const mockError = new Error('Update failed')
      vi.mocked(projectService.updateProject).mockRejectedValue(mockError)

      await expect(
        projectStore.updateProject('p1', { name: 'Test' })
      ).rejects.toThrow('Update failed')
    })
  })

  describe('getProjectCollaborators', () => {
    it('devrait récupérer les collaborateurs d\'un projet', async () => {
      const mockCollaborators = [
        { id: 1, name: 'User 1', email: 'user1@example.com' },
        { id: 2, name: 'User 2', email: 'user2@example.com' }
      ]

      vi.mocked(projectService.getProjectCollaborators).mockResolvedValue(mockCollaborators)

      const result = await projectStore.getProjectCollaborators('p1')
      expect(result).toEqual(mockCollaborators)
    })
  })

  describe('addProjectCollaborators', () => {
    it('devrait ajouter des collaborateurs', async () => {
      const mockResponse: any = []
      vi.mocked(projectService.addProjectCollaborators).mockResolvedValue(mockResponse)

      const result = await projectStore.addProjectCollaborators('p1', ['user@example.com'])
      expect(result).toEqual(mockResponse)
    })
  })

  describe('removeProjectCollaborator', () => {
    it('devrait supprimer un collaborateur', async () => {
      const mockResponse: any = []
      vi.mocked(projectService.removeProjectCollaborator).mockResolvedValue(mockResponse)

      const result = await projectStore.removeProjectCollaborator('p1', 1)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('clear', () => {
    it('devrait réinitialiser le store', async () => {
      // Add some data
      const mockProjects = [{ id: 'p1', name: 'Project 1' }]
      vi.mocked(projectService.getProjects).mockResolvedValue(mockProjects)
      await projectStore.getProjects()

      projectStore.clear()

      expect(projectStore.state.projects).toEqual([])
      expect(projectStore.state.users).toEqual([])
      expect(projectStore.state.error).toBeNull()
    })
  })

  describe('getError', () => {
    it('devrait retourner l\'erreur actuelle', async () => {
      const mockError = new Error('Test error')
      vi.mocked(projectService.getProjects).mockRejectedValue(mockError)

      try {
        await projectStore.getProjects()
      } catch (e) {
        // Expected error
      }

      expect(projectStore.getError()).toBe('Test error')
    })
  })
})
