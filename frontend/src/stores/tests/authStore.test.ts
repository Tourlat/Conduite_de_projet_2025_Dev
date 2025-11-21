import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authStore } from '../authStore'
import authService from '../../services/authService'

vi.mock('../../services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    clearAuthData: vi.fn(),
    initializeToken: vi.fn()
  }
}))

vi.mock('../../utils/localStorage', () => ({
  getAuthToken: vi.fn(),
  getUserData: vi.fn()
}))

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    authStore.logout()
  })

  describe('init', () => {
    it('devrait initialiser le token', () => {
      authStore.init()
      expect(authService.initializeToken).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('devrait se connecter avec succès', async () => {
      const mockResponse = {
        id: 1,
        token: 'test-token',
        email: 'test@example.com',
        name: 'Test User'
      }

      vi.mocked(authService.login).mockResolvedValue(mockResponse)

      const result = await authStore.login('test@example.com', 'password123')

      expect(result).toEqual(mockResponse)
      expect(authStore.state.isAuthenticated).toBe(true)
      expect(authStore.state.token).toBe('test-token')
      expect(authStore.state.user).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      })
    })

    it('devrait gérer les erreurs de connexion', async () => {
      const mockError = new Error('Invalid credentials')
      vi.mocked(authService.login).mockRejectedValue(mockError)

      await expect(
        authStore.login('test@example.com', 'wrong')
      ).rejects.toThrow('Invalid credentials')

      expect(authStore.state.error).toBe('Invalid credentials')
      expect(authStore.state.isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('devrait enregistrer un utilisateur avec succès', async () => {
      const mockResponse = {
        id: 1,
        token: 'new-token',
        email: 'new@example.com',
        name: 'New User'
      }

      vi.mocked(authService.register).mockResolvedValue(mockResponse)

      const result = await authStore.register('new@example.com', 'password', 'New User')

      expect(result).toEqual(mockResponse)
      expect(authStore.state.isAuthenticated).toBe(true)
      expect(authStore.state.user?.email).toBe('new@example.com')
    })

    it('devrait gérer les erreurs d\'enregistrement', async () => {
      const mockError = new Error('Email already exists')
      vi.mocked(authService.register).mockRejectedValue(mockError)

      await expect(
        authStore.register('test@example.com', 'pass', 'Test')
      ).rejects.toThrow('Email already exists')

      expect(authStore.state.error).toBe('Email already exists')
    })
  })

  describe('logout', () => {
    it('devrait déconnecter l\'utilisateur', async () => {
      // Login first to set state
      const mockResponse = {
        id: 1,
        token: 'test-token',
        email: 'test@example.com',
        name: 'Test'
      }
      vi.mocked(authService.login).mockResolvedValue(mockResponse)
      await authStore.login('test@example.com', 'password')

      authStore.logout()

      expect(authStore.state.isAuthenticated).toBe(false)
      expect(authStore.state.token).toBeNull()
      expect(authStore.state.user).toBeNull()
      expect(authService.clearAuthData).toHaveBeenCalled()
    })
  })

  describe('setUser', () => {
    it('devrait mettre à jour l\'utilisateur', () => {
      const newUser = { id: 2, email: 'new@example.com', name: 'New User' }
      authStore.setUser(newUser)
      expect(authStore.state.user).toEqual(newUser)
    })
  })

  describe('isLoggedIn', () => {
    it('devrait retourner true si connecté', async () => {
      const mockResponse = {
        id: 1,
        token: 'test-token',
        email: 'test@example.com',
        name: 'Test'
      }

      vi.mocked(authService.login).mockResolvedValue(mockResponse)
      await authStore.login('test@example.com', 'password')

      expect(authStore.isLoggedIn()).toBe(true)
    })

    it('devrait retourner false si non connecté', () => {
      expect(authStore.isLoggedIn()).toBe(false)
    })
  })

  describe('getUser', () => {
    it('devrait retourner l\'utilisateur actuel', async () => {
      const mockResponse = {
        id: 1,
        token: 'test-token',
        email: 'test@example.com',
        name: 'Test User'
      }

      vi.mocked(authService.login).mockResolvedValue(mockResponse)
      await authStore.login('test@example.com', 'password')

      const user = authStore.getUser()
      expect(user).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      })
    })
  })

  describe('getToken', () => {
    it('devrait retourner le token actuel', async () => {
      const mockResponse = {
        id: 1,
        token: 'test-token',
        email: 'test@example.com',
        name: 'Test'
      }

      vi.mocked(authService.login).mockResolvedValue(mockResponse)
      await authStore.login('test@example.com', 'password')

      expect(authStore.getToken()).toBe('test-token')
    })
  })
})
