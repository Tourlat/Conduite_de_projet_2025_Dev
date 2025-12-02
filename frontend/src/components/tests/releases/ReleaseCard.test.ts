import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ReleaseCard from '../../releases/ReleaseCard.vue'
import type { ReleaseResponse } from '../../../services/releaseService'
import type { IssueResponse } from '../../../services/projectService'

// Mock du service projectService
vi.mock('../../../services/projectService', () => ({
  default: {
    getIssuesByProject: vi.fn()
  }
}))

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

  describe('Modal des issues', () => {
    const mockIssues: IssueResponse[] = [
      {
        id: 1,
        title: 'Issue 1',
        description: 'Description 1',
        priority: 'HIGH',
        storyPoints: 5,
        status: 'TODO',
        projectId: 'proj-123',
        creatorId: 1,
        assigneeId: 2,
        createdAt: '2025-11-15T10:00:00Z'
      },
      {
        id: 2,
        title: 'Issue 2',
        description: 'Description 2',
        priority: 'MEDIUM',
        storyPoints: 3,
        status: 'IN_PROGRESS',
        projectId: 'proj-123',
        creatorId: 1,
        createdAt: '2025-11-16T10:00:00Z'
      },
      {
        id: 3,
        title: 'Issue 3',
        description: 'Description 3',
        priority: 'LOW',
        storyPoints: 2,
        status: 'CLOSED',
        projectId: 'proj-123',
        creatorId: 1,
        createdAt: '2025-11-17T10:00:00Z'
      }
    ]

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('ne devrait pas afficher le modal initialement', () => {
      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        }
      })
      expect(wrapper.find('.modal-overlay').exists()).toBe(false)
    })

    it('devrait afficher le modal lors du clic sur le compteur d\'issues', async () => {
      const projectService = await import('../../../services/projectService')
      vi.mocked(projectService.default.getIssuesByProject).mockResolvedValue(mockIssues)

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()
      
      const modal = document.querySelector('.modal-overlay')
      expect(modal).toBeTruthy()
      
      const header = document.querySelector('.modal-header h3')
      expect(header?.textContent).toContain('Issues de la release v1.2.3')
      
      wrapper.unmount()
    })

    it('ne devrait pas ouvrir le modal si aucune issue', async () => {
      const releaseWithoutIssues: ReleaseResponse = {
        ...mockRelease,
        issueIds: []
      }
      const wrapper = mount(ReleaseCard, {
        props: {
          release: releaseWithoutIssues
        }
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.modal-overlay').exists()).toBe(false)
    })

    it('devrait charger et afficher les issues dans le modal', async () => {
      const projectService = await import('../../../services/projectService')
      vi.mocked(projectService.default.getIssuesByProject).mockResolvedValue(mockIssues)

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(projectService.default.getIssuesByProject).toHaveBeenCalledWith('proj-123')
      
      const issueItems = document.querySelectorAll('.issue-item')
      expect(issueItems.length).toBe(3)
      
      wrapper.unmount()
    })

    it('devrait afficher les détails corrects de chaque issue', async () => {
      const projectService = await import('../../../services/projectService')
      vi.mocked(projectService.default.getIssuesByProject).mockResolvedValue(mockIssues)

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const firstIssue = document.querySelectorAll('.issue-item')[0]
      expect(firstIssue.querySelector('.issue-title')?.textContent).toBe('Issue 1')
      expect(firstIssue.querySelector('.issue-id')?.textContent).toBe('#1')
      expect(firstIssue.querySelector('.issue-status')?.textContent).toBe('À faire')
      expect(firstIssue.querySelector('.issue-priority')?.textContent).toBe('Haute')
      expect(firstIssue.querySelector('.issue-points')?.textContent).toBe('5 pts')
      
      wrapper.unmount()
    })

    it('devrait fermer le modal lors du clic sur le bouton close', async () => {
      const projectService = await import('../../../services/projectService')
      vi.mocked(projectService.default.getIssuesByProject).mockResolvedValue(mockIssues)

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(document.querySelector('.modal-overlay')).toBeTruthy()

      const closeBtn = document.querySelector('.close-btn') as HTMLElement
      closeBtn?.click()
      await wrapper.vm.$nextTick()

      expect(document.querySelector('.modal-overlay')).toBeFalsy()
      
      wrapper.unmount()
    })

    it('devrait fermer le modal lors du clic sur l\'overlay', async () => {
      const projectService = await import('../../../services/projectService')
      vi.mocked(projectService.default.getIssuesByProject).mockResolvedValue(mockIssues)

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()

      const overlay = document.querySelector('.modal-overlay') as HTMLElement
      overlay?.click()
      await wrapper.vm.$nextTick()

      expect(document.querySelector('.modal-overlay')).toBeFalsy()
      
      wrapper.unmount()
    })

    it('ne devrait pas fermer le modal lors du clic sur le contenu', async () => {
      const projectService = await import('../../../services/projectService')
      vi.mocked(projectService.default.getIssuesByProject).mockResolvedValue(mockIssues)

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()

      const content = document.querySelector('.modal-content') as HTMLElement
      content?.click()
      await wrapper.vm.$nextTick()

      expect(document.querySelector('.modal-overlay')).toBeTruthy()
      
      wrapper.unmount()
    })

    it('devrait afficher un message de chargement', async () => {
      const projectService = await import('../../../services/projectService')
      vi.mocked(projectService.default.getIssuesByProject).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockIssues), 1000))
      )

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()

      const loadingState = document.querySelector('.loading-state')
      expect(loadingState).toBeTruthy()
      expect(loadingState?.textContent).toContain('Chargement des issues')
      
      wrapper.unmount()
    })

    it('devrait afficher un message d\'erreur en cas d\'échec', async () => {
      const projectService = await import('../../../services/projectService')
      vi.mocked(projectService.default.getIssuesByProject).mockRejectedValue(
        new Error('Erreur réseau')
      )

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const errorState = document.querySelector('.error-state')
      expect(errorState).toBeTruthy()
      expect(errorState?.textContent).toContain('Erreur réseau')
      
      wrapper.unmount()
    })

    it('devrait afficher un message si aucune issue dans la release', async () => {
      const projectService = await import('../../../services/projectService')

      vi.mocked(projectService.default.getIssuesByProject).mockResolvedValue([
        {
          id: 99,
          title: 'Issue non liée',
          priority: 'LOW',
          storyPoints: 1,
          status: 'TODO',
          projectId: 'proj-123',
          creatorId: 1,
          createdAt: '2025-11-15T10:00:00Z'
        }
      ])

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const emptyState = document.querySelector('.empty-state')
      expect(emptyState).toBeTruthy()
      expect(emptyState?.textContent).toContain('Aucune issue dans cette release')
      
      wrapper.unmount()
    })

    it('ne devrait pas propager le clic au parent lors du clic sur le compteur', async () => {
      const projectService = await import('../../../services/projectService')
      vi.mocked(projectService.default.getIssuesByProject).mockResolvedValue(mockIssues)

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('devrait formater correctement les statuts en français', async () => {
      const projectService = await import('../../../services/projectService')
      vi.mocked(projectService.default.getIssuesByProject).mockResolvedValue(mockIssues)

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const issueItems = document.querySelectorAll('.issue-item')
      expect(issueItems[0].querySelector('.issue-status')?.textContent).toBe('À faire')
      expect(issueItems[1].querySelector('.issue-status')?.textContent).toBe('En cours')
      expect(issueItems[2].querySelector('.issue-status')?.textContent).toBe('Terminé')
      
      wrapper.unmount()
    })

    it('devrait formater correctement les priorités en français', async () => {
      const projectService = await import('../../../services/projectService')
      vi.mocked(projectService.default.getIssuesByProject).mockResolvedValue(mockIssues)

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const issueItems = document.querySelectorAll('.issue-item')
      expect(issueItems[0].querySelector('.issue-priority')?.textContent).toBe('Haute')
      expect(issueItems[1].querySelector('.issue-priority')?.textContent).toBe('Moyenne')
      expect(issueItems[2].querySelector('.issue-priority')?.textContent).toBe('Basse')
      
      wrapper.unmount()
    })

    it('devrait appliquer les bonnes classes CSS selon le statut', async () => {
      const projectService = await import('../../../services/projectService')
      vi.mocked(projectService.default.getIssuesByProject).mockResolvedValue(mockIssues)

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const issueItems = document.querySelectorAll('.issue-item')
      expect(issueItems[0].querySelector('.issue-status')?.classList.contains('status-todo')).toBe(true)
      expect(issueItems[1].querySelector('.issue-status')?.classList.contains('status-in_progress')).toBe(true)
      expect(issueItems[2].querySelector('.issue-status')?.classList.contains('status-closed')).toBe(true)
      
      wrapper.unmount()
    })

    it('devrait appliquer les bonnes classes CSS selon la priorité', async () => {
      const projectService = await import('../../../services/projectService')
      vi.mocked(projectService.default.getIssuesByProject).mockResolvedValue(mockIssues)

      const wrapper = mount(ReleaseCard, {
        props: {
          release: mockRelease
        },
        attachTo: document.body
      })

      await wrapper.find('.issue-count').trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const issueItems = document.querySelectorAll('.issue-item')
      expect(issueItems[0].querySelector('.issue-priority')?.classList.contains('priority-high')).toBe(true)
      expect(issueItems[1].querySelector('.issue-priority')?.classList.contains('priority-medium')).toBe(true)
      expect(issueItems[2].querySelector('.issue-priority')?.classList.contains('priority-low')).toBe(true)
      
      wrapper.unmount()
    })
  })
})
