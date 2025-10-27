import { describe, it, expect, vi } from 'vitest'
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
    // Mock fetch pour simuler une réponse réussie
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'Mon Projet Test' })
      } as Response)
    )

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet Test')
    await wrapper.find('textarea[name="description"]').setValue('Description du projet')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que fetch a été appelé
    expect(globalThis.fetch).toHaveBeenCalled()
  })

  it('devrait inclure les données du projet (name et description) dans l\'appel API', async () => {
    // Mock fetch pour simuler une réponse réussie
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'Mon Projet' })
      } as Response)
    )

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('textarea[name="description"]').setValue('Ma description')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que les données sont bien envoyées
    const callArgs = (globalThis.fetch as any).mock.calls[0]
    const body = JSON.parse(callArgs[1].body)
    expect(body).toMatchObject({
      name: 'Mon Projet',
      description: 'Ma description'
    })
  })

  it('devrait permettre de créer un projet avec une description vide', async () => {
    // Mock fetch pour simuler une réponse réussie
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'Projet Sans Description' })
      } as Response)
    )

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Projet Sans Description')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que fetch a été appelé même sans description
    expect(globalThis.fetch).toHaveBeenCalled()
    const callArgs = (globalThis.fetch as any).mock.calls[0]
    const body = JSON.parse(callArgs[1].body)
    expect(body.name).toBe('Projet Sans Description')
    expect(body.description).toBe('')
  })

  it('devrait avoir un champ pour les collaborateurs', () => {
    const wrapper = mount(CreateProjectForm)
    expect(wrapper.find('input[name="collaborateurs"]').exists()).toBe(true)
  })

  it('devrait valider le format des emails des collaborateurs', async () => {
    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('input[name="collaborateurs"]').setValue('invalid-email')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toMatch(/email invalide/i)
  })

  it('devrait accepter plusieurs emails séparés par des virgules', async () => {
    // Mock fetch pour simuler une réponse réussie
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'Mon Projet' })
      } as Response)
    )

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('input[name="collaborateurs"]').setValue('user1@example.com, user2@example.com')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que fetch a été appelé avec les collaborateurs
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/projets',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('user1@example.com')
      })
    )
  })

  it('devrait appeler l\'API POST /api/projets lors de la soumission', async () => {
    // Mock fetch pour simuler une réponse réussie
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'Mon Projet' })
      } as Response)
    )

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('textarea[name="description"]').setValue('Ma description')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que fetch a été appelé avec les bonnes données
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/projets',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    )
  })

  it('devrait afficher un message de succès après création', async () => {
    // Mock fetch pour simuler une réponse réussie
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'Mon Projet' })
      } as Response)
    )

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que le message de succès est affiché
    expect(wrapper.text()).toMatch(/projet créé avec succès/i)
  })

  it('devrait afficher un message d\'erreur en cas d\'échec 400', async () => {
    // Mock fetch pour simuler une erreur 400
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Données invalides' })
      } as Response)
    )

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que le message d'erreur est affiché
    expect(wrapper.text()).toMatch(/données (invalides|du projet invalides)/i)
  })

  it('devrait émettre projectCreated avec l\'ID du projet en cas de succès', async () => {
    const projectId = 42
    
    // Mock fetch pour simuler une réponse réussie
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: projectId, name: 'Mon Projet' })
      } as Response)
    )

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que l'événement projectCreated a été émis avec l'ID
    expect(wrapper.emitted()).toHaveProperty('projectCreated')
    const emitted = wrapper.emitted('projectCreated')
    if (emitted && emitted[0]) {
      expect(emitted[0][0]).toBe(projectId)
    }
  })
})
