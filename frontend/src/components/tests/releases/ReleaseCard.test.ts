import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReleaseCard from '../../releases/ReleaseCard.vue'
import type { ReleaseResponse } from '../../../services/releaseService'

describe('ReleaseCard', () => {
  const mockRelease: ReleaseResponse = {
    id: 1,
    version: {
      major: 1,
      minor: 2,
      patch: 3
    },
    createdAt: '2025-11-18T10:00:00Z',
    releaseNotes: 'This is a test release with some important changes',
    creatorId: 1,
    issueIds: [1, 2, 3],
    projectId: 'proj-123'
  }

  it('devrait afficher la carte de release', () => {
    const wrapper = mount(ReleaseCard, {
      props: {
        release: mockRelease
      }
    })
    expect(wrapper.find('.release-card').exists()).toBe(true)
  })

  it('devrait afficher la version correctement formatée', () => {
    const wrapper = mount(ReleaseCard, {
      props: {
        release: mockRelease
      }
    })
    expect(wrapper.find('.version-badge').text()).toBe('v1.2.3')
  })

  it('devrait afficher la date formatée en français', () => {
    const wrapper = mount(ReleaseCard, {
      props: {
        release: mockRelease
      }
    })
    const dateText = wrapper.find('.release-date').text()
    expect(dateText).toContain('18')
    expect(dateText).toContain('novembre')
    expect(dateText).toContain('2025')
  })

  it('devrait afficher le nombre d\'issues', () => {
    const wrapper = mount(ReleaseCard, {
      props: {
        release: mockRelease
      }
    })
    expect(wrapper.find('.issue-count').text()).toBe('3 issue(s)')
  })

  it('devrait afficher les notes de release', () => {
    const wrapper = mount(ReleaseCard, {
      props: {
        release: mockRelease
      }
    })
    expect(wrapper.find('.release-notes').text()).toContain('This is a test release')
  })

  it('devrait afficher un message quand il n\'y a pas de notes', () => {
    const releaseWithoutNotes: ReleaseResponse = {
      ...mockRelease,
      releaseNotes: undefined
    }
    const wrapper = mount(ReleaseCard, {
      props: {
        release: releaseWithoutNotes
      }
    })
    expect(wrapper.find('.no-notes').text()).toBe('Aucune note de release')
  })

  it('devrait tronquer les notes longues', () => {
    const longNotes = 'A'.repeat(200)
    const releaseWithLongNotes: ReleaseResponse = {
      ...mockRelease,
      releaseNotes: longNotes
    }
    const wrapper = mount(ReleaseCard, {
      props: {
        release: releaseWithLongNotes
      }
    })
    const notesText = wrapper.find('.release-notes').text()
    expect(notesText.length).toBeLessThan(160) // 150 + '...'
    expect(notesText).toContain('...')
  })

  it('devrait afficher le créateur', () => {
    const wrapper = mount(ReleaseCard, {
      props: {
        release: mockRelease
      }
    })
    expect(wrapper.find('.creator').text()).toContain('Créateur #1')
  })

  it('devrait afficher 0.0.0 si la version est invalide', () => {
    const releaseWithInvalidVersion: ReleaseResponse = {
      ...mockRelease,
      version: {
        major: undefined as any,
        minor: undefined as any,
        patch: undefined as any
      }
    }
    const wrapper = mount(ReleaseCard, {
      props: {
        release: releaseWithInvalidVersion
      }
    })
    expect(wrapper.find('.version-badge').text()).toBe('v0.0.0')
  })

  it('devrait afficher 0 issue(s) si issueIds est vide', () => {
    const releaseWithoutIssues: ReleaseResponse = {
      ...mockRelease,
      issueIds: []
    }
    const wrapper = mount(ReleaseCard, {
      props: {
        release: releaseWithoutIssues
      }
    })
    expect(wrapper.find('.issue-count').text()).toBe('0 issue(s)')
  })

  it('devrait émettre un événement click lors du clic', async () => {
    const wrapper = mount(ReleaseCard, {
      props: {
        release: mockRelease
      }
    })
    await wrapper.find('.release-card').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('devrait changer de style au survol', async () => {
    const wrapper = mount(ReleaseCard, {
      props: {
        release: mockRelease
      }
    })
    const card = wrapper.find('.release-card')
    expect(card.exists()).toBe(true)
  })
})
