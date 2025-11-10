import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import IssueCard from '../../issues/IssueCard.vue'
import userService from '../../../services/userService'
import type { IssueResponse } from '../../../services/projectService'

vi.mock('../../../services/userService', () => ({
  default: {
    getUser: vi.fn()
  }
}))

describe('IssueCard', () => {
  const mockIssue: IssueResponse = {
    id: 1,
    title: 'Fix login bug',
    description: 'The login button is not working',
    priority: 'HIGH',
    storyPoints: 5,
    status: 'TODO',
    projectId: 'proj-123',
    creatorId: 1,
    assigneeId: 2,
    createdAt: '2025-11-10T10:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(userService.getUser).mockResolvedValue({
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    })
  })

  it('devrait afficher la carte d\'issue', () => {
    const wrapper = mount(IssueCard, {
      props: {
        issue: mockIssue,
        canModify: true
      },
      global: {
        stubs: {
          StatusDropdown: true
        }
      }
    })
    expect(wrapper.find('.issue-card').exists()).toBe(true)
  })

  it('devrait afficher le titre de l\'issue', () => {
    const wrapper = mount(IssueCard, {
      props: {
        issue: mockIssue,
        canModify: true
      }
    })
    expect(wrapper.text()).toContain('Fix login bug')
  })

  it('devrait afficher la description de l\'issue', () => {
    const wrapper = mount(IssueCard, {
      props: {
        issue: mockIssue,
        canModify: true
      }
    })
    expect(wrapper.find('.description').text()).toContain('The login button is not working')
  })

  it('devrait afficher les story points', () => {
    const wrapper = mount(IssueCard, {
      props: {
        issue: mockIssue,
        canModify: true
      }
    })
    expect(wrapper.text()).toContain('5')
  })

  it('devrait afficher le badge de statut', () => {
    const wrapper = mount(IssueCard, {
      props: {
        issue: mockIssue,
        canModify: true
      },
      global: {
        stubs: {
          StatusDropdown: true
        }
      }
    })
    expect(wrapper.find('.issue-card').exists()).toBe(true)
    expect(wrapper.find('.card-header').exists()).toBe(true)
  })

  it('devrait afficher le badge de priorité', () => {
    const wrapper = mount(IssueCard, {
      props: {
        issue: mockIssue,
        canModify: true
      }
    })
    expect(wrapper.find('.priority-badge').exists()).toBe(true)
    expect(wrapper.find('.priority-badge').text()).toContain('HIGH')
  })

  it('devrait charger et afficher le nom de l\'assigné au montage', async () => {
    const wrapper = mount(IssueCard, {
      props: {
        issue: mockIssue,
        canModify: true
      }
    })
    
    await wrapper.vm.$nextTick()
    
    expect(userService.getUser).toHaveBeenCalledWith(2)
  })

  it('devrait afficher "Non assigné" si pas d\'assigné', async () => {
    const issueWithoutAssignee = { ...mockIssue, assigneeId: undefined }
    const wrapper = mount(IssueCard, {
      props: {
        issue: issueWithoutAssignee,
        canModify: true
      }
    })
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Non assigné')
  })

  it('devrait désactiver les boutons si canModify est false', () => {
    const wrapper = mount(IssueCard, {
      props: {
        issue: mockIssue,
        canModify: false
      }
    })
    
    const buttons = wrapper.findAll('.btn-small')
    buttons.forEach(button => {
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  it('devrait émettre un événement edit quand on clique sur le bouton éditer', async () => {
    const wrapper = mount(IssueCard, {
      props: {
        issue: mockIssue,
        canModify: true
      }
    })
    
    const editButton = wrapper.find('.btn-edit')
    await editButton.trigger('click')
    
    expect(wrapper.emitted('edit')).toBeTruthy()
  })

  it('devrait émettre un événement delete quand on clique sur le bouton supprimer', async () => {
    const wrapper = mount(IssueCard, {
      props: {
        issue: mockIssue,
        canModify: true
      }
    })
    
    const deleteButton = wrapper.find('.btn-delete')
    await deleteButton.trigger('click')
    
    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  it('devrait appliquer la classe correcte selon la priorité', () => {
    const wrapper = mount(IssueCard, {
      props: {
        issue: { ...mockIssue, priority: 'HIGH' },
        canModify: true
      }
    })
    
    expect(wrapper.find('.issue-card').classes()).toContain('priority-high')
  })

  it('devrait ne pas afficher la description si elle n\'existe pas', () => {
    const issueWithoutDescription = { ...mockIssue, description: undefined }
    const wrapper = mount(IssueCard, {
      props: {
        issue: issueWithoutDescription,
        canModify: true
      }
    })
    
    expect(wrapper.find('.description').exists()).toBe(false)
  })
})