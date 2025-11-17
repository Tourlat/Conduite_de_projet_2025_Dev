import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IssueSelector from '../../sprints/IssueSelector.vue'
import type { IssueResponse } from '../../../services/projectService'

describe('IssueSelector', () => {
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
      priority: 'MEDIUM',
      storyPoints: 3,
      status: 'IN_PROGRESS',
      projectId: 'proj-123',
      creatorId: 1,
      createdAt: '2025-11-02T10:00:00Z'
    }
  ]

  it('devrait afficher la liste des issues', () => {
    const wrapper = mount(IssueSelector, {
      props: {
        issues: mockIssues,
        selectedIssueIds: [],
        loading: false
      }
    })
    
    expect(wrapper.findAll('.issue-checkbox')).toHaveLength(2)
  })

  it('devrait afficher le message de chargement', () => {
    const wrapper = mount(IssueSelector, {
      props: {
        issues: [],
        selectedIssueIds: [],
        loading: true
      }
    })
    
    expect(wrapper.text()).toContain('Chargement des issues')
  })

  it('devrait afficher le message aucune issue disponible', () => {
    const wrapper = mount(IssueSelector, {
      props: {
        issues: [],
        selectedIssueIds: [],
        loading: false
      }
    })
    
    expect(wrapper.text()).toContain('Aucune issue disponible')
  })

  it('devrait cocher les issues sélectionnées', () => {
    const wrapper = mount(IssueSelector, {
      props: {
        issues: mockIssues,
        selectedIssueIds: [1],
        loading: false
      }
    })
    
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect((checkboxes[0]?.element as HTMLInputElement).checked).toBe(true)
    expect((checkboxes[1]?.element as HTMLInputElement).checked).toBe(false)
  })

  it('devrait émettre update:selectedIssueIds lors de la sélection', async () => {
    const wrapper = mount(IssueSelector, {
      props: {
        issues: mockIssues,
        selectedIssueIds: [],
        loading: false
      }
    })
    
    const firstCheckbox = wrapper.findAll('input[type="checkbox"]')[0]
    if (firstCheckbox) {
      await firstCheckbox.setValue(true)
    }
    
    expect(wrapper.emitted('update:selectedIssueIds')).toBeTruthy()
    expect(wrapper.emitted('update:selectedIssueIds')?.[0]).toEqual([[1]])
  })

  it('devrait émettre update:selectedIssueIds lors de la désélection', async () => {
    const wrapper = mount(IssueSelector, {
      props: {
        issues: mockIssues,
        selectedIssueIds: [1, 2],
        loading: false
      }
    })
    
    const firstCheckbox = wrapper.findAll('input[type="checkbox"]')[0]
    if (firstCheckbox) {
      await firstCheckbox.setValue(false)
    }
    
    expect(wrapper.emitted('update:selectedIssueIds')).toBeTruthy()
    expect(wrapper.emitted('update:selectedIssueIds')?.[0]).toEqual([[2]])
  })

  it('devrait afficher les titres des issues', () => {
    const wrapper = mount(IssueSelector, {
      props: {
        issues: mockIssues,
        selectedIssueIds: [],
        loading: false
      }
    })
    
    expect(wrapper.text()).toContain('Issue 1')
    expect(wrapper.text()).toContain('Issue 2')
  })

  it('devrait afficher les badges de priorité', () => {
    const wrapper = mount(IssueSelector, {
      props: {
        issues: mockIssues,
        selectedIssueIds: [],
        loading: false
      }
    })
    
    expect(wrapper.find('.priority-badge.priority-high').exists()).toBe(true)
    expect(wrapper.find('.priority-badge.priority-medium').exists()).toBe(true)
  })

  it('devrait afficher les badges de statut', () => {
    const wrapper = mount(IssueSelector, {
      props: {
        issues: mockIssues,
        selectedIssueIds: [],
        loading: false
      }
    })
    
    expect(wrapper.find('.status-badge').exists()).toBe(true)
    expect(wrapper.text()).toContain('TODO')
    expect(wrapper.text()).toContain('IN_PROGRESS')
  })
})
