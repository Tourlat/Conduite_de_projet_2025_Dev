import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterForm from '../auth/RegisterForm.vue'

describe('RegisterForm', () => {
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

  it('devrait appeler l\'API lors de la soumission valide sans confirmPassword', async () => {
    // Mock fetch pour simuler une réponse réussie
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, nom: 'John Doe', email: 'test@example.com' })
      } as Response)
    )

    const wrapper = mount(RegisterForm)
    
    await wrapper.find('input[name="nom"]').setValue('John Doe')
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('Password123!')
    await wrapper.find('input[name="confirmPassword"]').setValue('Password123!')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Vérifie que fetch a été appelé avec les bonnes données (sans confirmPassword)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/register',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: 'John Doe', email: 'test@example.com', password: 'Password123!' })
      })
    )
    
    // Vérifie que confirmPassword n'est PAS dans le body
    const callArgs = (globalThis.fetch as any).mock.calls[0]
    const body = JSON.parse(callArgs[1].body)
    expect(body).not.toHaveProperty('confirmPassword')
  })
})
