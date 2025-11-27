import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAuthToken,
  setAuthToken,
  getUserId,
  setUserId,
  getUserEmail,
  setUserEmail,
  getUserName,
  setUserName,
  getUserData,
  setUserData,
  clearUserData,
  isAuthenticated
} from '../localStorage'

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Auth Token', () => {
    it('should set and get auth token', () => {
      const token = 'test-token-123'
      setAuthToken(token)
      expect(getAuthToken()).toBe(token)
    })

    it('should return null when no token exists', () => {
      expect(getAuthToken()).toBeNull()
    })
  })

  describe('User ID', () => {
    it('should set and get user ID', () => {
      const id = 42
      setUserId(id)
      expect(getUserId()).toBe(id)
    })

    it('should return 0 when no user ID exists', () => {
      expect(getUserId()).toBe(0)
    })

    it('should parse user ID as integer', () => {
      localStorage.setItem('userId', '123')
      expect(getUserId()).toBe(123)
    })
  })

  describe('User Email', () => {
    it('should set and get user email', () => {
      const email = 'test@example.com'
      setUserEmail(email)
      expect(getUserEmail()).toBe(email)
    })

    it('should return null when no email exists', () => {
      expect(getUserEmail()).toBeNull()
    })
  })

  describe('User Name', () => {
    it('should set and get user name', () => {
      const name = 'John Doe'
      setUserName(name)
      expect(getUserName()).toBe(name)
    })

    it('should return null when no name exists', () => {
      expect(getUserName()).toBeNull()
    })
  })

  describe('getUserData', () => {
    it('should return all user data', () => {
      setAuthToken('token-123')
      setUserId(42)
      setUserEmail('test@example.com')
      setUserName('John Doe')

      const userData = getUserData()

      expect(userData).toEqual({
        authToken: 'token-123',
        userId: 42,
        userEmail: 'test@example.com',
        userName: 'John Doe'
      })
    })

    it('should return default values when no data exists', () => {
      const userData = getUserData()

      expect(userData).toEqual({
        authToken: null,
        userId: 0,
        userEmail: null,
        userName: null
      })
    })
  })

  describe('setUserData', () => {
    it('should set all user data at once', () => {
      const userData = {
        token: 'token-456',
        id: 99,
        email: 'jane@example.com',
        name: 'Jane Smith'
      }

      setUserData(userData)

      expect(getAuthToken()).toBe('token-456')
      expect(getUserId()).toBe(99)
      expect(getUserEmail()).toBe('jane@example.com')
      expect(getUserName()).toBe('Jane Smith')
    })
  })

  describe('clearUserData', () => {
    it('should clear all user data', () => {
      setAuthToken('token-123')
      setUserId(42)
      setUserEmail('test@example.com')
      setUserName('John Doe')

      clearUserData()

      expect(getAuthToken()).toBeNull()
      expect(getUserId()).toBe(0)
      expect(getUserEmail()).toBeNull()
      expect(getUserName()).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when auth token exists', () => {
      setAuthToken('token-123')
      expect(isAuthenticated()).toBe(true)
    })

    it('should return false when no auth token exists', () => {
      expect(isAuthenticated()).toBe(false)
    })

    it('should return false when auth token is empty string', () => {
      localStorage.setItem('authToken', '')
      expect(isAuthenticated()).toBe(false)
    })
  })
})
