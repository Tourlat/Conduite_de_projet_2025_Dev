import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskList from '../../tasks/TaskList.vue'

describe('TaskList - Tests simples', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'Tâche Test',
      description: 'Description',
      definitionOfDone: 'DoD',
      status: 'TODO' as const,
      issueId: 1,
      assigneeId: 1,
      createdAt: '2025-11-11T10:00:00Z'
    },
    {
      id: 2,
      title: 'Tâche 2',
      description: 'Description 2',
      definitionOfDone: undefined,
      status: 'IN_PROGRESS' as const,
      issueId: 1,
      assigneeId: 2,
      createdAt: '2025-11-11T11:00:00Z'
    },
    {
      id: 3,
      title: 'Tâche 3',
      description: undefined,
      definitionOfDone: 'DoD 3',
      status: 'DONE' as const,
      issueId: 1,
      assigneeId: undefined,
      createdAt: '2025-11-11T12:00:00Z'
    }
  ]

  const mockUsers = [
    { id: 1, name: 'John', email: 'john@test.com' },
    { id: 2, name: 'Jane', email: 'jane@test.com' }
  ]

  it('devrait afficher les tâches', () => {
    const wrapper = mount(TaskList, {
      props: { tasks: mockTasks, assignableUsers: mockUsers, loading: false, canModify: true }
    })
    expect(wrapper.text()).toContain('Tâche Test')
  })

  it('devrait afficher le chargement', () => {
    const wrapper = mount(TaskList, {
      props: { tasks: [], assignableUsers: mockUsers, loading: true, canModify: true }
    })
    expect(wrapper.find('.loading').exists()).toBe(true)
  })

  it('devrait afficher message vide', () => {
    const wrapper = mount(TaskList, {
      props: { tasks: [], assignableUsers: mockUsers, loading: false, canModify: true }
    })
    expect(wrapper.find('.no-tasks').exists()).toBe(true)
  })

  it('devrait afficher plusieurs tâches', () => {
    const wrapper = mount(TaskList, {
      props: { tasks: mockTasks, assignableUsers: mockUsers, loading: false, canModify: true }
    })
    expect(wrapper.text()).toContain('Tâche Test')
    expect(wrapper.text()).toContain('Tâche 2')
    expect(wrapper.text()).toContain('Tâche 3')
  })

  it('devrait afficher les noms des assignés', () => {
    const wrapper = mount(TaskList, {
      props: { tasks: mockTasks, assignableUsers: mockUsers, loading: false, canModify: true }
    })
    expect(wrapper.text()).toContain('John')
    expect(wrapper.text()).toContain('Jane')
  })

  it('devrait afficher les badges de statut', () => {
    const wrapper = mount(TaskList, {
      props: { tasks: mockTasks, assignableUsers: mockUsers, loading: false, canModify: true }
    })
    const badges = wrapper.findAll('.status-badge')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('devrait afficher la definition of done quand elle existe', () => {
    const wrapper = mount(TaskList, {
      props: { tasks: mockTasks, assignableUsers: mockUsers, loading: false, canModify: true }
    })
    expect(wrapper.text()).toContain('DoD')
  })

  it('ne devrait pas afficher les boutons si canModify est false', () => {
    const wrapper = mount(TaskList, {
      props: { tasks: mockTasks, assignableUsers: mockUsers, loading: false, canModify: false }
    })
    const buttons = wrapper.findAll('.btn-icon')
    expect(buttons.length).toBe(0)
  })

  it('devrait émettre edit au clic sur modifier', async () => {
    const wrapper = mount(TaskList, {
      props: { tasks: mockTasks, assignableUsers: mockUsers, loading: false, canModify: true }
    })
    const buttons = wrapper.findAll('.btn-icon')
    if (buttons.length > 0) {
      await buttons[0]!.trigger('click')
      expect(wrapper.emitted('edit')).toBeTruthy()
    }
  })

  it('devrait émettre delete au clic sur supprimer', async () => {
    const wrapper = mount(TaskList, {
      props: { tasks: mockTasks, assignableUsers: mockUsers, loading: false, canModify: true }
    })
    const buttons = wrapper.findAll('.btn-icon')
    if (buttons.length > 1) {
      await buttons[1]!.trigger('click')
      expect(wrapper.emitted('delete')).toBeTruthy()
    }
  })
})
