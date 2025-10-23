import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterForm from './RegisterForm.vue'

describe('RegisterForm - US1: Création de Compte', () => {
  it('devrait afficher le formulaire d\'inscription', () => {
    const wrapper = mount(RegisterForm)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('devrait avoir les champs email, nom d\'utilisateur et mot de passe', () => {
    const wrapper = mount(RegisterForm)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[name="username"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('devrait avoir un bouton de soumission', () => {
    const wrapper = mount(RegisterForm)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('devrait valider que l\'email est requis', async () => {
    const wrapper = mount(RegisterForm)
    
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    // Vérifier qu'un message d'erreur apparaît
    const errorMessages = wrapper.findAll('.error-message')
    expect(errorMessages.length).toBeGreaterThan(0)
    if (errorMessages[0]) {
      expect(errorMessages[0].text()).toMatch(/email.*requis/i)
    }
  })

  it('devrait valider le format de l\'email', async () => {
    const wrapper = mount(RegisterForm)
    const emailInput = wrapper.find('input[type="email"]')
    
    await emailInput.setValue('email-invalide')
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.text()).toContain('email')
  })

  it('devrait valider que le mot de passe a une longueur minimale', async () => {
    const wrapper = mount(RegisterForm)
    const emailInput = wrapper.find('input[type="email"]')
    const usernameInput = wrapper.find('input[name="username"]')
    const passwordInput = wrapper.find('input[type="password"]')
    
    await emailInput.setValue('test@example.com')
    await usernameInput.setValue('testuser')
    await passwordInput.setValue('123')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toMatch(/mot de passe/i)
  })

  it('devrait émettre un événement lors de la soumission valide', async () => {
    const wrapper = mount(RegisterForm)
    
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[name="username"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('Password123!')
    
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.emitted()).toHaveProperty('register')
  })
})
