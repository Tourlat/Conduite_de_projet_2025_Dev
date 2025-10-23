import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterForm from '../auth/RegisterForm.vue'

describe('RegisterForm - US1: Création de Compte (T1.4)', () => {
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

  it('devrait émettre un événement lors de la soumission valide sans confirmPassword', async () => {
    const wrapper = mount(RegisterForm)
    
    await wrapper.find('input[name="nom"]').setValue('John Doe')
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('Password123!')
    await wrapper.find('input[name="confirmPassword"]').setValue('Password123!')
    
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.emitted()).toHaveProperty('register')
    const emitted = wrapper.emitted('register')
    if (emitted && emitted[0] && emitted[0][0]) {
      expect(emitted[0][0]).toMatchObject({
        nom: 'John Doe',
        email: 'test@example.com',
        password: 'Password123!'
      })
      // Ne devrait PAS contenir confirmPassword
      expect(emitted[0][0]).not.toHaveProperty('confirmPassword')
    }
  })
})
