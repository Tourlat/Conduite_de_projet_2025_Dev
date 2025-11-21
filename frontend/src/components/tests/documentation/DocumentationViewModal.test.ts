import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentationViewModal from '../../documentation/DocumentationViewModal.vue'

describe('DocumentationViewModal', () => {
  const mockDoc = {
    id: 1,
    title: 'API Documentation',
    content: '# API\n\n## Endpoints\n\n- GET /api/docs\n- POST /api/docs',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  }

  it('devrait afficher le modal avec overlay', () => {
    const wrapper = mount(DocumentationViewModal, {
      props: { doc: mockDoc }
    })

    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    expect(wrapper.find('.modal-content').exists()).toBe(true)
  })

  it('devrait afficher le titre du document', () => {
    const wrapper = mount(DocumentationViewModal, {
      props: { doc: mockDoc }
    })

    const title = wrapper.find('.modal-header h3')
    expect(title.text()).toBe('API Documentation')
  })

  it('devrait afficher le contenu Markdown rendu', () => {
    const wrapper = mount(DocumentationViewModal, {
      props: { doc: mockDoc }
    })

    const content = wrapper.find('.markdown-content')
    expect(content.exists()).toBe(true)
    expect(content.html()).toContain('<h1')
    expect(content.html()).toContain('API')
  })

  it('devrait avoir un bouton de fermeture', () => {
    const wrapper = mount(DocumentationViewModal, {
      props: { doc: mockDoc }
    })

    const closeButton = wrapper.find('.btn-close')
    expect(closeButton.exists()).toBe(true)
    expect(closeButton.text()).toBe('✕')
  })

  it('devrait émettre close lors du clic sur le bouton de fermeture', async () => {
    const wrapper = mount(DocumentationViewModal, {
      props: { doc: mockDoc }
    })

    await wrapper.find('.btn-close').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('devrait émettre close lors du clic sur l\'overlay', async () => {
    const wrapper = mount(DocumentationViewModal, {
      props: { doc: mockDoc }
    })

    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('ne devrait pas émettre close lors du clic sur le contenu du modal', async () => {
    const wrapper = mount(DocumentationViewModal, {
      props: { doc: mockDoc }
    })

    await wrapper.find('.modal-content').trigger('click')
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('devrait rendre les listes Markdown', () => {
    const wrapper = mount(DocumentationViewModal, {
      props: { doc: mockDoc }
    })

    const content = wrapper.find('.markdown-content')
    expect(content.html()).toContain('<ul>')
    expect(content.html()).toContain('<li>')
  })

  it('devrait afficher le header et body du modal', () => {
    const wrapper = mount(DocumentationViewModal, {
      props: { doc: mockDoc }
    })

    expect(wrapper.find('.modal-header').exists()).toBe(true)
    expect(wrapper.find('.modal-body').exists()).toBe(true)
  })
})
