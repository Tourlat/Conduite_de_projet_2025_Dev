import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from './LoginForm.vue'

describe('LoginForm - US2: Connexion au Compte', () => {
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
    const submitButton = wrapper.find('button[type="submit"]')
    
    await submitButton.trigger('click')
    
    expect(wrapper.text()).toContain('requis')
  })

  it('devrait valider que le mot de passe est requis', async () => {
    const wrapper = mount(LoginForm)
    const emailInput = wrapper.find('input[type="email"]')
    
    await emailInput.setValue('test@example.com')
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.text()).toContain('mot de passe')
  })

  it('devrait émettre un événement lors de la soumission', async () => {
    const wrapper = mount(LoginForm)
    
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.emitted()).toHaveProperty('login')
  })

  it('devrait afficher un lien vers l\'inscription', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.text()).toContain('inscription')
  })
})
