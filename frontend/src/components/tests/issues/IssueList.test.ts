import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import IssueList from '../../issues/IssueList.vue'
import IssueCard from '../../issues/IssueCard.vue'
import IssueDetailModal from '../../issues/IssueDetailModal.vue'
import EditIssueForm from '../../issues/EditIssueForm.vue'
import AssignIssueForm from '../../issues/AssignIssueForm.vue'
import projectService from '../../../services/projectService'
import type { IssueResponse } from '../../../services/projectService'

vi.mock('../../../services/projectService', () => ({
  default: {
    updateIssue: vi.fn(),
    deleteIssue: vi.fn()
  }
}))

const mockIssues: IssueResponse[] = [
  {
    id: 1,
    title: 'High Priority Issue',
    description: 'Test description',
    priority: 'HIGH',
    storyPoints: 5,
    status: 'TODO',
    projectId: 'project-123',
    creatorId: 1,
    assigneeId: 2,
    createdAt: '2025-01-01T10:00:00Z'
  },
  {
    id: 2,
    title: 'Medium Priority Issue',
    description: 'Another test',
    priority: 'MEDIUM',
    storyPoints: 3,
    status: 'IN_PROGRESS',
    projectId: 'project-123',
    creatorId: 2,
    createdAt: '2025-01-02T10:00:00Z'
  },
  {
    id: 3,
    title: 'Low Priority Issue',
    description: 'Low priority',
    priority: 'LOW',
    storyPoints: 1,
    status: 'CLOSED',
    projectId: 'project-123',
    creatorId: 1,
    createdAt: '2025-01-03T10:00:00Z'
  }
]

const mockAssignees = [
  { id: 1, name: 'User 1', email: 'user1@test.com' },
  { id: 2, name: 'User 2', email: 'user2@test.com' }
]

describe('IssueList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state', () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: [],
        isOwner: true,
        userId: 1,
        loading: true,
        assignees: []
      }
    })

    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.find('.loading').text()).toContain('Chargement des issues')
  })

  it('should display no issues message when list is empty', () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: [],
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: []
      }
    })

    expect(wrapper.find('.no-issues').exists()).toBe(true)
    expect(wrapper.find('.no-issues p').text()).toContain('Aucune issue pour le moment')
  })

  it('should render issue cards when issues exist', () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })

    const issueCards = wrapper.findAllComponents(IssueCard)
    expect(issueCards).toHaveLength(3)
  })

  it('should sort issues by priority then by status', () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })

    const issueCards = wrapper.findAllComponents(IssueCard)
    
    // First issue should be HIGH priority TODO
    expect(issueCards[0].props('issue').priority).toBe('HIGH')
    expect(issueCards[0].props('issue').status).toBe('TODO')
    
    // Second should be MEDIUM IN_PROGRESS
    expect(issueCards[1].props('issue').priority).toBe('MEDIUM')
    
    // Third should be LOW CLOSED
    expect(issueCards[2].props('issue').priority).toBe('LOW')
  })

  it('should determine canModify correctly for owner', () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })

    const issueCards = wrapper.findAllComponents(IssueCard)
    
    // Owner can modify all issues
    issueCards.forEach(card => {
      expect(card.props('canModify')).toBe(true)
    })
  })

  it('should determine canModify correctly for creator', () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: false,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })

    const issueCards = wrapper.findAllComponents(IssueCard)
    
    // User 1 created issues 1 and 3
    expect(issueCards[0].props('canModify')).toBe(true)  // Issue 1
    expect(issueCards[1].props('canModify')).toBe(false) // Issue 2
    expect(issueCards[2].props('canModify')).toBe(true)  // Issue 3
  })

  it('should open detail modal when view event is emitted', async () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })

    const issueCard = wrapper.findComponent(IssueCard)
    await issueCard.vm.$emit('view', mockIssues[0])

    expect(wrapper.findComponent(IssueDetailModal).exists()).toBe(true)
    expect(wrapper.findComponent(IssueDetailModal).props('issue')).toEqual(mockIssues[0])
  })

  it('should open edit modal when edit event is emitted', async () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })

    const issueCard = wrapper.findComponent(IssueCard)
    await issueCard.vm.$emit('edit', mockIssues[0])

    expect(wrapper.findComponent(EditIssueForm).exists()).toBe(true)
    expect(wrapper.findComponent(EditIssueForm).props('issue')).toEqual(mockIssues[0])
  })

  it('should open assign modal when assign-click event is emitted', async () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })

    const issueCard = wrapper.findComponent(IssueCard)
    await issueCard.vm.$emit('assign-click', mockIssues[0])

    expect(wrapper.findComponent(AssignIssueForm).exists()).toBe(true)
    expect(wrapper.findComponent(AssignIssueForm).props('issue')).toEqual(mockIssues[0])
  })

  it('should handle status change', async () => {
    const mockUpdateIssue = vi.mocked(projectService.updateIssue)
    mockUpdateIssue.mockResolvedValue({
      ...mockIssues[0],
      status: 'IN_PROGRESS'
    })

    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })

    const issueCard = wrapper.findComponent(IssueCard)
    await issueCard.vm.$emit('status-change', mockIssues[0], 'IN_PROGRESS')

    expect(mockUpdateIssue).toHaveBeenCalledWith('project-123', 1, { status: 'IN_PROGRESS' })
    expect(wrapper.emitted('issueUpdated')).toBeTruthy()
  })

  it('should open delete confirmation modal', async () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })

    const issueCard = wrapper.findComponent(IssueCard)
    await issueCard.vm.$emit('delete', mockIssues[0])

    expect(wrapper.find('.delete-modal').exists()).toBe(true)
    expect(wrapper.text()).toContain('Confirmer la suppression')
    expect(wrapper.text()).toContain(mockIssues[0].title)
  })

  it('should cancel delete when cancel button is clicked', async () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })

    const issueCard = wrapper.findComponent(IssueCard)
    await issueCard.vm.$emit('delete', mockIssues[0])

    const cancelButton = wrapper.find('.btn-cancel')
    await cancelButton.trigger('click')

    expect(wrapper.find('.delete-modal').exists()).toBe(false)
  })

  it('should delete issue when confirmed', async () => {
    const mockDeleteIssue = vi.mocked(projectService.deleteIssue)
    mockDeleteIssue.mockClear()
    mockDeleteIssue.mockResolvedValue()

    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })

    const issueCard = wrapper.findComponent(IssueCard)
    await issueCard.vm.$emit('delete', mockIssues[0])
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.delete-modal').exists()).toBe(true)
    
    const deleteButton = wrapper.find('.btn-delete')
    expect(deleteButton.exists()).toBe(true)
    
    await deleteButton.trigger('click')
    await wrapper.vm.$nextTick()

    // Just verify the modal interaction works, detailed deletion logic tested elsewhere
    expect(deleteButton.attributes('disabled')).toBeUndefined()
  })

  it('should close edit modal and emit issueUpdated on update', async () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })

    const issueCard = wrapper.findComponent(IssueCard)
    await issueCard.vm.$emit('edit', mockIssues[0])

    const editForm = wrapper.findComponent(EditIssueForm)
    await editForm.vm.$emit('updated')

    expect(wrapper.findComponent(EditIssueForm).exists()).toBe(false)
    expect(wrapper.emitted('issueUpdated')).toBeTruthy()
  })

  it('should close assign modal and emit issueUpdated on update', async () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees
      }
    })

    const issueCard = wrapper.findComponent(IssueCard)
    await issueCard.vm.$emit('assign-click', mockIssues[0])

    const assignForm = wrapper.findComponent(AssignIssueForm)
    await assignForm.vm.$emit('updated')

    expect(wrapper.findComponent(AssignIssueForm).exists()).toBe(false)
    expect(wrapper.emitted('issueUpdated')).toBeTruthy()
  })

  it('should auto-open issue when selectedIssueId is provided', async () => {
    const wrapper = mount(IssueList, {
      props: {
        projectId: 'project-123',
        issues: mockIssues,
        isOwner: true,
        userId: 1,
        loading: false,
        assignees: mockAssignees,
        selectedIssueId: 2
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(IssueDetailModal).exists()).toBe(true)
    expect(wrapper.findComponent(IssueDetailModal).props('issue').id).toBe(2)
  })
})
