import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SprintInfoCard from '../../sprints/SprintInfoCard.vue'
import type { SprintResponse } from '../../../services/projectService'

describe('SprintInfoCard', () => {
  const mockSprint: SprintResponse = {
    id: 1,
    name: 'Sprint 1',
    startDate: '2025-11-01T00:00:00Z',
    endDate: '2025-11-15T00:00:00Z',
    projectId: 'proj-123',
    createdAt: '2025-10-30T10:00:00Z',
    issueIds: [1, 2, 3, 4, 5]
  }

  it('devrait afficher les informations du sprint', () => {
    const wrapper = mount(SprintInfoCard, {
      props: {
        sprint: mockSprint,
        issueCount: 5
      }
    })
    
    expect(wrapper.find('.sprint-info-card').exists()).toBe(true)
  })

  it('devrait afficher le nombre d\'issues', () => {
    const wrapper = mount(SprintInfoCard, {
      props: {
        sprint: mockSprint,
        issueCount: 5
      }
    })
    
    expect(wrapper.text()).toContain('5')
  })

  it('devrait afficher 0 issue si aucune issue', () => {
    const wrapper = mount(SprintInfoCard, {
      props: {
        sprint: mockSprint,
        issueCount: 0
      }
    })
    
    expect(wrapper.text()).toContain('0')
  })

  it('devrait afficher les dates formatées', () => {
    const wrapper = mount(SprintInfoCard, {
      props: {
        sprint: mockSprint,
        issueCount: 3
      }
    })
    
    // Vérifie que les dates sont affichées (format français)
    expect(wrapper.text()).toContain('2025')
  })

  it('devrait avoir la grille d\'informations', () => {
    const wrapper = mount(SprintInfoCard, {
      props: {
        sprint: mockSprint,
        issueCount: 2
      }
    })
    
    expect(wrapper.find('.info-grid').exists()).toBe(true)
  })
})
