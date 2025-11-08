import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CreateProjectForm from '../projects/CreateProjectForm.vue'
import { projectStore } from '../../stores/projectStore'

// Mock du router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('CreateProjectForm', () => {
  beforeEach(() => {
   
    vi.clearAllMocks()
  
    // Mock projectStore.getUsers pour retourner la liste des utilisateurs
    vi.spyOn(projectStore, 'getUsers').mockResolvedValue([
      { email: 'user1@example.com', name: 'User One' },
      { email: 'user2@example.com', name: 'User Two' }
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
    // Mock projectStore.createProject pour simuler une réponse réussie
    const mockCreateProject = vi.spyOn(projectStore, 'createProject').mockResolvedValue({
      id: "1",
      name: 'Mon Projet Test'
    })

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet Test')
    await wrapper.find('textarea[name="description"]').setValue('Description du projet')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que projectStore.createProject a été appelé
    expect(mockCreateProject).toHaveBeenCalled()
  })

  it('devrait inclure les données du projet (name et description) dans l\'appel API', async () => {
    // Mock projectStore.createProject
    const mockCreateProject = vi.spyOn(projectStore, 'createProject').mockResolvedValue({
      id: "1",
      name: 'Mon Projet'
    })

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('textarea[name="description"]').setValue('Ma description')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que projectStore.createProject a été appelé avec les bonnes données
    expect(mockCreateProject).toHaveBeenCalledWith({
      name: 'Mon Projet',
      description: 'Ma description',
      collaborateurs: []
    })
  })

  it('devrait permettre de créer un projet avec une description vide', async () => {
    // Mock projectStore.createProject
    const mockCreateProject = vi.spyOn(projectStore, 'createProject').mockResolvedValue({
      id: "1",
      name: 'Projet Sans Description'
    })

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Projet Sans Description')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que projectStore.createProject a été appelé
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
    // Mock projectStore.createProject pour simuler une réponse réussie
    const mockCreateProject = vi.spyOn(projectStore, 'createProject').mockResolvedValue({
      id: "1",
      name: 'Mon Projet',
      description: '',
      collaborateurs: ['user1@example.com', 'user2@example.com']
    })

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('input[name="collaborateurs"]').setValue('user1@example.com, user2@example.com')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que projectStore.createProject a été appelé avec les collaborateurs
    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Mon Projet',
        collaborateurs: expect.arrayContaining(['user1@example.com', 'user2@example.com'])
      })
    )
  })

  it('devrait appeler projectStore.createProject lors de la soumission', async () => {
    // Mock projectStore.createProject pour simuler une réponse réussie
    const mockCreateProject = vi.spyOn(projectStore, 'createProject').mockResolvedValue({
      id: "1",
      name: 'Mon Projet'
    })

    const wrapper = mount(CreateProjectForm)
    
    await wrapper.find('input[name="projectName"]').setValue('Mon Projet')
    await wrapper.find('textarea[name="description"]').setValue('Ma description')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que projectStore.createProject a été appelé avec les bonnes données
    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Mon Projet',
        description: 'Ma description'
      })
    )
  })

  it('devrait afficher un message de succès après création', async () => {
    // Mock projectStore.createProject pour simuler une réponse réussie
    vi.spyOn(projectStore, 'createProject').mockResolvedValue({
      id: "1",
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
    // Mock projectStore.createProject pour simuler une erreur
    vi.spyOn(projectStore, 'createProject').mockRejectedValue(
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
    const projectId = "42"
    
    // Mock projectStore.createProject pour simuler une réponse réussie
    vi.spyOn(projectStore, 'createProject').mockResolvedValue({
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
