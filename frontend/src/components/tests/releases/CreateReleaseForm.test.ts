import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CreateReleaseForm from '../../releases/CreateReleaseForm.vue'
import projectService from '../../../services/projectService'
import type { IssueResponse } from '../../../services/projectService'

vi.mock('../../../services/projectService', () => ({
  default: {
    getIssuesByProject: vi.fn()
  }
}))

vi.mock('../../../stores/releaseStore', () => {
  const mockReleases: any[] = []
  
  const store = {
    createRelease: vi.fn(),
    state: {
      get releases() {
        return mockReleases
      },
      set releases(value: any[]) {
        mockReleases.length = 0
        (releaseStore as any)._mockReleases.push(...value)
      },
      loading: false,
      error: null
    },
    _mockReleases: mockReleases
  }
  
  return {
    releaseStore: store,
    default: store
  }
})

// Import after mocks to get the mocked version
import releaseStore from '../../../stores/releaseStore'

describe('CreateReleaseForm', () => {
  const mockIssues: IssueResponse[] = [
    {
      id: 1,
      title: 'Issue 1',
      description: 'Description 1',
      priority: 'HIGH',
      storyPoints: 5,
      status: 'TODO',
      projectId: 'proj-123',
      creatorId: 1,
      createdAt: '2025-11-10T10:00:00Z'
    },
    {
      id: 2,
      title: 'Issue 2',
      description: 'Description 2',
      priority: 'MEDIUM',
      storyPoints: 3,
      status: 'IN_PROGRESS',
      projectId: 'proj-123',
      creatorId: 1,
      createdAt: '2025-11-11T10:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectService.getIssuesByProject).mockResolvedValue(mockIssues)
    ;(releaseStore as any)._mockReleases.length = 0
  })

  it('devrait afficher le modal de création de release', () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    expect(wrapper.find('.release-modal').exists()).toBe(true)
    expect(wrapper.find('.modal-content').exists()).toBe(true)
  })

  it('devrait afficher le titre du modal', () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    expect(wrapper.find('.modal-header h2').text()).toBe('Créer une Release')
  })

  it('devrait avoir des champs pour la version (major, minor, patch)', () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    expect(wrapper.find('#major').exists()).toBe(true)
    expect(wrapper.find('#minor').exists()).toBe(true)
    expect(wrapper.find('#patch').exists()).toBe(true)
  })

  it('devrait initialiser la version à 1.0.0', () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    const majorInput = wrapper.find('#major').element as HTMLInputElement
    const minorInput = wrapper.find('#minor').element as HTMLInputElement
    const patchInput = wrapper.find('#patch').element as HTMLInputElement

    expect(majorInput.value).toBe('1')
    expect(minorInput.value).toBe('0')
    expect(patchInput.value).toBe('0')
  })

  it('devrait afficher la preview de version', () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    expect(wrapper.find('.version-preview').text()).toContain('1.0.0')
  })

  it('devrait avoir un champ pour les notes de release', () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    expect(wrapper.find('#releaseNotes').exists()).toBe(true)
  })

  it('devrait charger les issues au montage', async () => {
    mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    await flushPromises()
    expect(projectService.getIssuesByProject).toHaveBeenCalledWith('proj-123')
  })

  it('devrait avoir un champ de recherche pour les issues', () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    expect(wrapper.find('#issueSearch').exists()).toBe(true)
  })

  it('devrait émettre close au clic sur annuler', async () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('devrait émettre close au clic sur le bouton X', async () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    await wrapper.find('.btn-close').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('devrait émettre close au clic sur l\'overlay', async () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('devrait valider que major >= 0', async () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    
    const majorInput = wrapper.find('#major')
    await majorInput.setValue(-1)
    await wrapper.find('form').trigger('submit.prevent')
    
    await flushPromises()
    expect(wrapper.find('.error-message').text()).toContain('major')
  })

  it('devrait valider que minor >= 0', async () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    
    const minorInput = wrapper.find('#minor')
    await minorInput.setValue(-1)
    await wrapper.find('form').trigger('submit.prevent')
    
    await flushPromises()
    expect(wrapper.find('.error-message').text()).toContain('minor')
  })

  it('devrait valider que patch >= 0', async () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    
    const patchInput = wrapper.find('#patch')
    await patchInput.setValue(-1)
    await wrapper.find('form').trigger('submit.prevent')
    
    await flushPromises()
    expect(wrapper.find('.error-message').text()).toContain('patch')
  })

  it('devrait empêcher la création de versions dupliquées', async () => {
    (releaseStore as any)._mockReleases.push({
      id: 1,
      version: { major: 1, minor: 0, patch: 0 },
      createdAt: '2025-11-17T10:00:00Z',
      creatorId: 1,
      issueIds: [],
      projectId: 'proj-123'
    })

    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.message.error').text()).toContain('existe déjà')
  })

  it('devrait afficher les suggestions d\'issues lors de la saisie', async () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    
    await flushPromises()
    
    const searchInput = wrapper.find('#issueSearch')
    await searchInput.trigger('focus')
    await searchInput.setValue('Issue')
    
    await flushPromises()
    expect(wrapper.find('.suggestions').exists()).toBe(true)
  })

  it('devrait ajouter une issue sélectionnée aux chips', async () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    
    await flushPromises()
    
    const searchInput = wrapper.find('#issueSearch')
    await searchInput.trigger('focus')
    await searchInput.setValue('Issue 1')
    
    await flushPromises()
    
    const suggestion = wrapper.find('.suggestions li')
    await suggestion.trigger('click')
    
    await flushPromises()
    expect(wrapper.find('.issue-chip').exists()).toBe(true)
  })

  it('devrait pouvoir supprimer une issue des chips', async () => {
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    
    await flushPromises()
    
    // Ajouter une issue
    const searchInput = wrapper.find('#issueSearch')
    await searchInput.trigger('focus')
    await searchInput.setValue('Issue 1')
    await flushPromises()
    
    const suggestion = wrapper.find('.suggestions li')
    await suggestion.trigger('click')
    await flushPromises()
    
    // Supprimer l'issue
    const removeButton = wrapper.find('.chip-remove')
    await removeButton.trigger('click')
    await flushPromises()
    
    expect(wrapper.find('.issue-chip').exists()).toBe(false)
  })

  it('devrait appeler releaseStore.createRelease lors de la soumission valide', async () => {
    vi.mocked(releaseStore.createRelease).mockResolvedValue({
      id: 1,
      version: { major: 2, minor: 1, patch: 0 },
      createdAt: '2025-11-18T10:00:00Z',
      releaseNotes: 'Test release notes',
      creatorId: 1,
      issueIds: [],
      projectId: 'proj-123'
    })
    
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })

    await wrapper.find('#major').setValue(2)
    await wrapper.find('#minor').setValue(1)
    await wrapper.find('#patch').setValue(0)
    await wrapper.find('#releaseNotes').setValue('Test release notes')
    
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(releaseStore.createRelease).toHaveBeenCalledWith('proj-123', {
      version: {
        major: 2,
        minor: 1,
        patch: 0
      },
      releaseNotes: 'Test release notes',
      issueIds: []
    })
  })

  it('devrait afficher un message de succès après création', async () => {
    vi.mocked(releaseStore.createRelease).mockResolvedValue({
      id: 1,
      version: { major: 3, minor: 0, patch: 0 },
      createdAt: '2025-11-18T10:00:00Z',
      creatorId: 1,
      issueIds: [],
      projectId: 'proj-123'
    })
    
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })

    await wrapper.find('#major').setValue(3)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.message.success').text()).toContain('succès')
  })

  it('devrait afficher un message d\'erreur en cas d\'échec', async () => {
    vi.mocked(releaseStore.createRelease).mockRejectedValue(new Error('Erreur réseau'))
    
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })

    await wrapper.find('#major').setValue(4)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.message.error').exists()).toBe(true)
  })

  it('devrait désactiver le bouton de soumission pendant l\'envoi', async () => {
    vi.mocked(releaseStore.createRelease).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })

    await wrapper.find('#major').setValue(5)
    
    const submitButton = wrapper.find('button[type="submit"]')
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('devrait filtrer les issues déjà utilisées dans d\'autres releases', async () => {
    (releaseStore as any)._mockReleases.push({
      id: 1,
      version: { major: 1, minor: 0, patch: 0 },
      createdAt: '2025-11-17T10:00:00Z',
      creatorId: 1,
      issueIds: [1], // Issue 1 déjà utilisée
      projectId: 'proj-123'
    })

    const wrapper = mount(CreateReleaseForm, {
      props: {
        projectId: 'proj-123'
      }
    })
    
    await flushPromises()
    
    const searchInput = wrapper.find('#issueSearch')
    await searchInput.trigger('focus')
    
    await flushPromises()
    
    const suggestions = wrapper.findAll('.suggestions li')
    // Issue 1 devrait être filtrée, donc seulement Issue 2 disponible
    expect(suggestions.length).toBeLessThanOrEqual(1)
  })
})
