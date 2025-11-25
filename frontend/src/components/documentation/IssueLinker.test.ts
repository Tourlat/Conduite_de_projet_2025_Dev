import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import IssueLinker from './IssueLinker.vue'
import type { DocumentationIssueDto } from '../../services/documentationIssueService'

describe('IssueLinker', () => {
  const mockLinkedIssues: DocumentationIssueDto[] = [
    {
      id: 1,
      documentationId: 10,
      issueId: 100,
      issueTitle: 'Issue 1',
      issuePriority: 'HIGH',
      issueStatus: 'OPEN'
    },
    {
      id: 2,
      documentationId: 10,
      issueId: 101,
      issueTitle: 'Issue 2',
      issuePriority: 'MEDIUM',
      issueStatus: 'IN_PROGRESS'
    }
  ]

  const mockAvailableIssues = [
    { id: 100, title: 'Issue 1', priority: 'HIGH', status: 'OPEN' },
    { id: 101, title: 'Issue 2', priority: 'MEDIUM', status: 'IN_PROGRESS' },
    { id: 102, title: 'Issue 3', priority: 'LOW', status: 'CLOSED' },
    { id: 103, title: 'Issue 4', priority: 'HIGH', status: 'OPEN' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders linked issues correctly', () => {
    const wrapper = mount(IssueLinker, {
      props: {
        linkedIssues: mockLinkedIssues,
        availableIssues: mockAvailableIssues
      }
    })

    expect(wrapper.text()).toContain('Issue 1')
    expect(wrapper.text()).toContain('Issue 2')
    expect(wrapper.text()).toContain('HIGH')
    expect(wrapper.text()).toContain('MEDIUM')
    expect(wrapper.text()).toContain('OPEN')
    expect(wrapper.text()).toContain('IN_PROGRESS')
  })

  it('displays "Aucune issue liée" when no issues are linked', () => {
    const wrapper = mount(IssueLinker, {
      props: {
        linkedIssues: [],
        availableIssues: mockAvailableIssues
      }
    })

    expect(wrapper.text()).toContain('Aucune issue liée')
  })

  it('filters out already linked issues from available issues', () => {
    const wrapper = mount(IssueLinker, {
      props: {
        linkedIssues: mockLinkedIssues,
        availableIssues: mockAvailableIssues
      }
    })

    const select = wrapper.find('select')
    const options = select.findAll('option')
    
    // Should have placeholder + 2 available issues (not the 2 linked ones)
    expect(options).toHaveLength(3) // 1 placeholder + 2 unlinked issues
    
    // Check that linked issues are NOT in the select
    const optionTexts = options.map(opt => opt.text())
    expect(optionTexts).not.toContain('Issue 1 (HIGH)')
    expect(optionTexts).not.toContain('Issue 2 (MEDIUM)')
    
    // Check that unlinked issues ARE in the select
    expect(optionTexts).toContain('Issue 3 (LOW)')
    expect(optionTexts).toContain('Issue 4 (HIGH)')
  })

  it('emits link event when link button is clicked', async () => {
    const wrapper = mount(IssueLinker, {
      props: {
        linkedIssues: [],
        availableIssues: mockAvailableIssues
      }
    })

    const select = wrapper.find('select')
    await select.setValue(102)

    const linkButton = wrapper.find('.btn-link')
    await linkButton.trigger('click')

    expect(wrapper.emitted('link')).toBeTruthy()
    expect(wrapper.emitted('link')?.[0]).toEqual([102])
  })

  it('clears selection after emitting link event', async () => {
    const wrapper = mount(IssueLinker, {
      props: {
        linkedIssues: [],
        availableIssues: mockAvailableIssues
      }
    })

    const select = wrapper.find('select')
    await select.setValue(102)

    const linkButton = wrapper.find('.btn-link')
    await linkButton.trigger('click')

    // Selection should be cleared after emission
    await wrapper.vm.$nextTick()
    expect((select.element as HTMLSelectElement).value).toBe('')
  })

  it('disables link button when no issue is selected', () => {
    const wrapper = mount(IssueLinker, {
      props: {
        linkedIssues: [],
        availableIssues: mockAvailableIssues
      }
    })

    const linkButton = wrapper.find('.btn-link')
    expect(linkButton.attributes('disabled')).toBeDefined()
  })

  it('enables link button when an issue is selected', async () => {
    const wrapper = mount(IssueLinker, {
      props: {
        linkedIssues: [],
        availableIssues: mockAvailableIssues
      }
    })

    const select = wrapper.find('select')
    await select.setValue(102)

    const linkButton = wrapper.find('.btn-link')
    expect(linkButton.attributes('disabled')).toBeUndefined()
  })

  it('shows confirmation and emits unlink event when unlink button is clicked', async () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = mount(IssueLinker, {
      props: {
        linkedIssues: mockLinkedIssues,
        availableIssues: mockAvailableIssues
      }
    })

    const unlinkButtons = wrapper.findAll('.btn-unlink')
    expect(unlinkButtons.length).toBeGreaterThan(0)
    await unlinkButtons[0]!.trigger('click')

    expect(confirmSpy).toHaveBeenCalledWith('Êtes-vous sûr de vouloir délier cette issue ?')
    expect(wrapper.emitted('unlink')).toBeTruthy()
    expect(wrapper.emitted('unlink')?.[0]).toEqual([100])

    confirmSpy.mockRestore()
  })

  it('does not emit unlink event when confirmation is cancelled', async () => {
    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    const wrapper = mount(IssueLinker, {
      props: {
        linkedIssues: mockLinkedIssues,
        availableIssues: mockAvailableIssues
      }
    })

    const unlinkButtons = wrapper.findAll('.btn-unlink')
    expect(unlinkButtons.length).toBeGreaterThan(0)
    await unlinkButtons[0]!.trigger('click')

    expect(confirmSpy).toHaveBeenCalled()
    expect(wrapper.emitted('unlink')).toBeFalsy()

    confirmSpy.mockRestore()
  })

  it('applies correct CSS classes for priority badges', () => {
    const wrapper = mount(IssueLinker, {
      props: {
        linkedIssues: mockLinkedIssues,
        availableIssues: mockAvailableIssues
      }
    })

    const priorityBadges = wrapper.findAll('.issue-priority')
    expect(priorityBadges.length).toBeGreaterThanOrEqual(2)
    expect(priorityBadges[0]!.classes()).toContain('priority-high')
    expect(priorityBadges[1]!.classes()).toContain('priority-medium')
  })

  it('applies correct CSS classes for status badges', () => {
    const wrapper = mount(IssueLinker, {
      props: {
        linkedIssues: mockLinkedIssues,
        availableIssues: mockAvailableIssues
      }
    })

    const statusBadges = wrapper.findAll('.issue-status')
    expect(statusBadges.length).toBeGreaterThanOrEqual(2)
    expect(statusBadges[0]!.classes()).toContain('status-open')
    expect(statusBadges[1]!.classes()).toContain('status-in_progress')
  })
})
