import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CreateIssueForm from '../../issues/CreateIssueForm.vue'
import projectService from '../../../services/projectService'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

vi.mock('../../../services/projectService', () => ({
  default: {
    createIssue: vi.fn()
  }
}))

describe('CreateIssueForm', () => {
  const mockCollaborators = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]

  const mockCreator = {
    id: 0,
    name: 'Project Owner',
    email: 'owner@example.com'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectService.createIssue).mockResolvedValue({
      id: 1,
      title: 'Test Issue',
      priority: 'MEDIUM',
      storyPoints: 5,
      status: 'TODO',
      projectId: 'proj-1',
      creatorId: 1,
      description: 'Test description',
      createdAt: '2025-11-10T10:00:00Z'
    })
  })

  it('devrait afficher le formulaire de création d\'issue', () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('devrait avoir un champ pour le titre', () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    expect(wrapper.find('input[name="title"]').exists()).toBe(true)
  })

  it('devrait avoir un champ pour la description', () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    expect(wrapper.find('textarea[name="description"]').exists()).toBe(true)
  })

  it('devrait avoir un select pour la priorité', () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    expect(wrapper.find('select[name="priority"]').exists()).toBe(true)
  })

  it('devrait avoir un input pour les story points', () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    expect(wrapper.find('input[name="storyPoints"]').exists()).toBe(true)
  })

  it('devrait avoir un select pour assigner', () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    expect(wrapper.find('select[name="assignee"]').exists()).toBe(true)
  })

  it('devrait valider que le titre est requis', async () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    const errorMessages = wrapper.findAll('.error-message')
    expect(errorMessages.length).toBeGreaterThan(0)
  })

  it('devrait valider que la priorité est requise', async () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    
    await wrapper.find('input[name="title"]').setValue('Test Issue')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    const errorMessages = wrapper.findAll('.error-message')
    expect(errorMessages.length).toBeGreaterThan(0)
  })

  it('devrait valider que les story points sont valides', async () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    
    await wrapper.find('input[name="title"]').setValue('Test Issue')
    await wrapper.find('select[name="priority"]').setValue('HIGH')
    await wrapper.find('input[name="storyPoints"]').setValue(0)
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    const errorMessages = wrapper.findAll('.error-message')
    expect(errorMessages.length).toBeGreaterThan(0)
  })

  it('devrait soumettre le formulaire avec des données valides', async () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    
    await wrapper.find('input[name="title"]').setValue('New Issue')
    await wrapper.find('textarea[name="description"]').setValue('Issue description')
    await wrapper.find('select[name="priority"]').setValue('HIGH')
    await wrapper.find('input[name="storyPoints"]').setValue('8')
    
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    expect(projectService.createIssue).toHaveBeenCalled()
  })

  it('devrait inclure le créateur dans la liste des assignés', () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    
    const options = wrapper.findAll('select[name="assignee"] option')
    const creatorOption = options.find(opt => opt.text().includes('Project Owner'))
    expect(creatorOption).toBeDefined()
  })

  it('devrait afficher tous les collaborateurs dans la liste des assignés', () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    
    const options = wrapper.findAll('select[name="assignee"] option')
    expect(options.length).toBeGreaterThanOrEqual(mockCollaborators.length + 1)
  })

  it('devrait émettre un événement issueCreated après succès', async () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    
    await wrapper.find('input[name="title"]').setValue('New Issue')
    await wrapper.find('select[name="priority"]').setValue('MEDIUM')
    await wrapper.find('input[name="storyPoints"]').setValue('5')
    
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.emitted('issueCreated')).toBeTruthy()
  })

  it('devrait réinitialiser le formulaire après soumission réussie', async () => {
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    
    const titleInput = wrapper.find('input[name="title"]') as any
    await titleInput.setValue('New Issue')
    await wrapper.find('select[name="priority"]').setValue('MEDIUM')
    await wrapper.find('input[name="storyPoints"]').setValue('5')
    
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    expect(titleInput.element.value).toBe('')
  })

  it('devrait afficher un message d\'erreur en cas d\'échec', async () => {
    vi.mocked(projectService.createIssue).mockRejectedValueOnce(
      new Error('Erreur serveur')
    )
    
    const wrapper = mount(CreateIssueForm, {
      props: {
        projectId: 'proj-1',
        collaborators: mockCollaborators,
        creator: mockCreator
      }
    })
    
    await wrapper.find('input[name="title"]').setValue('New Issue')
    await wrapper.find('select[name="priority"]').setValue('MEDIUM')
    await wrapper.find('input[name="storyPoints"]').setValue('5')
    
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    const errorMessage = wrapper.find('.message.error')
    expect(errorMessage.exists()).toBe(true)
  })
})