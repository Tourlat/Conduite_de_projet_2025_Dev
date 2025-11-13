import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BacklogIssueCard from '../../backlog/BacklogIssueCard.vue'
import type { IssueResponse } from '../../../services/projectService'

const mockIssue: IssueResponse = {
  id: 1,
  title: 'Issue de test',
  description: 'Ceci est une description de test pour vérifier le composant BacklogIssueCard',
  status: 'TODO',
  priority: 'HIGH',
  storyPoints: 5,
  assigneeId: 1,
  projectId: '123',
  creatorId: 1,
  createdAt: new Date().toISOString()
}

describe('BacklogIssueCard', () => {
  it('devrait afficher le titre de l\'issue', () => {
    const wrapper = mount(BacklogIssueCard, {
      props: {
        issue: mockIssue
      }
    })

    expect(wrapper.find('h3').text()).toBe('Issue de test')
  })

  it('devrait afficher la description tronquée', () => {
    const wrapper = mount(BacklogIssueCard, {
      props: {
        issue: mockIssue
      }
    })

    const description = wrapper.find('.issue-description')
    expect(description.exists()).toBe(true)
    expect(description.text().length).toBeLessThanOrEqual(103)
  })

  it('devrait afficher le label de priorité', () => {
    const wrapper = mount(BacklogIssueCard, {
      props: {
        issue: mockIssue
      }
    })

    const priority = wrapper.find('.priority')
    expect(priority.text()).toBe('Haute')
    expect(priority.classes()).toContain('high')
  })

  it('devrait afficher les story points', () => {
    const wrapper = mount(BacklogIssueCard, {
      props: {
        issue: mockIssue
      }
    })

    expect(wrapper.find('.story-points').text()).toBe('5 pts')
  })

  it('devrait afficher l\'indicateur d\'assigné', () => {
    const wrapper = mount(BacklogIssueCard, {
      props: {
        issue: mockIssue
      }
    })

    const assignee = wrapper.find('.assignee')
    expect(assignee.exists()).toBe(true)
    expect(assignee.text()).toContain('Vous êtes assigné')
  })

  it('ne devrait pas afficher l\'assigné si non assigné', () => {
    const unassignedIssue = { ...mockIssue, assigneeId: undefined }
    const wrapper = mount(BacklogIssueCard, {
      props: {
        issue: unassignedIssue
      }
    })

    expect(wrapper.find('.assignee').exists()).toBe(false)
  })

  it('devrait émettre click quand on clique dessus', async () => {
    const wrapper = mount(BacklogIssueCard, {
      props: {
        issue: mockIssue
      }
    })

    await wrapper.find('.backlog-issue-card').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('devrait appliquer la classe closed quand isClosed est true', () => {
    const wrapper = mount(BacklogIssueCard, {
      props: {
        issue: mockIssue,
        isClosed: true
      }
    })

    expect(wrapper.find('.backlog-issue-card').classes()).toContain('closed')
  })

  it('devrait afficher les différents niveaux de priorité correctement', () => {
    const priorities = [
      { value: 'HIGH', label: 'Haute' },
      { value: 'MEDIUM', label: 'Moyenne' },
      { value: 'LOW', label: 'Basse' }
    ]

    priorities.forEach(({ value, label }) => {
      const issue = { ...mockIssue, priority: value as 'HIGH' | 'MEDIUM' | 'LOW' }
      const wrapper = mount(BacklogIssueCard, {
        props: { issue }
      })
      expect(wrapper.find('.priority').text()).toBe(label)
    })
  })

  it('ne devrait pas afficher la description si elle est vide', () => {
    const issueWithoutDesc = { ...mockIssue, description: '' }
    const wrapper = mount(BacklogIssueCard, {
      props: {
        issue: issueWithoutDesc
      }
    })

    expect(wrapper.find('.issue-description').exists()).toBe(false)
  })

  it('ne devrait pas afficher les story points si non définis', () => {
     const issueWithoutPoints = { ...mockIssue }
    delete (issueWithoutPoints as any).storyPoints
    const wrapper = mount(BacklogIssueCard, {
      props: {
        issue: issueWithoutPoints as IssueResponse
      }
    })

    expect(wrapper.find('.story-points').exists()).toBe(false)
  })
})
