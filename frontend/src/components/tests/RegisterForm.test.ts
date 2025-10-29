import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterForm from '../auth/RegisterForm.vue'
import authStore from '../../stores/authStore'

// Mock du router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    // Reset authStore avant chaque test
    authStore.init()
    vi.clearAllMocks()
  })
  it('devrait afficher le formulaire d\'inscription', () => {
    const wrapper = mount(RegisterForm)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('devrait avoir les champs nom, email, mot de passe et confirmation', () => {
    const wrapper = mount(RegisterForm)
    expect(wrapper.find('input[name="nom"]').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[name="password"]').exists()).toBe(true)
    expect(wrapper.find('input[name="confirmPassword"]').exists()).toBe(true)
  })

  it('devrait avoir un bouton de soumission', () => {
    const wrapper = mount(RegisterForm)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('devrait valider que le nom est requis', async () => {
    const wrapper = mount(RegisterForm)
    
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    const errorMessages = wrapper.findAll('.error-message')
    expect(errorMessages.length).toBeGreaterThan(0)
    if (errorMessages[0]) {
      expect(errorMessages[0].text()).toMatch(/nom.*requis/i)
    }
  })

  it('devrait valider que l\'email est requis', async () => {
    const wrapper = mount(RegisterForm)
    
    await wrapper.find('input[name="nom"]').setValue('John Doe')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    const errorMessages = wrapper.findAll('.error-message')
    expect(errorMessages.length).toBeGreaterThan(0)
    if (errorMessages[0]) {
      expect(errorMessages[0].text()).toMatch(/email.*requis/i)
    }
  })

  it('devrait valider le format de l\'email', async () => {
    const wrapper = mount(RegisterForm)
    const emailInput = wrapper.find('input[type="email"]')
    
    await wrapper.find('input[name="nom"]').setValue('John Doe')
    await emailInput.setValue('email-invalide')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toMatch(/email/i)
  })

  it('devrait valider que le mot de passe a une longueur minimale', async () => {
    const wrapper = mount(RegisterForm)
    
    await wrapper.find('input[name="nom"]').setValue('John Doe')
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('123')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toMatch(/mot de passe/i)
  })

  it('devrait valider que les mots de passe correspondent', async () => {
    const wrapper = mount(RegisterForm)
    
    await wrapper.find('input[name="nom"]').setValue('John Doe')
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('Password123!')
    await wrapper.find('input[name="confirmPassword"]').setValue('DifferentPassword')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toMatch(/ne correspondent pas/i)
  })

  it('devrait appeler authStore.register lors de la soumission valide', async () => {
    // Mock authStore.register pour simuler une réponse réussie
    const mockRegister = vi.spyOn(authStore, 'register').mockResolvedValue({
      token: 'fake-jwt-token',
      email: 'test@example.com',
      name: 'John Doe'
    })

    const wrapper = mount(RegisterForm)
    
    await wrapper.find('input[name="nom"]').setValue('John Doe')
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('Password123!')
    await wrapper.find('input[name="confirmPassword"]').setValue('Password123!')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que authStore.register a été appelé avec les bonnes données (sans confirmPassword)
    expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'Password123!', 'John Doe')
    expect(mockRegister).toHaveBeenCalledTimes(1)
  })
})
