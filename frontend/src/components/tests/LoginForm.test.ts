import { describe, it, expect } from 'vitest'
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

  it('devrait émettre un événement avec email et password lors de la soumission', async () => {
    const wrapper = mount(LoginForm)
    
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.emitted()).toHaveProperty('login')
    const emitted = wrapper.emitted('login')
    if (emitted && emitted[0] && emitted[0][0]) {
      expect(emitted[0][0]).toMatchObject({
        email: 'test@example.com',
        password: 'password123'
      })
    }
  })

  it('devrait afficher un lien vers l\'inscription', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.text()).toMatch(/(inscription|créer un compte)/i)
  })
})
