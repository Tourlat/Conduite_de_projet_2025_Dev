import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SprintCard from '../../sprints/SprintCard.vue'
import type { SprintResponse } from '../../../services/projectService'

describe('SprintCard', () => {
  // Sprint terminé (dates passées)
  const completedSprint: SprintResponse = {
    id: 1,
    name: 'Sprint 1',
    startDate: '2025-11-01T00:00:00Z',
    endDate: '2025-11-15T00:00:00Z',
    projectId: 'proj-123',
    createdAt: '2025-10-30T10:00:00Z',
    issueIds: [1, 2, 3]
  }

  // Sprint à venir (dates futures)
  const plannedSprint: SprintResponse = {
    id: 2,
    name: 'Sprint 2',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-01-15T00:00:00Z',
    projectId: 'proj-123',
    createdAt: '2025-11-17T10:00:00Z',
    issueIds: []
  }

  it('devrait afficher le nom du sprint', () => {
    const wrapper = mount(SprintCard, {
      props: {
        sprint: completedSprint,
        projectId: 'proj-123'
      }
    })
    
    expect(wrapper.text()).toContain('Sprint 1')
  })

  it('devrait afficher le statut calculé', () => {
    // Sprint avec dates passées devrait être "Terminé"
    const wrapper = mount(SprintCard, {
      props: {
        sprint: completedSprint,
        projectId: 'proj-123'
      }
    })
    
    expect(wrapper.find('.sprint-status').exists()).toBe(true)
    expect(wrapper.text()).toContain('Terminé')
  })

  it('devrait afficher le badge de statut COMPLETED', () => {
    const wrapper = mount(SprintCard, {
      props: {
        sprint: completedSprint,
        projectId: 'proj-123'
      }
    })
    
    expect(wrapper.find('.sprint-status.status-completed').exists()).toBe(true)
    expect(wrapper.text()).toContain('Terminé')
  })

  it('devrait afficher le badge de statut PLANNED', () => {
    const wrapper = mount(SprintCard, {
      props: {
        sprint: plannedSprint,
        projectId: 'proj-123'
      }
    })
    
    expect(wrapper.find('.sprint-status.status-planned').exists()).toBe(true)
    expect(wrapper.text()).toContain('Planifié')
  })

  it('devrait afficher les dates du sprint', () => {
    const wrapper = mount(SprintCard, {
      props: {
        sprint: completedSprint,
        projectId: 'proj-123'
      }
    })
    
    expect(wrapper.text()).toContain('01 nov. 2025')
    expect(wrapper.text()).toContain('15 nov. 2025')
  })

  it('devrait avoir la classe sprint-card', () => {
    const wrapper = mount(SprintCard, {
      props: {
        sprint: completedSprint,
        projectId: 'proj-123'
      }
    })
    
    expect(wrapper.find('.sprint-card').exists()).toBe(true)
  })
})
