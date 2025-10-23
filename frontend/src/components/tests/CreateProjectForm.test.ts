import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CreateProjectForm from '../CreateProjectForm.vue'

describe('CreateProjectForm - US4: Création de Projet (T4.3)', () => {
  it('devrait afficher le formulaire de création de projet', () => {
    const wrapper = mount(CreateProjectForm)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('devrait avoir un champ pour le nom du projet (requis)', () => {
    const wrapper = mount(CreateProjectForm)
    expect(wrapper.find('input[name="projectName"]').exists()).toBe(true)
  })

  it('devrait avoir un champ pour la description (optionnel)', () => {
    const wrapper = mount(CreateProjectForm)
    expect(wrapper.find('textarea[name="description"]').exists()).toBe(true)
  })

  it('devrait avoir un bouton de création', () => {
    const wrapper = mount(CreateProjectForm)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('devrait valider que le nom du projet est requis', async () => {
    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    const errorMessages = wrapper.findAll('.error-message')
    expect(errorMessages.length).toBeGreaterThan(0)
    if (errorMessages[0]) {
      expect(errorMessages[0].text()).toMatch(/nom.*requis/i)
    }
  })

  it('devrait valider la longueur minimale du nom (3 caractères)', async () => {
    const wrapper = mount(CreateProjectForm)
    const nameInput = wrapper.find('input[name="projectName"]')
    
    await nameInput.setValue('ab')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toMatch(/caractères/i)
  })

  it('devrait émettre un événement lors de la soumission valide avec nom et description', async () => {
    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet Test')
    await wrapper.find('textarea[name="description"]').setValue('Description du projet')
    
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.emitted()).toHaveProperty('createProject')
  })

  it('devrait inclure les données du projet (name et description) dans l\'événement émis', async () => {
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

  it('devrait permettre de créer un projet avec une description vide', async () => {
    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Projet Sans Description')
    
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.emitted()).toHaveProperty('createProject')
    const emittedEvent = wrapper.emitted('createProject')
    if (emittedEvent && emittedEvent[0] && emittedEvent[0][0]) {
      expect(emittedEvent[0][0]).toMatchObject({
        name: 'Projet Sans Description',
        description: ''
      })
    }
  })
})
