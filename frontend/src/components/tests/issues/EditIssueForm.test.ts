import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import EditIssueForm from '../../issues/EditIssueForm.vue'
import projectService from '../../../services/projectService'

vi.mock('../../../services/projectService', () => ({
  default: {
    updateIssue: vi.fn(),
    getProjectCollaborators: vi.fn()
  }
}))

describe('EditIssueForm', () => {
  const mockIssue: any = {
    id: 123,
    title: 'Test Issue',
    description: 'Test description',
    priority: 'HIGH',
    storyPoints: 5,
    status: 'TODO',
    assigneeId: 1,
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
    vi.mocked(projectService.getProjectCollaborators).mockResolvedValue(mockAssignees)
  })

  it('devrait afficher le modal d\'édition', () => {
    const wrapper = mount(EditIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    expect(wrapper.find('.edit-issue-modal').exists()).toBe(true)
    expect(wrapper.text()).toContain('Modifier l\'issue')
  })

  it('devrait pré-remplir le formulaire avec les données de l\'issue', () => {
    const wrapper = mount(EditIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    const titleInput = wrapper.find('input#title')
    const descriptionTextarea = wrapper.find('textarea#description')
    const prioritySelect = wrapper.find('select#priority')
    const storyPointsInput = wrapper.find('input#storyPoints')

    expect((titleInput.element as HTMLInputElement).value).toBe('Test Issue')
    expect((descriptionTextarea.element as HTMLTextAreaElement).value).toBe('Test description')
    expect((prioritySelect.element as HTMLSelectElement).value).toBe('HIGH')
    expect((storyPointsInput.element as HTMLInputElement).value).toBe('5')
  })

  it('devrait avoir tous les champs requis', () => {
    const wrapper = mount(EditIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    expect(wrapper.find('input#title').exists()).toBe(true)
    expect(wrapper.find('textarea#description').exists()).toBe(true)
    expect(wrapper.find('select#priority').exists()).toBe(true)
    expect(wrapper.find('input#storyPoints').exists()).toBe(true)
    expect(wrapper.find('select#assignee').exists()).toBe(true)
    expect(wrapper.find('select#status').exists()).toBe(true)
  })

  it('devrait afficher les options de priorité', () => {
    const wrapper = mount(EditIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    const priorityOptions = wrapper.find('select#priority').findAll('option')
    expect(priorityOptions.length).toBeGreaterThan(1)
  })

  it('devrait afficher les options de statut', () => {
    const wrapper = mount(EditIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    const statusOptions = wrapper.find('select#status').findAll('option')
    expect(statusOptions.length).toBe(3) // TODO, IN_PROGRESS, CLOSED
  })

  it('devrait avoir un bouton Annuler', () => {
    const wrapper = mount(EditIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    const cancelButton = wrapper.find('.btn-cancel')
    expect(cancelButton.exists()).toBe(true)
    expect(cancelButton.text()).toContain('Annuler')
  })

  it('devrait avoir un bouton Mettre à jour', () => {
    const wrapper = mount(EditIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    const submitButton = wrapper.find('.btn-submit')
    expect(submitButton.exists()).toBe(true)
    expect(submitButton.text()).toContain('Mettre à jour')
  })

  it('devrait émettre close lors du clic sur Annuler', async () => {
    const wrapper = mount(EditIssueForm, {
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
    const wrapper = mount(EditIssueForm, {
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
    const wrapper = mount(EditIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('devrait permettre de modifier le titre', async () => {
    const wrapper = mount(EditIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    const titleInput = wrapper.find('input#title')
    await titleInput.setValue('Nouveau titre')
    await nextTick()

    expect((titleInput.element as HTMLInputElement).value).toBe('Nouveau titre')
  })

  it('devrait permettre de modifier la priorité', async () => {
    const wrapper = mount(EditIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    const prioritySelect = wrapper.find('select#priority')
    await prioritySelect.setValue('LOW')
    await nextTick()

    expect((prioritySelect.element as HTMLSelectElement).value).toBe('LOW')
  })

  it('devrait permettre de modifier les story points', async () => {
    const wrapper = mount(EditIssueForm, {
      props: {
        projectId: 'project-123',
        issue: mockIssue,
        assignees: mockAssignees
      }
    })

    const storyPointsInput = wrapper.find('input#storyPoints')
    await storyPointsInput.setValue(8)
    await nextTick()

    expect((storyPointsInput.element as HTMLInputElement).value).toBe('8')
  })
})
