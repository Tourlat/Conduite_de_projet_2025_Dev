import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SprintIssuesList from '../../sprints/SprintIssuesList.vue'
import type { IssueResponse } from '../../../services/projectService'

describe('SprintIssuesList', () => {
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
      createdAt: '2025-11-01T10:00:00Z'
    },
    {
      id: 2,
      title: 'Issue 2',
      description: 'Description 2',
      priority: 'LOW',
      storyPoints: 2,
      status: 'CLOSED',
      projectId: 'proj-123',
      creatorId: 1,
      createdAt: '2025-11-02T10:00:00Z'
    }
  ]

  it('devrait afficher la liste des issues', () => {
    const wrapper = mount(SprintIssuesList, {
      props: {
        issues: mockIssues
      }
    })
    
    expect(wrapper.findAll('.issue-card')).toHaveLength(2)
  })

  it('devrait afficher le message aucune issue', () => {
    const wrapper = mount(SprintIssuesList, {
      props: {
        issues: []
      }
    })
    
    expect(wrapper.text()).toContain('Aucune issue assignée à ce sprint')
  })

  it('devrait afficher les titres des issues', () => {
    const wrapper = mount(SprintIssuesList, {
      props: {
        issues: mockIssues
      }
    })
    
    expect(wrapper.text()).toContain('Issue 1')
    expect(wrapper.text()).toContain('Issue 2')
  })

  it('devrait émettre issue-click lors du clic sur une issue', async () => {
    const wrapper = mount(SprintIssuesList, {
      props: {
        issues: mockIssues
      }
    })
    
    const firstIssueCard = wrapper.findAll('.issue-card')[0]
    await firstIssueCard.trigger('click')
    
    expect(wrapper.emitted('issue-click')).toBeTruthy()
    expect(wrapper.emitted('issue-click')?.[0]).toEqual([1])
  })

  it('devrait afficher les badges de priorité', () => {
    const wrapper = mount(SprintIssuesList, {
      props: {
        issues: mockIssues
      }
    })
    
    expect(wrapper.find('.priority-badge.priority-high').exists()).toBe(true)
    expect(wrapper.find('.priority-badge.priority-low').exists()).toBe(true)
    expect(wrapper.text()).toContain('Haute')
    expect(wrapper.text()).toContain('Basse')
  })

  it('devrait afficher les badges de statut', () => {
    const wrapper = mount(SprintIssuesList, {
      props: {
        issues: mockIssues
      }
    })
    
    expect(wrapper.find('.status-badge.status-todo').exists()).toBe(true)
    expect(wrapper.find('.status-badge.status-closed').exists()).toBe(true)
    expect(wrapper.text()).toContain('À faire')
    expect(wrapper.text()).toContain('Fermé')
  })

  it('devrait afficher les story points', () => {
    const wrapper = mount(SprintIssuesList, {
      props: {
        issues: mockIssues
      }
    })
    
    expect(wrapper.text()).toContain('5 pts')
    expect(wrapper.text()).toContain('2 pts')
  })

  it('devrait avoir la classe issues-list', () => {
    const wrapper = mount(SprintIssuesList, {
      props: {
        issues: mockIssues
      }
    })
    
    expect(wrapper.find('.issues-list').exists()).toBe(true)
  })
})
