import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import TaskDetails from '../../tasks/TaskDetails.vue'
import projectService from '../../../services/projectService'

vi.mock('../../../services/projectService', () => ({
  default: { getTasksByIssue: vi.fn(), deleteTask: vi.fn() }
}))

describe('TaskDetails - Tests simples', () => {
  const mockTasks = [
    {
      id: 1, title: 'Tâche TODO', description: 'Description TODO', definitionOfDone: 'DoD TODO',
      status: 'TODO' as const, issueId: 1, assigneeId: 1, createdAt: '2025-11-11T10:00:00Z'
    },
    {
      id: 2, title: 'Tâche IN_PROGRESS', description: 'Description IN_PROGRESS', definitionOfDone: 'DoD IN_PROGRESS',
      status: 'IN_PROGRESS' as const, issueId: 1, assigneeId: 2, createdAt: '2025-11-12T10:00:00Z'
    },
    {
      id: 3, title: 'Tâche DONE', description: undefined, definitionOfDone: 'DoD DONE',
      status: 'DONE' as const, issueId: 1, assigneeId: undefined, createdAt: '2025-11-13T10:00:00Z'
    }
  ]
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@test.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@test.com' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectService.getTasksByIssue).mockResolvedValue(mockTasks)
  })

  it('devrait charger les tâches', async () => {
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: true, assignableUsers: mockUsers }
    })
    await flushPromises()
    expect(projectService.getTasksByIssue).toHaveBeenCalledWith('p1', 1)
  })

  it('devrait afficher le bouton ajouter', async () => {
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: true, assignableUsers: mockUsers }
    })
    await flushPromises()
    expect(wrapper.find('.btn-toggle').exists()).toBe(true)
  })

  it('devrait passer les tâches au composant TaskList', async () => {
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: true, assignableUsers: mockUsers }
    })
    await flushPromises()
    const taskList = wrapper.findComponent({ name: 'TaskList' })
    expect(taskList.exists()).toBe(true)
    expect(taskList.props('tasks')).toEqual(mockTasks)
  })

  it('devrait passer les utilisateurs au composant TaskList', async () => {
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: true, assignableUsers: mockUsers }
    })
    await flushPromises()
    const taskList = wrapper.findComponent({ name: 'TaskList' })
    expect(taskList.props('assignableUsers')).toEqual(mockUsers)
  })

  it('devrait passer canModify au composant TaskList', async () => {
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: false, assignableUsers: mockUsers }
    })
    await flushPromises()
    const taskList = wrapper.findComponent({ name: 'TaskList' })
    expect(taskList.props('canModify')).toBe(false)
  })

  it('devrait afficher état de chargement', async () => {
    let resolvePromise: any
    vi.mocked(projectService.getTasksByIssue).mockImplementation(() => new Promise((resolve) => {
      resolvePromise = resolve
    }))
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: true, assignableUsers: mockUsers }
    })
    await wrapper.vm.$nextTick()
    const taskList = wrapper.findComponent({ name: 'TaskList' })
    expect(taskList.props('loading')).toBe(true)
    resolvePromise(mockTasks)
    await flushPromises()
  })

  it('devrait ouvrir le formulaire de création', async () => {
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: true, assignableUsers: mockUsers }
    })
    await flushPromises()
    const btnToggle = wrapper.find('.btn-toggle')
    await btnToggle.trigger('click')
    const createForm = wrapper.findComponent({ name: 'CreateTaskForm' })
    expect(createForm.exists()).toBe(true)
  })

  it('devrait fermer le formulaire de création après annulation', async () => {
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: true, assignableUsers: mockUsers }
    })
    await flushPromises()
    await wrapper.find('.btn-toggle').trigger('click')
    const createForm = wrapper.findComponent({ name: 'CreateTaskForm' })
    await createForm.vm.$emit('cancel')
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent({ name: 'CreateTaskForm' }).exists()).toBe(false)
  })

  it('devrait recharger les tâches après création', async () => {
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: true, assignableUsers: mockUsers }
    })
    await flushPromises()
    vi.clearAllMocks()
    await wrapper.find('.btn-toggle').trigger('click')
    const createForm = wrapper.findComponent({ name: 'CreateTaskForm' })
    await createForm.vm.$emit('task-created')
    await flushPromises()
    expect(projectService.getTasksByIssue).toHaveBeenCalledWith('p1', 1)
  })

  it('devrait ouvrir le formulaire d\'édition', async () => {
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: true, assignableUsers: mockUsers }
    })
    await flushPromises()
    const taskList = wrapper.findComponent({ name: 'TaskList' })
    await taskList.vm.$emit('edit', mockTasks[0])
    await wrapper.vm.$nextTick()
    const editForm = wrapper.findComponent({ name: 'EditTaskForm' })
    expect(editForm.exists()).toBe(true)
    expect(editForm.props('task')).toEqual(mockTasks[0])
  })

  it('devrait fermer le formulaire d\'édition après annulation', async () => {
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: true, assignableUsers: mockUsers }
    })
    await flushPromises()
    const taskList = wrapper.findComponent({ name: 'TaskList' })
    await taskList.vm.$emit('edit', mockTasks[0])
    await wrapper.vm.$nextTick()
    const editForm = wrapper.findComponent({ name: 'EditTaskForm' })
    await editForm.vm.$emit('close')
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent({ name: 'EditTaskForm' }).exists()).toBe(false)
  })

  it('devrait recharger les tâches après mise à jour', async () => {
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: true, assignableUsers: mockUsers }
    })
    await flushPromises()
    vi.clearAllMocks()
    const taskList = wrapper.findComponent({ name: 'TaskList' })
    await taskList.vm.$emit('edit', mockTasks[0])
    await wrapper.vm.$nextTick()
    const editForm = wrapper.findComponent({ name: 'EditTaskForm' })
    await editForm.vm.$emit('task-updated')
    await flushPromises()
    expect(projectService.getTasksByIssue).toHaveBeenCalledWith('p1', 1)
  })

  it('devrait supprimer une tâche', async () => {
    vi.mocked(projectService.deleteTask).mockResolvedValue(undefined)
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: true, assignableUsers: mockUsers }
    })
    await flushPromises()
    vi.clearAllMocks()
    const taskList = wrapper.findComponent({ name: 'TaskList' })
    // Simuler l'émission de delete avec un objet tâche complet
    await taskList.vm.$emit('delete', mockTasks[0])
    await wrapper.vm.$nextTick()
    const deleteModal = wrapper.find('.delete-modal')
    expect(deleteModal.exists()).toBe(true)
    // Trouver le bouton de suppression et le cliquer
    const modalContent = wrapper.find('.delete-modal .modal-content')
    const btnDelete = modalContent.find('.btn-delete')
    expect(btnDelete.exists()).toBe(true)
    await btnDelete.trigger('click')
    await flushPromises()
    expect(projectService.deleteTask).toHaveBeenCalledWith('p1', 1, 1)
    expect(projectService.getTasksByIssue).toHaveBeenCalledWith('p1', 1)
  })

  it('ne devrait pas afficher le bouton ajouter si canModify est false', async () => {
    const wrapper = mount(TaskDetails, {
      props: { projectId: 'p1', issueId: 1, canModify: false, assignableUsers: mockUsers }
    })
    await flushPromises()
    expect(wrapper.find('.btn-toggle').exists()).toBe(true)
  })
})
