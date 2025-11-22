import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import authService, { getErrorMessage, addDatasInLocalStorage } from '../authService'
import * as localStorage from '../../utils/localStorage'

vi.mock('axios')
vi.mock('../../utils/localStorage', () => ({
  setUserData: vi.fn(),
  getAuthToken: vi.fn(),
  clearUserData: vi.fn()
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete axios.defaults.headers.common['Authorization']
  })

  describe('getErrorMessage', () => {
    it('devrait retourner le message pour EMAIL_ALREADY_EXISTS', () => {
      const message = getErrorMessage(409, 'EMAIL_ALREADY_EXISTS', 'default')
      expect(message).toBe('This email is already in use')
    })

    it('devrait retourner le message pour INVALID_CREDENTIALS', () => {
      const message = getErrorMessage(401, 'INVALID_CREDENTIALS', 'default')
      expect(message).toBe('Incorrect email or password')
    })

    it('devrait retourner le message par défaut si non trouvé', () => {
      const message = getErrorMessage(500, 'UNKNOWN_ERROR', 'default message')
      expect(message).toBe('default message')
    })
  })

  describe('addDatasInLocalStorage', () => {
    it('devrait appeler setUserData avec les bonnes données', () => {
      const data = {
        id: 1,
        token: 'test-token',
        email: 'test@example.com',
        name: 'Test User'
      }

      addDatasInLocalStorage(data)
      expect(localStorage.setUserData).toHaveBeenCalledWith(data)
    })
  })

  describe('login', () => {
    it('devrait se connecter avec succès', async () => {
      const mockResponse = {
        data: {
          id: 1,
          token: 'test-token',
          email: 'test@example.com',
          name: 'Test User'
        }
      }

      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result).toEqual(mockResponse.data)
      expect(localStorage.setUserData).toHaveBeenCalledWith(mockResponse.data)
      expect(axios.defaults.headers.common['Authorization']).toBe('Bearer test-token')
    })

    it('devrait lancer une erreur en cas d\'échec', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            error: 'INVALID_CREDENTIALS',
            message: 'Invalid credentials'
          }
        }
      }

      vi.mocked(axios.post).mockRejectedValue(mockError)

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('Incorrect email or password')
    })
  })

  describe('register', () => {
    it('devrait enregistrer un utilisateur avec succès', async () => {
      const mockResponse = {
        data: {
          id: 1,
          token: 'test-token',
          email: 'new@example.com',
          name: 'New User'
        }
      }

      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await authService.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      })

      expect(result).toEqual(mockResponse.data)
      expect(localStorage.setUserData).toHaveBeenCalledWith(mockResponse.data)
    })

    it('devrait lancer une erreur si email existe déjà', async () => {
      const mockError = {
        response: {
          status: 409,
          data: {
            error: 'EMAIL_ALREADY_EXISTS',
            message: 'Email already exists'
          }
        }
      }

      vi.mocked(axios.post).mockRejectedValue(mockError)

      await expect(
        authService.register({ email: 'test@example.com', password: 'pass', name: 'Test' })
      ).rejects.toThrow('This email is already in use')
    })
  })

  describe('token management', () => {
    it('devrait récupérer le token', () => {
      vi.mocked(localStorage.getAuthToken).mockReturnValue('stored-token')
      const token = authService.getToken()
      expect(token).toBe('stored-token')
    })

    it('devrait définir le token dans axios', () => {
      authService.setToken('new-token')
      expect(axios.defaults.headers.common['Authorization']).toBe('Bearer new-token')
    })

    it('devrait supprimer le token d\'axios', () => {
      axios.defaults.headers.common['Authorization'] = 'Bearer test'
      authService.removeToken()
      expect(axios.defaults.headers.common['Authorization']).toBeUndefined()
    })

    it('devrait initialiser le token au démarrage', () => {
      vi.mocked(localStorage.getAuthToken).mockReturnValue('init-token')
      authService.initializeToken()
      expect(axios.defaults.headers.common['Authorization']).toBe('Bearer init-token')
    })
  })

  describe('clearAuthData', () => {
    it('devrait effacer toutes les données d\'authentification', () => {
      axios.defaults.headers.common['Authorization'] = 'Bearer test'
      authService.clearAuthData()
      
      expect(localStorage.clearUserData).toHaveBeenCalled()
      expect(axios.defaults.headers.common['Authorization']).toBeUndefined()
    })
  })
})
