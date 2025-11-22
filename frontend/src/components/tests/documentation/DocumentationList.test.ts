import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DocumentationList from '../../documentation/DocumentationList.vue'
import documentationService from '../../../services/documentationService'

// Mock du router
const mockRoute = {
  params: { id: 'test-project-id' }
}

const mockPush = vi.fn()
const mockRouter = {
  push: mockPush,
  back: vi.fn()
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter
}))

// Mock du service documentation
vi.mock('../../../services/documentationService', () => ({
  default: {
    getDocumentationByProject: vi.fn(),
    createDocumentation: vi.fn(),
    updateDocumentation: vi.fn(),
    deleteDocumentation: vi.fn()
  }
}))

describe('DocumentationList', () => {
  const mockDocs = [
    {
      id: 1,
      title: 'Getting Started',
      content: '# Welcome\n\nThis is the documentation.',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      title: 'API Documentation',
      content: '# API\n\nEndpoints and usage.',
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(documentationService.getDocumentationByProject).mockResolvedValue(mockDocs)
  })

  it('devrait afficher le titre de la page', () => {
    const wrapper = mount(DocumentationList)
    expect(wrapper.text()).toContain('Documentation du Projet')
  })

  it('devrait afficher le bouton "Nouveau Document"', () => {
    const wrapper = mount(DocumentationList)
    const button = wrapper.find('.btn-new')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Nouveau Document')
  })

  it('devrait charger et afficher la liste des documents', async () => {
    const wrapper = mount(DocumentationList)
    await nextTick()
    await nextTick()

    expect(documentationService.getDocumentationByProject).toHaveBeenCalledWith('test-project-id')
    expect(wrapper.findAll('.docs-grid > *').length).toBeGreaterThan(0)
  })

  it('devrait afficher le message vide si aucune documentation', async () => {
    vi.mocked(documentationService.getDocumentationByProject).mockResolvedValue([])
    
    const wrapper = mount(DocumentationList)
    await nextTick()
    await nextTick()

    expect(wrapper.text()).toContain('Aucune documentation trouvée')
  })

  it('devrait afficher l\'éditeur lors du clic sur "Nouveau Document"', async () => {
    const wrapper = mount(DocumentationList)
    await wrapper.find('.btn-new').trigger('click')
    await nextTick()

    expect(wrapper.find('.editor-container').exists()).toBe(true)
    expect(wrapper.text()).toContain('Créer')
  })

  it('devrait créer un nouveau document', async () => {
    const newDoc = {
      id: 3,
      title: 'New Doc',
      content: 'New content',
      createdAt: '2024-01-03T10:00:00Z',
      updatedAt: '2024-01-03T10:00:00Z'
    }

    vi.mocked(documentationService.createDocumentation).mockResolvedValue(newDoc)
    vi.mocked(documentationService.getDocumentationByProject).mockResolvedValue([...mockDocs, newDoc])

    const wrapper = mount(DocumentationList)
    await nextTick()

    // Ouvrir l'éditeur
    await wrapper.find('.btn-new').trigger('click')
    await nextTick()

    // Simuler la sauvegarde
    const editor = wrapper.findComponent({ name: 'MarkdownEditor' })
    await editor.vm.$emit('save', { title: 'New Doc', content: 'New content' })
    await nextTick()

    expect(documentationService.createDocumentation).toHaveBeenCalledWith(
      'test-project-id',
      { title: 'New Doc', content: 'New content' }
    )
  })

  it('devrait mettre à jour un document existant', async () => {
    const updatedDoc = {
      ...mockDocs[0],
      title: 'Updated Title',
      content: 'Updated content'
    }

    vi.mocked(documentationService.updateDocumentation).mockResolvedValue(updatedDoc)
    const secondDoc = mockDocs[1]
    if (secondDoc) {
      vi.mocked(documentationService.getDocumentationByProject).mockResolvedValue([updatedDoc, secondDoc])
    }

    const wrapper = mount(DocumentationList)
    await nextTick()
    await nextTick()

    // Simuler l'édition d'un document
    const card = wrapper.findComponent({ name: 'DocumentationCard' })
    await card.vm.$emit('edit')
    await nextTick()

    // Vérifier que l'éditeur est affiché
    expect(wrapper.find('.editor-container').exists()).toBe(true)
    expect(wrapper.text()).toContain('Modifier')

    // Simuler la sauvegarde
    const editor = wrapper.findComponent({ name: 'MarkdownEditor' })
    await editor.vm.$emit('save', updatedDoc)
    await nextTick()

    expect(documentationService.updateDocumentation).toHaveBeenCalledWith(
      'test-project-id',
      1,
      updatedDoc
    )
  })

  it('devrait supprimer un document après confirmation', async () => {
    vi.mocked(documentationService.deleteDocumentation).mockResolvedValue(undefined)
    
    const wrapper = mount(DocumentationList)
    await nextTick()
    await nextTick()

    // Simuler le clic sur supprimer du premier document de la liste
    const cards = wrapper.findAllComponents({ name: 'DocumentationCard' })
    expect(cards.length).toBeGreaterThan(0)
    
    if (cards.length > 0 && cards[0]) {
      await cards[0].vm.$emit('delete')
      await nextTick()

      // Vérifier que le modal de suppression est affiché
      const deleteModal = wrapper.findComponent({ name: 'DocumentationDeleteModal' })
      expect(deleteModal.exists()).toBe(true)

      // Confirmer la suppression
      await deleteModal.vm.$emit('confirm')
      await nextTick()

      // Vérifier que le service a été appelé (peu importe l'ID exact)
      expect(documentationService.deleteDocumentation).toHaveBeenCalledWith(
        'test-project-id',
        expect.any(Number)
      )
    }
  })

  it('devrait annuler la suppression', async () => {
    const wrapper = mount(DocumentationList)
    await nextTick()
    await nextTick()

    // Simuler le clic sur supprimer
    const card = wrapper.findComponent({ name: 'DocumentationCard' })
    await card.vm.$emit('delete')
    await nextTick()

    // Vérifier que le modal est affiché
    const deleteModal = wrapper.findComponent({ name: 'DocumentationDeleteModal' })
    expect(deleteModal.exists()).toBe(true)

    // Annuler la suppression
    await deleteModal.vm.$emit('cancel')
    await nextTick()

    // Vérifier que le modal a disparu
    expect(wrapper.findComponent({ name: 'DocumentationDeleteModal' }).exists()).toBe(false)
    expect(documentationService.deleteDocumentation).not.toHaveBeenCalled()
  })

  it('devrait afficher le modal de visualisation', async () => {
    const wrapper = mount(DocumentationList)
    await nextTick()
    await nextTick()

    // Simuler le clic sur view
    const card = wrapper.findComponent({ name: 'DocumentationCard' })
    await card.vm.$emit('view')
    await nextTick()

    // Vérifier que le modal de visualisation est affiché
    const viewModal = wrapper.findComponent({ name: 'DocumentationViewModal' })
    expect(viewModal.exists()).toBe(true)
  })

  it('devrait fermer le modal de visualisation', async () => {
    const wrapper = mount(DocumentationList)
    await nextTick()
    await nextTick()

    // Ouvrir le modal
    const card = wrapper.findComponent({ name: 'DocumentationCard' })
    await card.vm.$emit('view')
    await nextTick()

    // Fermer le modal
    const viewModal = wrapper.findComponent({ name: 'DocumentationViewModal' })
    await viewModal.vm.$emit('close')
    await nextTick()

    expect(wrapper.findComponent({ name: 'DocumentationViewModal' }).exists()).toBe(false)
  })

  it('devrait annuler l\'édition', async () => {
    const wrapper = mount(DocumentationList)
    
    // Ouvrir l'éditeur
    await wrapper.find('.btn-new').trigger('click')
    await nextTick()

    expect(wrapper.find('.editor-container').exists()).toBe(true)

    // Annuler
    const editor = wrapper.findComponent({ name: 'MarkdownEditor' })
    await editor.vm.$emit('cancel')
    await nextTick()

    expect(wrapper.find('.editor-container').exists()).toBe(false)
  })
})
