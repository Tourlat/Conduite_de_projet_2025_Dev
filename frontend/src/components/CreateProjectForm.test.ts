import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CreateProjectForm from './CreateProjectForm.vue'

describe('CreateProjectForm - US4: Création de Projet', () => {
  it('devrait afficher le formulaire de création de projet', () => {
    const wrapper = mount(CreateProjectForm)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('devrait avoir un champ pour le nom du projet', () => {
    const wrapper = mount(CreateProjectForm)
    expect(wrapper.find('input[name="projectName"]').exists()).toBe(true)
  })

  it('devrait avoir un champ pour la description', () => {
    const wrapper = mount(CreateProjectForm)
    expect(wrapper.find('textarea[name="description"]').exists()).toBe(true)
  })

  it('devrait avoir un bouton de création', () => {
    const wrapper = mount(CreateProjectForm)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('devrait valider que le nom du projet est requis', async () => {
    const wrapper = mount(CreateProjectForm)
    const submitButton = wrapper.find('button[type="submit"]')
    
    await submitButton.trigger('click')
    
    expect(wrapper.text()).toContain('requis')
  })

  it('devrait valider la longueur minimale du nom', async () => {
    const wrapper = mount(CreateProjectForm)
    const nameInput = wrapper.find('input[name="projectName"]')
    
    await nameInput.setValue('ab')
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.text()).toContain('caractères')
  })

  it('devrait émettre un événement lors de la soumission valide', async () => {
    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet Test')
    await wrapper.find('textarea[name="description"]').setValue('Description du projet')
    
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.emitted()).toHaveProperty('createProject')
  })

  it('devrait inclure les données du projet dans l\'événement émis', async () => {
    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('textarea[name="description"]').setValue('Ma description')
    
    await wrapper.find('form').trigger('submit')
    
    const emittedEvent = wrapper.emitted('createProject')
    expect(emittedEvent).toBeTruthy()
    if (emittedEvent && emittedEvent[0] && emittedEvent[0][0]) {
      expect(emittedEvent[0][0]).toMatchObject({
        name: 'Mon Projet',
        description: 'Ma description'
      })
    }
  })
})
