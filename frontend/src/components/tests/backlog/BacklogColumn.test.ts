import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BacklogColumn from '../../backlog/BacklogColumn.vue'
import BacklogIssueCard from '../../backlog/BacklogIssueCard.vue'
import type { IssueResponse } from '../../../services/projectService'

const mockIssues: IssueResponse[] = [
  {
    id: 1,
    title: 'Issue 1',
    description: 'Description 1',
    status: 'TODO',
    priority: 'HIGH',
    storyPoints: 5,
    assigneeId: 1,
    projectId: 'project-123',
    creatorId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Issue 2',
    description: 'Description 2',
    status: 'TODO',
    priority: 'MEDIUM',
    storyPoints: 3,
    assigneeId: undefined,
    projectId: 'project-123',
    creatorId: 1,
    createdAt: new Date().toISOString()
  }
]

describe('BacklogColumn', () => {
  it('devrait afficher le titre et le nombre d\'issues', () => {
    const wrapper = mount(BacklogColumn, {
      props: {
        title: 'À faire',
        issues: mockIssues,
        status: 'TODO',
        emptyMessage: 'Aucune issue'
      }
    })

    expect(wrapper.find('h2').text()).toBe('À faire')
    expect(wrapper.find('.count').text()).toBe('2')
  })

  it('devrait afficher un message quand la colonne est vide', () => {
    const wrapper = mount(BacklogColumn, {
      props: {
        title: 'À faire',
        issues: [],
        status: 'TODO',
        emptyMessage: 'Aucune issue à faire'
      }
    })

    expect(wrapper.find('.empty-column').text()).toBe('Aucune issue à faire')
    expect(wrapper.findAllComponents(BacklogIssueCard)).toHaveLength(0)
  })

  it('devrait rendre toutes les issues', () => {
    const wrapper = mount(BacklogColumn, {
      props: {
        title: 'À faire',
        issues: mockIssues,
        status: 'TODO',
        emptyMessage: 'Aucune issue'
      }
    })

    expect(wrapper.findAllComponents(BacklogIssueCard)).toHaveLength(2)
  })

  it('devrait émettre issue-click quand on clique sur une issue', async () => {
    const wrapper = mount(BacklogColumn, {
      props: {
        title: 'À faire',
        issues: mockIssues,
        status: 'TODO',
        emptyMessage: 'Aucune issue'
      }
    })

    const issueCard = wrapper.findComponent(BacklogIssueCard)
    await issueCard.trigger('click')

    expect(wrapper.emitted('issue-click')).toBeTruthy()
    expect(wrapper.emitted('issue-click')?.[0]).toEqual([1])
  })

  it('devrait appliquer la classe CSS correcte selon le statut', () => {
    const wrapperTodo = mount(BacklogColumn, {
      props: {
        title: 'À faire',
        issues: [],
        status: 'TODO',
        emptyMessage: 'Aucune issue'
      }
    })
    expect(wrapperTodo.find('.column-header').classes()).toContain('todo')

    const wrapperInProgress = mount(BacklogColumn, {
      props: {
        title: 'En cours',
        issues: [],
        status: 'IN_PROGRESS',
        emptyMessage: 'Aucune issue'
      }
    })
    expect(wrapperInProgress.find('.column-header').classes()).toContain('in-progress')

    const wrapperClosed = mount(BacklogColumn, {
      props: {
        title: 'Fermé',
        issues: [],
        status: 'CLOSED',
        emptyMessage: 'Aucune issue'
      }
    })
    expect(wrapperClosed.find('.column-header').classes()).toContain('closed')
  })

  it('devrait passer isClosed aux cartes d\'issues fermées', () => {
    const closedIssues: IssueResponse[] = [{
      id: 1,
      title: 'Issue fermée',
      description: 'Description',
      status: 'CLOSED',
      priority: 'LOW',
      storyPoints: 2,
      assigneeId: undefined,
      projectId: 'project-123',
      creatorId: 1,
      createdAt: new Date().toISOString()
    }]

    const wrapper = mount(BacklogColumn, {
      props: {
        title: 'Fermé',
        issues: closedIssues,
        status: 'CLOSED',
        emptyMessage: 'Aucune issue'
      }
    })

    const issueCard = wrapper.findComponent(BacklogIssueCard)
    expect(issueCard.props('isClosed')).toBe(true)
  })
})
