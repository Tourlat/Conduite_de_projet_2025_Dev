import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '../auth/LoginForm.vue'

describe('LoginForm - US2: Connexion au Compte (T2.3)', () => {
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

  it('devrait appeler l\'API et gérer la connexion lors de la soumission', async () => {
    // Mock fetch pour simuler une réponse réussie
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'fake-jwt-token', user: { id: 1, email: 'test@example.com' } })
      } as Response)
    )

    const wrapper = mount(LoginForm)
    
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que fetch a été appelé avec les bonnes données
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      })
    )
  })

  it('devrait afficher un lien vers l\'inscription', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.text()).toMatch(/(inscription|créer un compte)/i)
  })

  it('devrait afficher un message d\'erreur clair en cas d\'échec 401', async () => {
    // Mock fetch pour simuler une erreur 401
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      } as Response)
    )

    const wrapper = mount(LoginForm)
    
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('wrongpassword')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que le message d'erreur est affiché
    expect(wrapper.text()).toMatch(/email ou mot de passe incorrect/i)
  })

  it('devrait stocker le token JWT dans localStorage en cas de succès', async () => {
    const mockToken = 'fake-jwt-token-12345'
    
    // Mock localStorage
    const localStorageMock = {
      setItem: vi.fn(),
      getItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    // Mock fetch pour simuler une réponse réussie
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: mockToken, user: { id: 1, email: 'test@example.com' } })
      } as Response)
    )

    const wrapper = mount(LoginForm)
    
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que le token a été stocké dans localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken)
  })

  it('devrait émettre loginSuccess avec le token en cas de succès', async () => {
    const mockToken = 'fake-jwt-token-12345'
    
    // Mock fetch pour simuler une réponse réussie
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: mockToken, user: { id: 1, email: 'test@example.com' } })
      } as Response)
    )

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
