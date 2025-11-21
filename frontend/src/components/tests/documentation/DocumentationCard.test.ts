import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentationCard from '../../documentation/DocumentationCard.vue'

describe('DocumentationCard', () => {
  const mockDoc = {
    id: 1,
    title: 'Getting Started',
    content: '# Welcome\n\nThis is the documentation.',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  }

  it('devrait afficher le titre du document', () => {
    const wrapper = mount(DocumentationCard, {
      props: { doc: mockDoc }
    })

    expect(wrapper.text()).toContain('Getting Started')
  })

  it('devrait afficher la date de création', () => {
    const wrapper = mount(DocumentationCard, {
      props: { doc: mockDoc }
    })

    const dateText = wrapper.find('.doc-date').text()
    expect(dateText).toBeTruthy()
  })

  it('devrait être cliquable pour voir le document', () => {
    const wrapper = mount(DocumentationCard, {
      props: { doc: mockDoc }
    })

    const content = wrapper.find('.doc-content')
    expect(content.exists()).toBe(true)
  })

  it('devrait avoir un bouton Modifier', () => {
    const wrapper = mount(DocumentationCard, {
      props: { doc: mockDoc }
    })

    const editButton = wrapper.find('.btn-edit')
    expect(editButton.exists()).toBe(true)
    expect(editButton.text()).toContain('Modifier')
  })

  it('devrait avoir un bouton Supprimer', () => {
    const wrapper = mount(DocumentationCard, {
      props: { doc: mockDoc }
    })

    const deleteButton = wrapper.find('.btn-delete')
    expect(deleteButton.exists()).toBe(true)
    expect(deleteButton.text()).toContain('Supprimer')
  })

  it('devrait émettre view lors du clic sur le contenu', async () => {
    const wrapper = mount(DocumentationCard, {
      props: { doc: mockDoc }
    })

    await wrapper.find('.doc-content').trigger('click')
    expect(wrapper.emitted('view')).toBeTruthy()
  })

  it('devrait émettre edit lors du clic sur Modifier', async () => {
    const wrapper = mount(DocumentationCard, {
      props: { doc: mockDoc }
    })

    await wrapper.find('.btn-edit').trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
  })

  it('devrait émettre delete lors du clic sur Supprimer', async () => {
    const wrapper = mount(DocumentationCard, {
      props: { doc: mockDoc }
    })

    await wrapper.find('.btn-delete').trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  it('devrait afficher la carte avec les bonnes classes CSS', () => {
    const wrapper = mount(DocumentationCard, {
      props: { doc: mockDoc }
    })

    expect(wrapper.find('.doc-card').exists()).toBe(true)
    expect(wrapper.find('.doc-content').exists()).toBe(true)
    expect(wrapper.find('.doc-actions').exists()).toBe(true)
  })
})
