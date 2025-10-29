import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CreateProjectForm from '../CreateProjectForm.vue'
import { authStore } from '../../stores/authStore'

// Mock du router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('CreateProjectForm', () => {
  beforeEach(() => {
    // Reset authStore
    authStore.init()
    
    // Mock authStore.getToken pour retourner un token valide
    vi.spyOn(authStore, 'getToken').mockReturnValue('fake-token-123')
    
    // Mock authStore.getUsers pour retourner la liste des utilisateurs
    vi.spyOn(authStore, 'getUsers').mockResolvedValue([
      { email: 'user1@example.com', nom: 'User One' },
      { email: 'user2@example.com', nom: 'User Two' }
    ])
    
    vi.clearAllMocks()
  })

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
    // Mock authStore.createProject pour simuler une réponse réussie
    const mockCreateProject = vi.spyOn(authStore, 'createProject').mockResolvedValue({
      id: 1,
      name: 'Mon Projet Test'
    })

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet Test')
    await wrapper.find('textarea[name="description"]').setValue('Description du projet')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que authStore.createProject a été appelé
    expect(mockCreateProject).toHaveBeenCalled()
  })

  it('devrait inclure les données du projet (name et description) dans l\'appel API', async () => {
    // Mock authStore.createProject
    const mockCreateProject = vi.spyOn(authStore, 'createProject').mockResolvedValue({
      id: 1,
      name: 'Mon Projet'
    })

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('textarea[name="description"]').setValue('Ma description')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que authStore.createProject a été appelé avec les bonnes données
    expect(mockCreateProject).toHaveBeenCalledWith({
      name: 'Mon Projet',
      description: 'Ma description',
      collaborateurs: []
    })
  })

  it('devrait permettre de créer un projet avec une description vide', async () => {
    // Mock authStore.createProject
    const mockCreateProject = vi.spyOn(authStore, 'createProject').mockResolvedValue({
      id: 1,
      name: 'Projet Sans Description'
    })

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Projet Sans Description')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que authStore.createProject a été appelé
    expect(mockCreateProject).toHaveBeenCalledWith({
      name: 'Projet Sans Description',
      description: '',
      collaborateurs: []
    })
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
    // Mock authStore.createProject pour simuler une réponse réussie
    const mockCreateProject = vi.spyOn(authStore, 'createProject').mockResolvedValue({
      id: 1,
      name: 'Mon Projet',
      description: '',
      collaborateurs: ['user1@example.com', 'user2@example.com']
    })

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('input[name="collaborateurs"]').setValue('user1@example.com, user2@example.com')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que authStore.createProject a été appelé avec les collaborateurs
    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Mon Projet',
        collaborateurs: expect.arrayContaining(['user1@example.com', 'user2@example.com'])
      })
    )
  })

  it('devrait appeler authStore.createProject lors de la soumission', async () => {
    // Mock authStore.createProject pour simuler une réponse réussie
    const mockCreateProject = vi.spyOn(authStore, 'createProject').mockResolvedValue({
      id: 1,
      name: 'Mon Projet'
    })

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('textarea[name="description"]').setValue('Ma description')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que authStore.createProject a été appelé avec les bonnes données
    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Mon Projet',
        description: 'Ma description'
      })
    )
  })

  it('devrait afficher un message de succès après création', async () => {
    // Mock authStore.createProject pour simuler une réponse réussie
    vi.spyOn(authStore, 'createProject').mockResolvedValue({
      id: 1,
      name: 'Mon Projet'
    })

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que le message de succès est affiché
    expect(wrapper.text()).toMatch(/projet créé avec succès/i)
  })

  it('devrait afficher un message d\'erreur en cas d\'échec 400', async () => {
    // Mock authStore.createProject pour simuler une erreur
    vi.spyOn(authStore, 'createProject').mockRejectedValue(
      new Error('Données du projet invalides')
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
    
    // Mock authStore.createProject pour simuler une réponse réussie
    vi.spyOn(authStore, 'createProject').mockResolvedValue({
      id: projectId,
      name: 'Mon Projet'
    })

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
