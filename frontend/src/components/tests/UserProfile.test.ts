import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import UserProfile from '../pages/UserProfile.vue'
import userService from '../../services/userService'

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('UserProfile', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should display an error message if user is not authenticated', async () => {
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    expect(wrapper.text()).toContain('Utilisateur non identifié')
  })


  it('should display both forms (personal info and password change)', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    expect(wrapper.text()).toContain('Mes Informations')
    expect(wrapper.text()).toContain('Changer le Mot de Passe')
  })

  it('should have required fields for personal information', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(5)
    
    const nameInput = wrapper.find('input[type="text"]')
    expect(nameInput.exists()).toBe(true)
    
    const emailInput = wrapper.find('input[type="email"]')
    expect(emailInput.exists()).toBe(true)
  })

  it('should have required fields for password change', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    const passwordInputs = wrapper.findAll('input[type="password"]')
    expect(passwordInputs.length).toBe(3)
  })

  it('should display an error message if loading user data fails', async () => {
    localStorage.setItem('userId', '1')
    
    const errorMessage = 'Erreur lors de la récupération des données'
    vi.spyOn(userService, 'getUser').mockRejectedValueOnce(new Error(errorMessage))
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    expect(wrapper.text()).toContain(errorMessage)
  })

  it('should update user information successfully', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    const updatedUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Jane Doe'
    }
    
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    vi.spyOn(userService, 'updateUser').mockResolvedValueOnce(updatedUser)
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    const nameInput = wrapper.find('input[type="text"]')
    await nameInput.setValue('Jane Doe')
    
    const buttons = wrapper.findAll('button')
    if (buttons[0]) {
      await buttons[0].trigger('click')
      await flushPromises()
    }
    
    expect(userService.updateUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Jane Doe'
    })
    
    expect(wrapper.text()).toContain('Vos informations ont été mises à jour avec succès')
  })

  it('should display an error message if user update fails', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    const errorMessage = 'Erreur lors de la mise à jour'
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    vi.spyOn(userService, 'updateUser').mockRejectedValueOnce(new Error(errorMessage))
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    const nameInput = wrapper.find('input[type="text"]')
    await nameInput.setValue('Jane Doe')
    
    const buttons = wrapper.findAll('button')
    if (buttons[0]) {
      await buttons[0].trigger('click')
      await flushPromises()
    }
    
    expect(wrapper.text()).toContain(errorMessage)
  })

  it('should validate that passwords match', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    vi.spyOn(userService, 'changePassword')
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    const inputs = wrapper.findAll('input[type="password"]')
    if (inputs[0] && inputs[1] && inputs[2]) {
      await inputs[0].setValue('oldpassword123')
      await inputs[1].setValue('newpassword123')
      await inputs[2].setValue('differentpassword')
    }
    
    const buttons = wrapper.findAll('button')
    if (buttons[1]) {
      await buttons[1].trigger('click')
      await flushPromises()
    }
    
    expect(wrapper.text()).toContain('Les mots de passe ne correspondent pas')
    expect(userService.changePassword).not.toHaveBeenCalled()
  })

  it('should validate minimum password length (8 characters)', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    vi.spyOn(userService, 'changePassword')
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    const inputs = wrapper.findAll('input[type="password"]')
    if (inputs[0] && inputs[1] && inputs[2]) {
      await inputs[0].setValue('oldpassword123')
      await inputs[1].setValue('short')
      await inputs[2].setValue('short')
    }
    
    const buttons = wrapper.findAll('button')
    if (buttons[1]) {
      await buttons[1].trigger('click')
      await flushPromises()
    }
    
    expect(wrapper.text()).toContain('Le nouveau mot de passe doit contenir au moins 8 caractères')
    expect(userService.changePassword).not.toHaveBeenCalled()
  })

  it('should change password successfully', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    vi.spyOn(userService, 'changePassword').mockResolvedValueOnce(undefined)
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    const inputs = wrapper.findAll('input[type="password"]')
    if (inputs[0] && inputs[1] && inputs[2]) {
      await inputs[0].setValue('oldpassword123')
      await inputs[1].setValue('newpassword123')
      await inputs[2].setValue('newpassword123')
    }
    
    const buttons = wrapper.findAll('button')
    if (buttons[1]) {
      await buttons[1].trigger('click')
      await flushPromises()
    }
    
    expect(userService.changePassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      currentPassword: 'oldpassword123',
      newPassword: 'newpassword123'
    })
    
    expect(wrapper.text()).toContain('Votre mot de passe a été changé avec succès')
  })

  it('should display an error message if password change fails', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    const errorMessage = 'Mot de passe actuel incorrect'
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    vi.spyOn(userService, 'changePassword').mockRejectedValueOnce(new Error(errorMessage))
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    const inputs = wrapper.findAll('input[type="password"]')
    if (inputs[0] && inputs[1] && inputs[2]) {
      await inputs[0].setValue('wrongpassword')
      await inputs[1].setValue('newpassword123')
      await inputs[2].setValue('newpassword123')
    }
    
    const buttons = wrapper.findAll('button')
    if (buttons[1]) {
      await buttons[1].trigger('click')
      await flushPromises()
    }
    
    expect(wrapper.text()).toContain(errorMessage)
  })

  it('should update localStorage with new name', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    const updatedUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Jane Doe'
    }
    
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    vi.spyOn(userService, 'updateUser').mockResolvedValueOnce(updatedUser)
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    const nameInput = wrapper.find('input[type="text"]')
    await nameInput.setValue('Jane Doe')
    
    const buttons = wrapper.findAll('button')
    if (buttons[0]) {
      await buttons[0].trigger('click')
      await flushPromises()
    }
    
    expect(localStorage.getItem('userName')).toBe('Jane Doe')
  })

  it('should clear password fields after successful password change', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    vi.spyOn(userService, 'changePassword').mockResolvedValueOnce(undefined)
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    const inputs = wrapper.findAll('input[type="password"]')
    if (inputs[0] && inputs[1] && inputs[2]) {
      await inputs[0].setValue('oldpassword123')
      await inputs[1].setValue('newpassword123')
      await inputs[2].setValue('newpassword123')
      
      const buttons = wrapper.findAll('button')
      if (buttons[1]) {
        await buttons[1].trigger('click')
        await flushPromises()
      }
      
      expect((inputs[0].element as HTMLInputElement).value).toBe('')
      expect((inputs[1].element as HTMLInputElement).value).toBe('')
      expect((inputs[2].element as HTMLInputElement).value).toBe('')
    }
  })

  it('should disable update button while updating', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    vi.spyOn(userService, 'updateUser').mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
    )
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    const buttons = wrapper.findAll('button')
    const updateButton = buttons[0]
    
    if (updateButton) {
      expect(updateButton.attributes('disabled')).toBeFalsy()
      
      updateButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(updateButton.attributes('disabled')).toBeDefined()
    }
  })

  it('should disable password button while changing password', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    vi.spyOn(userService, 'changePassword').mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(), 100))
    )
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    const inputs = wrapper.findAll('input[type="password"]')
    if (inputs[0] && inputs[1] && inputs[2]) {
      await inputs[0].setValue('oldpassword123')
      await inputs[1].setValue('newpassword123')
      await inputs[2].setValue('newpassword123')
      
      const buttons = wrapper.findAll('button')
      const passwordButton = buttons[1]
      
      if (passwordButton) {
        expect(passwordButton.attributes('disabled')).toBeFalsy()
        
        passwordButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        expect(passwordButton.attributes('disabled')).toBeDefined()
      }
    }
  })

  it('should display all required labels', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    expect(wrapper.text()).toContain('Nom')
    expect(wrapper.text()).toContain('Email')
    expect(wrapper.text()).toContain('Mot de passe actuel')
    expect(wrapper.text()).toContain('Nouveau mot de passe')
    expect(wrapper.text()).toContain('Confirmer le mot de passe')
  })

  it('should display message explaining that email cannot be modified', async () => {
    localStorage.setItem('userId', '1')
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe'
    }
    
    vi.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser)
    
    const wrapper = mount(UserProfile)
    await flushPromises()
    
    expect(wrapper.text()).toContain('L\'email ne peut pas être modifié')
  })
})
