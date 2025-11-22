import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AssignIssueForm from '../../issues/AssignIssueForm.vue'
import projectService from '../../../services/projectService'
import userService from '../../../services/userService'

vi.mock('../../../services/projectService', () => ({
  default: {
    updateIssue: vi.fn()
  }
}))

vi.mock('../../../services/userService', () => ({
  default: {
    getUser: vi.fn()
  }
}))

describe('AssignIssueForm', () => {
  const mockIssue: any = {
    id: 123,
    title: 'Test Issue',
    description: 'Test description',
    priority: 'HIGH',
    storyPoints: 5,
    status: 'TODO',
    assigneeId: null,
    projectId: 'project-123',
    creatorId: 1,
    createdAt: '2024-01-01T10:00:00Z'
  }

  const mockAssignees = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(userService.getUser).mockResolvedValue({ id: 1, name: 'John Doe', email: 'john@example.com' })
  })

  it('devrait afficher le modal d\'assignation', () => {
    const wrapper = mount(AssignIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    expect(wrapper.find('.assign-issue-modal').exists()).toBe(true)
    expect(wrapper.text()).toContain('Assigner l\'issue')
  })

  it('devrait afficher les informations de l\'issue', () => {
    const wrapper = mount(AssignIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    expect(wrapper.text()).toContain('Test Issue')
    expect(wrapper.text()).toContain('Test description')
    expect(wrapper.text()).toContain('HIGH')
    expect(wrapper.text()).toContain('5 SP')
  })

  it('devrait avoir un select avec la liste des assignés', () => {
    const wrapper = mount(AssignIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    const select = wrapper.find('select#assignee')
    expect(select.exists()).toBe(true)
    
    const options = select.findAll('option')
    expect(options.length).toBe(3) // "Non assigné" + 2 assignees
    if (options[1]) expect(options[1].text()).toContain('John Doe')
    if (options[2]) expect(options[2].text()).toContain('Jane Smith')
  })

  it('devrait afficher "Non assigné" par défaut', () => {
    const wrapper = mount(AssignIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    expect(wrapper.text()).toContain('Actuellement assigné à:')
    expect(wrapper.text()).toContain('Non assigné')
  })

  it('devrait émettre close lors du clic sur Annuler', async () => {
    const wrapper = mount(AssignIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('devrait émettre close lors du clic sur le bouton de fermeture', async () => {
    const wrapper = mount(AssignIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    await wrapper.find('.btn-close').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('devrait émettre close lors du clic sur l\'overlay', async () => {
    const wrapper = mount(AssignIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('devrait permettre de sélectionner un assigné', async () => {
    const wrapper = mount(AssignIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    const select = wrapper.find('select#assignee')
    await select.setValue(1)
    await nextTick()

    expect((select.element as HTMLSelectElement).value).toBe('1')
  })

  it('devrait appeler updateIssue lors de la soumission', async () => {
    const updatedIssue = { ...mockIssue, assigneeId: 1 }
    vi.mocked(projectService.updateIssue).mockResolvedValue(updatedIssue)

    const wrapper = mount(AssignIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    const select = wrapper.find('select#assignee')
    await select.setValue(1)
    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()

    expect(projectService.updateIssue).toHaveBeenCalled()
  })

  it('devrait désactiver le bouton pendant la soumission', async () => {
    vi.mocked(projectService.updateIssue).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockIssue), 100))
    )

    const wrapper = mount(AssignIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    const submitButton = wrapper.find('.btn-submit')
    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()

    expect((submitButton.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('devrait afficher le badge de priorité', () => {
    const wrapper = mount(AssignIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    const priorityBadge = wrapper.find('[class*="priority-"]')
    expect(priorityBadge.exists()).toBe(true)
    expect(priorityBadge.text()).toContain('HIGH')
  })
})
