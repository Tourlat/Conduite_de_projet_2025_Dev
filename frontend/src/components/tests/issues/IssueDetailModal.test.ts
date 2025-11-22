import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import IssueDetailModal from '../../issues/IssueDetailModal.vue'
import userService from '../../../services/userService'
import projectService from '../../../services/projectService'

vi.mock('../../../services/userService', () => ({
  default: {
    getUser: vi.fn()
  }
}))

vi.mock('../../../services/projectService', () => ({
  default: {
    getProjectCollaborators: vi.fn()
  }
}))

// Mock TaskDetails component
vi.mock('../../tasks/TaskDetails.vue', () => ({
  default: {
    name: 'TaskDetails',
    template: '<div class="task-details-mock">TaskDetails</div>'
  }
}))

describe('IssueDetailModal', () => {
  const mockIssue: any = {
    id: 123,
    title: 'Test Issue',
    description: 'Test description détaillée',
    priority: 'HIGH',
    storyPoints: 5,
    status: 'TODO',
    assigneeId: 1,
    projectId: 'project-123',
    creatorId: 1,
    createdAt: '2024-01-01T10:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(userService.getUser).mockResolvedValue({ id: 1, name: 'John Doe', email: 'john@example.com' })
    vi.mocked(projectService.getProjectCollaborators).mockResolvedValue([])
  })

  it('devrait afficher le modal de détail', () => {
    const wrapper = mount(IssueDetailModal, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        canModify: true
      }
    })

    expect(wrapper.find('.issue-detail-modal').exists()).toBe(true)
  })

  it('devrait afficher le titre de l\'issue', () => {
    const wrapper = mount(IssueDetailModal, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        canModify: true
      }
    })

    expect(wrapper.text()).toContain('Test Issue')
  })

  it('devrait afficher la description de l\'issue', () => {
    const wrapper = mount(IssueDetailModal, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        canModify: true
      }
    })

    expect(wrapper.text()).toContain('Test description détaillée')
  })

  it('devrait afficher le badge de statut', () => {
    const wrapper = mount(IssueDetailModal, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        canModify: true
      }
    })

    const statusBadge = wrapper.find('.status-badge')
    expect(statusBadge.exists()).toBe(true)
    expect(statusBadge.classes()).toContain('status-todo')
  })

  it('devrait afficher le badge de priorité', () => {
    const wrapper = mount(IssueDetailModal, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        canModify: true
      }
    })

    const priorityBadge = wrapper.find('.priority-high')
    expect(priorityBadge.exists()).toBe(true)
  })

  it('devrait afficher les story points', () => {
    const wrapper = mount(IssueDetailModal, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        canModify: true
      }
    })

    expect(wrapper.text()).toContain('Story Points')
    expect(wrapper.text()).toContain('5')
  })

  it('devrait avoir un bouton de fermeture', () => {
    const wrapper = mount(IssueDetailModal, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        canModify: true
      }
    })

    const closeButton = wrapper.find('.btn-close')
    expect(closeButton.exists()).toBe(true)
  })

  it('devrait émettre close lors du clic sur le bouton de fermeture', async () => {
    const wrapper = mount(IssueDetailModal, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        canModify: true
      }
    })

    await wrapper.find('.btn-close').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('devrait émettre close lors du clic sur l\'overlay', async () => {
    const wrapper = mount(IssueDetailModal, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        canModify: true
      }
    })

    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('devrait afficher la grille d\'informations', () => {
    const wrapper = mount(IssueDetailModal, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        canModify: true
      }
    })

    expect(wrapper.find('.info-grid').exists()).toBe(true)
    expect(wrapper.findAll('.info-item').length).toBeGreaterThan(0)
  })

  it('devrait inclure le composant TaskDetails', () => {
    const wrapper = mount(IssueDetailModal, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        canModify: true
      }
    })

    expect(wrapper.findComponent({ name: 'TaskDetails' }).exists()).toBe(true)
  })

  it('devrait afficher "Non assigné" si aucun assigné', async () => {
    const unassignedIssue = { ...mockIssue, assigneeId: null }
    
    const wrapper = mount(IssueDetailModal, {
      props: {
        projectId: 'project-123',
        issue: unassignedIssue,
        canModify: true
      }
    })

    // Attendre que le composant se charge
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Assigné à')
  })
})
