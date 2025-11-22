import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentationDeleteModal from '../../documentation/DocumentationDeleteModal.vue'

describe('DocumentationDeleteModal', () => {
  const mockDoc = {
    id: 1,
    title: 'Document à supprimer',
    content: '# Content',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  }

  it('devrait afficher le modal avec overlay', () => {
    const wrapper = mount(DocumentationDeleteModal, {
      props: { doc: mockDoc }
    })

    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    expect(wrapper.find('.delete-modal').exists()).toBe(true)
  })

  it('devrait afficher le titre de confirmation', () => {
    const wrapper = mount(DocumentationDeleteModal, {
      props: { doc: mockDoc }
    })

    expect(wrapper.text()).toContain('Supprimer la documentation')
  })

  it('devrait afficher le nom du document', () => {
    const wrapper = mount(DocumentationDeleteModal, {
      props: { doc: mockDoc }
    })

    expect(wrapper.text()).toContain('Document à supprimer')
  })

  it('devrait afficher un message d\'avertissement', () => {
    const wrapper = mount(DocumentationDeleteModal, {
      props: { doc: mockDoc }
    })

    expect(wrapper.find('.warning-text').exists()).toBe(true)
    expect(wrapper.text()).toContain('irréversible')
  })

  it('devrait avoir un bouton Annuler', () => {
    const wrapper = mount(DocumentationDeleteModal, {
      props: { doc: mockDoc }
    })

    const cancelButton = wrapper.find('.btn-cancel-delete')
    expect(cancelButton.exists()).toBe(true)
    expect(cancelButton.text()).toContain('Annuler')
  })

  it('devrait avoir un bouton Supprimer', () => {
    const wrapper = mount(DocumentationDeleteModal, {
      props: { doc: mockDoc }
    })

    const confirmButton = wrapper.find('.btn-confirm-delete')
    expect(confirmButton.exists()).toBe(true)
    expect(confirmButton.text()).toContain('Supprimer')
  })

  it('devrait émettre confirm lors du clic sur Supprimer', async () => {
    const wrapper = mount(DocumentationDeleteModal, {
      props: { doc: mockDoc }
    })

    await wrapper.find('.btn-confirm-delete').trigger('click')
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('devrait émettre cancel lors du clic sur Annuler', async () => {
    const wrapper = mount(DocumentationDeleteModal, {
      props: { doc: mockDoc }
    })

    await wrapper.find('.btn-cancel-delete').trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('devrait émettre cancel lors du clic sur l\'overlay', async () => {
    const wrapper = mount(DocumentationDeleteModal, {
      props: { doc: mockDoc }
    })

    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('ne devrait pas émettre cancel lors du clic sur le contenu du modal', async () => {
    const wrapper = mount(DocumentationDeleteModal, {
      props: { doc: mockDoc }
    })

    await wrapper.find('.delete-modal').trigger('click')
    expect(wrapper.emitted('cancel')).toBeFalsy()
  })

  it('devrait afficher les boutons d\'action', () => {
    const wrapper = mount(DocumentationDeleteModal, {
      props: { doc: mockDoc }
    })

    expect(wrapper.find('.delete-actions').exists()).toBe(true)
  })
})
