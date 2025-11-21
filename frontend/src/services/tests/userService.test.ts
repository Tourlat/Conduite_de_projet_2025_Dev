import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import userService from '../userService'

vi.mock('axios')
vi.mock('../../utils', () => ({
  getHeaders: vi.fn(() => ({ Authorization: 'Bearer test-token' }))
}))

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUser', () => {
    it('devrait récupérer un utilisateur par ID', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      }

      vi.mocked(axios.get).mockResolvedValue({ data: mockUser })

      const result = await userService.getUser(1)

      expect(result).toEqual(mockUser)
      expect(axios.get).toHaveBeenCalledWith(
        '/api/users/1',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' }
        })
      )
    })

    it('devrait lancer une erreur en cas d\'échec', async () => {
      const mockError = {
        response: {
          data: { message: 'User not found' }
        }
      }

      vi.mocked(axios.get).mockRejectedValue(mockError)

      await expect(userService.getUser(999)).rejects.toThrow('User not found')
    })
  })

  describe('getUsers', () => {
    it('devrait récupérer tous les utilisateurs', async () => {
      const mockUsers = [
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'user2@example.com', name: 'User 2' }
      ]

      vi.mocked(axios.get).mockResolvedValue({ data: mockUsers })

      const result = await userService.getUsers()

      expect(result).toEqual(mockUsers)
      expect(axios.get).toHaveBeenCalledWith('/api/users')
    })

    it('devrait lancer une erreur en cas d\'échec', async () => {
      const mockError = {
        response: {
          data: { message: 'Server error' }
        }
      }

      vi.mocked(axios.get).mockRejectedValue(mockError)

      await expect(userService.getUsers()).rejects.toThrow('Server error')
    })
  })

  describe('updateUser', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      const updateData = {
        email: 'updated@example.com',
        name: 'Updated Name'
      }

      const mockResponse = {
        id: 1,
        ...updateData
      }

      vi.mocked(axios.put).mockResolvedValue({ data: mockResponse })

      const result = await userService.updateUser(updateData)

      expect(result).toEqual(mockResponse)
      expect(axios.put).toHaveBeenCalledWith(
        '/api/users/',
        updateData,
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' }
        })
      )
    })

    it('devrait lancer une erreur en cas d\'échec', async () => {
      const mockError = {
        response: {
          data: { message: 'Update failed' }
        }
      }

      vi.mocked(axios.put).mockRejectedValue(mockError)

      await expect(
        userService.updateUser({ email: 'test@example.com', name: 'Test' })
      ).rejects.toThrow('Update failed')
    })
  })

  describe('changePassword', () => {
    it('devrait changer le mot de passe', async () => {
      const passwordData = {
        email: 'test@example.com',
        currentPassword: 'oldpass',
        newPassword: 'newpass'
      }

      vi.mocked(axios.put).mockResolvedValue({ data: {} })

      await userService.changePassword(passwordData)

      expect(axios.put).toHaveBeenCalledWith(
        '/api/users/password',
        passwordData,
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' }
        })
      )
    })

    it('devrait lancer une erreur en cas d\'échec', async () => {
      const mockError = {
        response: {
          data: { message: 'Wrong password' }
        }
      }

      vi.mocked(axios.put).mockRejectedValue(mockError)

      await expect(
        userService.changePassword({
          email: 'test@example.com',
          currentPassword: 'wrong',
          newPassword: 'new'
        })
      ).rejects.toThrow('Wrong password')
    })
  })
})
