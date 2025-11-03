import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '../auth/LoginForm.vue'
import authStore from '../../stores/authStore'

// Mock du router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('LoginForm', () => {
  beforeEach(() => {
    // Reset authStore avant chaque test
    authStore.init()
    vi.clearAllMocks()
  })
  it('devrait afficher le formulaire de connexion', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('devrait avoir les champs email et mot de passe', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('devrait avoir un bouton de connexion', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('devrait valider que l\'email est requis', async () => {
    const wrapper = mount(LoginForm)
    
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    const errorMessages = wrapper.findAll('.error-message')
    expect(errorMessages.length).toBeGreaterThan(0)
    if (errorMessages[0]) {
      expect(errorMessages[0].text()).toMatch(/email.*requis/i)
    }
  })

  it('devrait valider que le mot de passe est requis', async () => {
    const wrapper = mount(LoginForm)
    const emailInput = wrapper.find('input[type="email"]')
    
    await emailInput.setValue('test@example.com')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toMatch(/mot de passe/i)
  })

  it('devrait appeler authStore.login et gérer la connexion lors de la soumission', async () => {
    // Mock authStore.login pour simuler une réponse réussie
    const mockLogin = vi.spyOn(authStore, 'login').mockResolvedValue({
      id: 1,
      token: 'fake-jwt-token',
      email: 'test@example.com',
      name: 'Test User'
    })

    const wrapper = mount(LoginForm)
    
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que authStore.login a été appelé avec les bonnes données
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('devrait afficher un lien vers l\'inscription', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.text()).toMatch(/(inscription|créer un compte)/i)
  })

  it('devrait afficher un message d\'erreur clair en cas d\'échec 401', async () => {
    // Mock authStore.login pour simuler une erreur 401
    vi.spyOn(authStore, 'login').mockRejectedValue({
      message: 'Email ou mot de passe incorrect'
    })

    const wrapper = mount(LoginForm)
    
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('wrongpassword')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que le message d'erreur est affiché
    expect(wrapper.text()).toMatch(/email ou mot de passe incorrect/i)
  })

  it('devrait appeler authStore.login avec les bonnes données en cas de succès', async () => {
    const mockToken = 'fake-jwt-token-12345'
    
    // Mock authStore.login pour simuler une réponse réussie
    const mockLogin = vi.spyOn(authStore, 'login').mockResolvedValue({
      id: 1,
      token: mockToken,
      email: 'test@example.com',
      name: 'Test User'
    })

    const wrapper = mount(LoginForm)
    
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que authStore.login a été appelé avec les bonnes données
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    expect(mockLogin).toHaveBeenCalledTimes(1)
  })

  it('devrait émettre loginSuccess avec le token en cas de succès', async () => {
    const mockToken = 'fake-jwt-token-12345'
    
    // Mock authStore.login pour simuler une réponse réussie
    vi.spyOn(authStore, 'login').mockResolvedValue({
      id: 1,
      token: mockToken,
      email: 'test@example.com',
      name: 'Test User'
    })

    const wrapper = mount(LoginForm)
    
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que l'événement loginSuccess a été émis avec le token
    expect(wrapper.emitted()).toHaveProperty('loginSuccess')
    const emitted = wrapper.emitted('loginSuccess')
    if (emitted && emitted[0]) {
      expect(emitted[0][0]).toBe(mockToken)
    }
  })
})
