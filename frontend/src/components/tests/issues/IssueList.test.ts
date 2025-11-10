import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import IssueList from '../../issues/IssueList.vue'
import IssueCard from '../../issues/IssueCard.vue'
import type { IssueResponse } from '../../../services/projectService'

vi.mock('../../../services/userService', () => ({
  default: {
    getUser: vi.fn().mockResolvedValue({ id: 1, name: 'John', email: 'john@example.com' })
  }
}))

vi.mock('../../../services/projectService', () => ({
  default: {
    deleteIssue: vi.fn().mockResolvedValue({}),
    updateIssue: vi.fn().mockResolvedValue({})
  }
}))

describe('IssueList', () => {
  const mockIssues: IssueResponse[] = [
    {
      id: 1,
      title: 'High priority bug',
      description: 'Critical bug',
      priority: 'HIGH',
      storyPoints: 8,
      status: 'TODO',
      projectId: 'proj-1',
      creatorId: 1,
      assigneeId: 2
    },
    {
      id: 2,
      title: 'Medium priority feature',
      description: 'New feature',
      priority: 'MEDIUM',
      storyPoints: 5,
      status: 'IN_PROGRESS',
      projectId: 'proj-1',
      creatorId: 1,
      assigneeId: 3
    },
    {
      id: 3,
      title: 'Low priority task',
      description: 'Minor task',
      priority: 'LOW',
      storyPoints: 2,
      status: 'CLOSED',
      projectId: 'proj-1',
      creatorId: 1
    }
  ]

  const mockAssignees = [
    { id: 1, name: 'Owner', email: 'owner@example.com' },
    { id: 2, name: 'John', email: 'john@example.com' },
    { id: 3, name: 'Jane', email: 'jane@example.com' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait afficher la liste des issues', () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'proj-1',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      },
      global: {
        stubs: {
          IssueCard: true,
          EditIssueForm: true,
          AssignIssueForm: true
        }
      }
    })
    expect(wrapper.find('.issues-list').exists()).toBe(true)
  })

  it('devrait afficher le message de chargement', () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'proj-1',
        issues: [],
        isOwner: true,
        userId: 1,
        loading: true,
        assignees: mockAssignees
      }
    })
    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.text()).toContain('Chargement')
  })

  it('devrait afficher le message quand il n\'y a pas d\'issues', () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'proj-1',
        issues: [],
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })
    expect(wrapper.find('.no-issues').exists()).toBe(true)
    expect(wrapper.text()).toContain('Aucune issue')
  })

  it('devrait afficher la grille d\'issues', () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'proj-1',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      },
      global: {
        stubs: {
          IssueCard: true,
          EditIssueForm: true,
          AssignIssueForm: true
        }
      }
    })
    expect(wrapper.find('.issues-grid').exists()).toBe(true)
  })

  it('devrait trier les issues par priorité d\'abord', () => {
    const unsortedIssues: IssueResponse[] = [
      { ...mockIssues[2], id: 10 } as IssueResponse,
      { ...mockIssues[0], id: 11 } as IssueResponse,
      { ...mockIssues[1], id: 12 } as IssueResponse
    ]
    
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'proj-1',
        issues: unsortedIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      },
      global: {
        components: { IssueCard }
      }
    })
    
    const cards = wrapper.findAllComponents(IssueCard)
    expect(cards.length).toBe(3)
    expect(cards[0]!.props('issue')!.priority).toBe('HIGH')
    expect(cards[1]!.props('issue')!.priority).toBe('MEDIUM')
    expect(cards[2]!.props('issue')!.priority).toBe('LOW')
  })

  it('devrait permettre à l\'owner de modifier ses propres issues', () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'proj-1',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      },
      global: {
        stubs: {
          IssueCard: true,
          EditIssueForm: true,
          AssignIssueForm: true
        }
      }
    })
    
    const cards = wrapper.findAllComponents(IssueCard)
    expect(cards.length).toBeGreaterThan(0)
    cards.forEach(card => {
      expect(card.props('canModify')).toBe(true)
    })
  })

  it('devrait permettre au créateur d\'une issue de la modifier', () => {
    const issues: IssueResponse[] = [
      { ...mockIssues[0], creatorId: 2, id: 20 } as IssueResponse
    ]
    
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'proj-1',
        issues,
        isOwner: false,
        userId: 2,
        loading: false,
        assignees: mockAssignees
      },
      global: {
        stubs: {
          IssueCard: true,
          EditIssueForm: true,
          AssignIssueForm: true
        }
      }
    })
    
    const card = wrapper.findComponent(IssueCard)
    expect(card.props('canModify')).toBe(true)
  })

  it('ne devrait pas permettre la modification si l\'utilisateur n\'a pas les droits', () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'proj-1',
        issues: mockIssues,
        isOwner: false,
        userId: 999,
        loading: false,
        assignees: mockAssignees
      },
      global: {
        stubs: {
          IssueCard: true,
          EditIssueForm: true,
          AssignIssueForm: true
        }
      }
    })
    
    const cards = wrapper.findAllComponents(IssueCard)
    expect(cards.length).toBeGreaterThan(0)
    cards.forEach(card => {
      expect(card.props('canModify')).toBe(false)
    })
  })
})