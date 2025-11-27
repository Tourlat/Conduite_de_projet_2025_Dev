import { describe, it, expect, vi, beforeEach } from 'vitest'
import projectService, { getErrorMessage } from '../projectService'
import axios from 'axios'
import * as localStorage from '../../utils/localStorage'

vi.mock('axios')
vi.mock('../../utils/localStorage')

const mockedAxios = vi.mocked(axios)
const mockedGetUserId = vi.mocked(localStorage.getUserId)
const mockedGetUserEmail = vi.mocked(localStorage.getUserEmail)

describe('projectService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getErrorMessage', () => {
    it('should return specific error message for EMAIL_ALREADY_EXISTS', () => {
      const message = getErrorMessage(409, 'EMAIL_ALREADY_EXISTS', 'Default')
      expect(message).toBe('This email is already in use')
    })

    it('should return specific error message for INVALID_CREDENTIALS', () => {
      const message = getErrorMessage(401, 'INVALID_CREDENTIALS', 'Default')
      expect(message).toBe('Incorrect email or password')
    })

    it('should return default message when no specific match', () => {
      const message = getErrorMessage(500, 'UNKNOWN_ERROR', 'Default error')
      expect(message).toBe('Default error')
    })
  })

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        collaborateurs: ['user@test.com']
      }

      const mockResponse = {
        data: {
          id: 'project-123',
          name: 'Test Project',
          description: 'Test Description'
        }
      }

      mockedGetUserId.mockReturnValue(1)
      mockedGetUserEmail.mockReturnValue('owner@test.com')
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await projectService.createProject(projectData)

      expect(result).toEqual(mockResponse.data)
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/projects', {
        name: 'Test Project',
        description: 'Test Description',
        collaborateurs: ['user@test.com'],
        user: {
          id: 1,
          email: 'owner@test.com'
        }
      })
    })

    it('should throw error when user not logged in', async () => {
      mockedGetUserId.mockReturnValue(0)
      mockedGetUserEmail.mockReturnValue(null)

      try {
        await projectService.createProject({ name: 'Test' })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        // The catch block transforms the error, so we check that an error was thrown
        expect(error.message).toContain('Error')
      }
    })
  })

  describe('getProjects', () => {
    it('should retrieve all projects', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1' },
        { id: '2', name: 'Project 2' }
      ]

      mockedAxios.get.mockResolvedValue({ data: mockProjects })

      const result = await projectService.getProjects()

      expect(result).toEqual(mockProjects)
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/projects')
    })
  })

  describe('updateProject', () => {
    it('should update a project', async () => {
      const projectId = 'project-123'
      const updateData = { name: 'Updated Name', description: 'Updated Desc' }
      const mockResponse = { data: { id: projectId, ...updateData } }

      mockedAxios.put.mockResolvedValue(mockResponse)

      const result = await projectService.updateProject(projectId, updateData)

      expect(result).toEqual(mockResponse.data)
      expect(mockedAxios.put).toHaveBeenCalledWith(`/api/projects/${projectId}`, updateData)
    })
  })

  describe('getProjectCollaborators', () => {
    it('should retrieve project collaborators', async () => {
      const projectId = 'project-123'
      const mockCollaborators = [
        { id: 1, email: 'user1@test.com' },
        { id: 2, email: 'user2@test.com' }
      ]

      mockedAxios.get.mockResolvedValue({ data: mockCollaborators })

      const result = await projectService.getProjectCollaborators(projectId)

      expect(result).toEqual(mockCollaborators)
      expect(mockedAxios.get).toHaveBeenCalledWith(`/api/projects/${projectId}/collaborators`)
    })
  })

  describe('addProjectCollaborators', () => {
    it('should add collaborators to project', async () => {
      const projectId = 'project-123'
      const emails = ['new@test.com']
      const mockResponse = { data: [{ id: 3, email: 'new@test.com' }] }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await projectService.addProjectCollaborators(projectId, emails)

      expect(result).toEqual(mockResponse.data)
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `/api/projects/${projectId}/collaborators`,
        { collaborators: emails }
      )
    })
  })

  describe('removeProjectCollaborator', () => {
    it('should remove a collaborator from project', async () => {
      const projectId = 'project-123'
      const collaboratorId = 5
      const mockResponse = { data: [] }

      mockedAxios.delete.mockResolvedValue(mockResponse)

      const result = await projectService.removeProjectCollaborator(projectId, collaboratorId)

      expect(result).toEqual(mockResponse.data)
      expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/projects/${projectId}/collaborators/${collaboratorId}`)
    })
  })

  describe('Issues', () => {
    describe('createIssue', () => {
      it('should create an issue', async () => {
        const projectId = 'project-123'
        const issueData = {
          title: 'Test Issue',
          priority: 'HIGH' as const,
          storyPoints: 5
        }
        const mockResponse = { data: { id: 1, ...issueData } }

        mockedAxios.post.mockResolvedValue(mockResponse)

        const result = await projectService.createIssue(projectId, issueData)

        expect(result).toEqual(mockResponse.data)
        expect(mockedAxios.post).toHaveBeenCalledWith(`/api/projects/${projectId}/issues`, issueData)
      })
    })

    describe('getIssuesByProject', () => {
      it('should retrieve all issues for a project', async () => {
        const projectId = 'project-123'
        const mockIssues = [
          { id: 1, title: 'Issue 1', priority: 'HIGH', storyPoints: 5, status: 'TODO' },
          { id: 2, title: 'Issue 2', priority: 'MEDIUM', storyPoints: 3, status: 'IN_PROGRESS' }
        ]

        mockedAxios.get.mockResolvedValue({ data: mockIssues })

        const result = await projectService.getIssuesByProject(projectId)

        expect(result).toEqual(mockIssues)
        expect(mockedAxios.get).toHaveBeenCalledWith(`/api/projects/${projectId}/issues`)
      })
    })

    describe('updateIssue', () => {
      it('should update an issue', async () => {
        const projectId = 'project-123'
        const issueId = 1
        const updateData = { status: 'CLOSED' as const }
        const mockResponse = { data: { id: issueId, ...updateData } }

        mockedAxios.put.mockResolvedValue(mockResponse)

        const result = await projectService.updateIssue(projectId, issueId, updateData)

        expect(result).toEqual(mockResponse.data)
        expect(mockedAxios.put).toHaveBeenCalledWith(
          `/api/projects/${projectId}/issues/${issueId}`,
          updateData
        )
      })
    })

    describe('deleteIssue', () => {
      it('should delete an issue', async () => {
        const projectId = 'project-123'
        const issueId = 1

        mockedAxios.delete.mockResolvedValue({})

        await projectService.deleteIssue(projectId, issueId)

        expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/projects/${projectId}/issues/${issueId}`)
      })
    })
  })

  describe('Tasks', () => {
    describe('createTask', () => {
      it('should create a task for an issue', async () => {
        const projectId = 'project-123'
        const issueId = 1
        const taskData = {
          title: 'Test Task',
          description: 'Task description'
        }
        const mockResponse = { data: { id: 1, ...taskData } }

        mockedAxios.post.mockResolvedValue(mockResponse)

        const result = await projectService.createTask(projectId, issueId, taskData)

        expect(result).toEqual(mockResponse.data)
        expect(mockedAxios.post).toHaveBeenCalledWith(
          `/api/projects/${projectId}/issues/${issueId}/tasks`,
          taskData
        )
      })
    })

    describe('getTasksByIssue', () => {
      it('should retrieve tasks for an issue', async () => {
        const projectId = 'project-123'
        const issueId = 1
        const mockTasks = [
          { id: 1, title: 'Task 1', status: 'TODO' },
          { id: 2, title: 'Task 2', status: 'DONE' }
        ]

        mockedAxios.get.mockResolvedValue({ data: mockTasks })

        const result = await projectService.getTasksByIssue(projectId, issueId)

        expect(result).toEqual(mockTasks)
        expect(mockedAxios.get).toHaveBeenCalledWith(`/api/projects/${projectId}/issues/${issueId}/tasks`)
      })
    })

    describe('updateTask', () => {
      it('should update a task', async () => {
        const projectId = 'project-123'
        const issueId = 1
        const taskId = 1
        const updateData = { status: 'DONE' as const }
        const mockResponse = { data: { id: taskId, ...updateData } }

        mockedAxios.put.mockResolvedValue(mockResponse)

        const result = await projectService.updateTask(projectId, issueId, taskId, updateData)

        expect(result).toEqual(mockResponse.data)
        expect(mockedAxios.put).toHaveBeenCalledWith(
          `/api/projects/${projectId}/issues/${issueId}/tasks/${taskId}`,
          updateData
        )
      })
    })

    describe('deleteTask', () => {
      it('should delete a task', async () => {
        const projectId = 'project-123'
        const issueId = 1
        const taskId = 1

        mockedAxios.delete.mockResolvedValue({})

        await projectService.deleteTask(projectId, issueId, taskId)

        expect(mockedAxios.delete).toHaveBeenCalledWith(
          `/api/projects/${projectId}/issues/${issueId}/tasks/${taskId}`
        )
      })
    })
  })

  describe('Sprints', () => {
    describe('createSprint', () => {
      it('should create a sprint', async () => {
        const projectId = 'project-123'
        const sprintData = {
          name: 'Sprint 1',
          startDate: '2025-01-01',
          endDate: '2025-01-14'
        }
        const mockResponse = { data: { id: 1, ...sprintData, issueIds: [] } }

        mockedAxios.post.mockResolvedValue(mockResponse)

        const result = await projectService.createSprint(projectId, sprintData)

        expect(result).toEqual(mockResponse.data)
        expect(mockedAxios.post).toHaveBeenCalledWith(`/api/projects/${projectId}/sprints`, sprintData)
      })
    })

    describe('getSprintsByProject', () => {
      it('should retrieve all sprints for a project', async () => {
        const projectId = 'project-123'
        const mockSprints = [
          { id: 1, name: 'Sprint 1', issueIds: [1, 2] },
          { id: 2, name: 'Sprint 2', issueIds: [3] }
        ]

        mockedAxios.get.mockResolvedValue({ data: mockSprints })

        const result = await projectService.getSprintsByProject(projectId)

        expect(result).toEqual(mockSprints)
        expect(mockedAxios.get).toHaveBeenCalledWith(`/api/projects/${projectId}/sprints`)
      })
    })

    describe('getSprint', () => {
      it('should retrieve a specific sprint', async () => {
        const projectId = 'project-123'
        const sprintId = 1
        const mockSprint = { id: sprintId, name: 'Sprint 1', issueIds: [] }

        mockedAxios.get.mockResolvedValue({ data: mockSprint })

        const result = await projectService.getSprint(projectId, sprintId)

        expect(result).toEqual(mockSprint)
        expect(mockedAxios.get).toHaveBeenCalledWith(`/api/projects/${projectId}/sprints/${sprintId}`)
      })
    })

    describe('updateSprint', () => {
      it('should update a sprint', async () => {
        const projectId = 'project-123'
        const sprintId = 1
        const updateData = { name: 'Updated Sprint' }
        const mockResponse = { data: { id: sprintId, ...updateData } }

        mockedAxios.put.mockResolvedValue(mockResponse)

        const result = await projectService.updateSprint(projectId, sprintId, updateData)

        expect(result).toEqual(mockResponse.data)
        expect(mockedAxios.put).toHaveBeenCalledWith(
          `/api/projects/${projectId}/sprints/${sprintId}`,
          updateData
        )
      })
    })

    describe('deleteSprint', () => {
      it('should delete a sprint', async () => {
        const projectId = 'project-123'
        const sprintId = 1

        mockedAxios.delete.mockResolvedValue({})

        await projectService.deleteSprint(projectId, sprintId)

        expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/projects/${projectId}/sprints/${sprintId}`)
      })
    })

    describe('getIssuesBySprint', () => {
      it('should retrieve issues for a sprint', async () => {
        const projectId = 'project-123'
        const sprintId = 1
        const mockIssues = [
          { id: 1, title: 'Issue 1' },
          { id: 2, title: 'Issue 2' }
        ]

        mockedAxios.get.mockResolvedValue({ data: mockIssues })

        const result = await projectService.getIssuesBySprint(projectId, sprintId)

        expect(result).toEqual(mockIssues)
        expect(mockedAxios.get).toHaveBeenCalledWith(`/api/projects/${projectId}/sprints/${sprintId}/issues`)
      })
    })
  })
})
