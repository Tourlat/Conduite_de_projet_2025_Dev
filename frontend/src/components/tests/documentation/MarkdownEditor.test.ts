import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MarkdownEditor from '../../documentation/MarkdownEditor.vue'
import IssueLinker from '../../documentation/IssueLinker.vue'

// Mock du router
const mockRoute = {
  params: { id: 'test-project-id' }
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute
}))

// Mock d'axios pour les appels API
vi.mock('axios', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url.includes('/issues')) {
        return Promise.resolve({
          data: [
            {
              id: 123,
              title: 'Test Issue',
              description: 'Description de test',
              priority: 'HIGH',
              status: 'TODO',
              tasks: [
                { id: 1, title: 'Task 1', status: 'TODO' },
                { id: 2, title: 'Task 2', status: 'DONE' }
              ]
            }
          ]
        })
      }
      if (url.includes('/documentation-issues/documentation/')) {
        return Promise.resolve({
          data: [
            {
              id: 1,
              documentationId: 1,
              issueId: 123,
              issueTitle: 'Test Issue',
              issuePriority: 'HIGH',
              issueStatus: 'TODO'
            }
          ]
        })
      }
      return Promise.resolve({ data: [] })
    }),
    post: vi.fn(() => {
      return Promise.resolve({
        data: {
          id: 1,
          documentationId: 1,
          issueId: 123,
          issueTitle: 'Test Issue',
          issuePriority: 'HIGH',
          issueStatus: 'TODO'
        }
      })
    }),
    delete: vi.fn(() => Promise.resolve({ data: {} }))
  }
}))

// Mock du service documentationIssueService
vi.mock('../../services/documentationIssueService', () => ({
  default: {
    getIssuesByDocumentation: vi.fn().mockResolvedValue([]),
    linkDocumentationToIssue: vi.fn().mockResolvedValue({
      data: {
        id: 123,
        title: 'Test Issue',
        description: 'Description de test',
        priority: 'HIGH',
        status: 'TODO',
        tasks: [
          { id: 1, title: 'Task 1', status: 'TODO' },
          { id: 2, title: 'Task 2', status: 'DONE' }
        ]
      }
    }),
    unlinkDocumentationFromIssue: vi.fn().mockResolvedValue({})
  }
}))

describe('MarkdownEditor', () => {
  const mockDoc = {
    id: 1,
    title: 'Test Doc',
    content: '# Test Content',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait afficher le formulaire d\'édition', () => {
    const wrapper = mount(MarkdownEditor)
    expect(wrapper.find('.markdown-editor').exists()).toBe(true)
  })

  it('devrait avoir un champ pour le titre', () => {
    const wrapper = mount(MarkdownEditor)
    const titleInput = wrapper.find('input#title')
    expect(titleInput.exists()).toBe(true)
    expect(titleInput.attributes('placeholder')).toContain('Titre')
  })

  it('devrait avoir un champ pour le contenu', () => {
    const wrapper = mount(MarkdownEditor)
    const contentTextarea = wrapper.find('textarea#content')
    expect(contentTextarea.exists()).toBe(true)
    expect(contentTextarea.attributes('placeholder')).toContain('Markdown')
  })

  it('devrait afficher la section d\'aperçu', () => {
    const wrapper = mount(MarkdownEditor)
    expect(wrapper.find('.preview-section').exists()).toBe(true)
    expect(wrapper.find('.markdown-preview').exists()).toBe(true)
  })

  it('devrait charger les données initiales', () => {
    const wrapper = mount(MarkdownEditor, {
      props: {
        initialDoc: mockDoc
      }
    })

    const titleInput = wrapper.find('input#title')
    const contentTextarea = wrapper.find('textarea#content')

    expect((titleInput.element as HTMLInputElement).value).toBe('Test Doc')
    expect((contentTextarea.element as HTMLTextAreaElement).value).toBe('# Test Content')
  })

  it('devrait mettre à jour l\'aperçu en temps réel', async () => {
    const wrapper = mount(MarkdownEditor)
    const contentTextarea = wrapper.find('textarea#content')

    await contentTextarea.setValue('# Hello\n\nWorld')
    await nextTick()

    const preview = wrapper.find('.markdown-preview')
    expect(preview.html()).toContain('<h1')
    expect(preview.html()).toContain('Hello')
  })

  it('devrait avoir un bouton Enregistrer', () => {
    const wrapper = mount(MarkdownEditor)
    const saveButton = wrapper.find('.btn-save')
    expect(saveButton.exists()).toBe(true)
    expect(saveButton.text()).toContain('Enregistrer')
  })

  it('devrait avoir un bouton Annuler', () => {
    const wrapper = mount(MarkdownEditor)
    const cancelButton = wrapper.find('.btn-cancel')
    expect(cancelButton.exists()).toBe(true)
    expect(cancelButton.text()).toContain('Annuler')
  })

  it('devrait émettre save avec les données du document et les issues', async () => {
    const wrapper = mount(MarkdownEditor)

    await wrapper.find('input#title').setValue('New Title')
    await wrapper.find('textarea#content').setValue('# New Content')
    await nextTick()

    await wrapper.find('.btn-save').trigger('click')
    await nextTick()

    expect(wrapper.emitted('save')).toBeTruthy()
    const saveEvents = wrapper.emitted('save')
    if (saveEvents && saveEvents[0]) {
      const emittedData = saveEvents[0][0] as any
      const emittedIssueIds = saveEvents[0][1] as number[]
      expect(emittedData.title).toBe('New Title')
      expect(emittedData.content).toBe('# New Content')
      expect(Array.isArray(emittedIssueIds)).toBe(true)
    }
  })

  it('devrait émettre cancel lors du clic sur Annuler', async () => {
    const wrapper = mount(MarkdownEditor)

    await wrapper.find('.btn-cancel').trigger('click')
    await nextTick()

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('devrait rendre correctement le Markdown dans l\'aperçu', async () => {
    const wrapper = mount(MarkdownEditor)
    const markdown = '# Title\n\n**Bold** and *italic*\n\n- List item 1\n- List item 2'

    await wrapper.find('textarea#content').setValue(markdown)
    await nextTick()

    const preview = wrapper.find('.markdown-preview')
    expect(preview.html()).toContain('<h1')
    expect(preview.html()).toContain('<strong>')
    expect(preview.html()).toContain('<em>')
    expect(preview.html()).toContain('<ul>')
  })

  it('devrait mettre à jour les données lors du changement de prop', async () => {
    const wrapper = mount(MarkdownEditor, {
      props: {
        initialDoc: mockDoc
      }
    })

    const updatedDoc = {
      id: 1,
      title: 'Updated Title',
      content: '# Updated Content',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z'
    }

    await wrapper.setProps({ initialDoc: updatedDoc })
    await nextTick()

    const titleInput = wrapper.find('input#title')
    const contentTextarea = wrapper.find('textarea#content')

    expect((titleInput.element as HTMLInputElement).value).toBe('Updated Title')
    expect((contentTextarea.element as HTMLTextAreaElement).value).toBe('# Updated Content')
  })

  it('devrait afficher le layout en deux colonnes', () => {
    const wrapper = mount(MarkdownEditor)
    const layout = wrapper.find('.editor-layout')
    expect(layout.exists()).toBe(true)
    expect(layout.classes()).toContain('editor-layout')
  })

  it('devrait gérer les retours à la ligne dans le Markdown', async () => {
    const wrapper = mount(MarkdownEditor)
    const contentWithBreaks = 'Line 1\nLine 2\nLine 3'

    await wrapper.find('textarea#content').setValue(contentWithBreaks)
    await nextTick()

    const preview = wrapper.find('.markdown-preview')
    // Avec l'option breaks: true de marked, les retours à la ligne simples deviennent des <br>
    expect(preview.html()).toContain('<br>')
  })

  it('devrait afficher le composant IssueLinker', () => {
    const wrapper = mount(MarkdownEditor)
    const issueLinker = wrapper.findComponent(IssueLinker)
    expect(issueLinker.exists()).toBe(true)
  })

  it('devrait gérer la liaison d\'issues lors de la création', async () => {
    const wrapper = mount(MarkdownEditor, {
      props: {
        initialDoc: { title: '', content: '' }
      }
    })

    // Simuler la liaison d'une issue via IssueLinker
    const issueLinker = wrapper.findComponent(IssueLinker)
    await issueLinker.vm.$emit('link', 123)
    await nextTick()

    // Sauvegarder
    await wrapper.find('.btn-save').trigger('click')
    await nextTick()

    // Vérifier que l'issue ID est émis
    const saveEvents = wrapper.emitted('save')
    if (saveEvents && saveEvents[0]) {
      const emittedIssueIds = saveEvents[0][1] as number[]
      expect(emittedIssueIds).toContain(123)
    }
  })

  it('devrait gérer la suppression d\'issues en attente', async () => {
    const wrapper = mount(MarkdownEditor, {
      props: {
        initialDoc: { title: '', content: '' }
      }
    })

    // Lier une issue
    const issueLinker = wrapper.findComponent(IssueLinker)
    await issueLinker.vm.$emit('link', 123)
    await nextTick()

    // Délier l'issue
    await issueLinker.vm.$emit('unlink', 123)
    await nextTick()

    // Sauvegarder
    await wrapper.find('.btn-save').trigger('click')
    await nextTick()

    // Vérifier que l'issue ID n'est pas émis
    const saveEvents = wrapper.emitted('save')
    if (saveEvents && saveEvents[0]) {
      const emittedIssueIds = saveEvents[0][1] as number[]
      expect(emittedIssueIds).not.toContain(123)
    }
  })

  it('devrait ajouter une section markdown avec les issues liées', async () => {
    const wrapper = mount(MarkdownEditor, {
      props: {
        initialDoc: { id: 1, title: 'Test', content: '# Content' }
      }
    })

    // Attendre que le composant se charge complètement
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    // Lier une issue
    const issueLinker = wrapper.findComponent(IssueLinker)
    await issueLinker.vm.$emit('link', 123)
    
    // Attendre que les appels async se terminent
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    // Vérifier que le contenu contient la section issues
    const contentTextarea = wrapper.find('textarea#content')
    const content = (contentTextarea.element as HTMLTextAreaElement).value
    expect(content).toContain('## Issues Liées')
  })

  it('devrait mettre à jour la section markdown lors de la suppression d\'une issue', async () => {
    const wrapper = mount(MarkdownEditor, {
      props: {
        initialDoc: { title: 'Test', content: '# Content' }
      }
    })

    // Lier puis délier une issue
    const issueLinker = wrapper.findComponent(IssueLinker)
    await issueLinker.vm.$emit('link', 123)
    await nextTick()
    
    await issueLinker.vm.$emit('unlink', 123)
    await nextTick()

    // Vérifier que la section issues a été retirée
    const contentTextarea = wrapper.find('textarea#content')
    const content = (contentTextarea.element as HTMLTextAreaElement).value
    expect(content).not.toContain('## Issues Liées')
  })
})
