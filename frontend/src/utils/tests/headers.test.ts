import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getHeaders } from '../headers'
import * as localStorage from '../localStorage'

vi.mock('../localStorage', () => ({
  getAuthToken: vi.fn()
}))

describe('headers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getHeaders', () => {
    it('should return headers with Bearer token when token exists', () => {
      const mockToken = 'test-token-123'
      vi.mocked(localStorage.getAuthToken).mockReturnValue(mockToken)

      const headers = getHeaders()

      expect(headers).toEqual({
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json'
      })
    })

    it('should return headers with null token when no token exists', () => {
      vi.mocked(localStorage.getAuthToken).mockReturnValue(null)

      const headers = getHeaders()

      expect(headers).toEqual({
        'Authorization': 'Bearer null',
        'Content-Type': 'application/json'
      })
    })
  })
})
