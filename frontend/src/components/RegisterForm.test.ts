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
    const submitButton = wrapper.find('button[type="submit"]')
    
    await submitButton.trigger('click')
    
    // Vérifier qu'un message d'erreur apparaît
    expect(wrapper.text()).toContain('requis')
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
    const passwordInput = wrapper.find('input[type="password"]')
    
    await passwordInput.setValue('123')
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.text()).toContain('mot de passe')
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
