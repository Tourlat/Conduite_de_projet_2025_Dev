import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CreateTaskForm from '../../tasks/CreateTaskForm.vue'
import projectService from '../../../services/projectService'

vi.mock('../../../services/projectService', () => ({
  default: { createTask: vi.fn() }
}))

describe('CreateTaskForm - Tests simples', () => {
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@test.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@test.com' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectService.createTask).mockResolvedValue({
      id: 1,
      title: 'Test',
      description: 'Desc',
      status: 'TODO',
      issueId: 1,
      createdAt: '2025-11-11T10:00:00Z'
    })
  })

  it('devrait afficher le formulaire', () => {
    const wrapper = mount(CreateTaskForm, {
      props: { projectId: 'p1', issueId: 1, assignableUsers: mockUsers }
    })
    expect(wrapper.find('h3').text()).toBe('Créer une nouvelle tâche')
    expect(wrapper.find('input#title').exists()).toBe(true)
  })

  it('devrait valider le titre obligatoire', async () => {
    const wrapper = mount(CreateTaskForm, {
      props: { projectId: 'p1', issueId: 1, assignableUsers: mockUsers }
    })
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(projectService.createTask).not.toHaveBeenCalled()
  })

  it('devrait créer une tâche', async () => {
    const wrapper = mount(CreateTaskForm, {
      props: { projectId: 'p1', issueId: 1, assignableUsers: mockUsers }
    })
    await wrapper.find('input#title').setValue('Ma tâche')
    await wrapper.find('form').trigger('submit.prevent')
    expect(projectService.createTask).toHaveBeenCalledWith(
      'p1',
      1,
      expect.objectContaining({ title: 'Ma tâche' })
    )
  })

  it('devrait afficher la liste des assignables', () => {
    const wrapper = mount(CreateTaskForm, {
      props: { projectId: 'p1', issueId: 1, assignableUsers: mockUsers }
    })
    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('Jane Smith')
  })

  it('devrait émettre close après annulation', async () => {
    const wrapper = mount(CreateTaskForm, {
      props: { projectId: 'p1', issueId: 1, assignableUsers: mockUsers }
    })
    const btnCancel = wrapper.find('.btn-cancel')
    await btnCancel.trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('devrait émettre task-created après création', async () => {
    vi.useFakeTimers()
    const wrapper = mount(CreateTaskForm, {
      props: { projectId: 'p1', issueId: 1, assignableUsers: mockUsers }
    })
    await wrapper.find('input#title').setValue('Nouvelle tâche')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(500)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('taskCreated')).toBeTruthy()
    vi.useRealTimers()
  })

  it('devrait créer une tâche avec description', async () => {
    const wrapper = mount(CreateTaskForm, {
      props: { projectId: 'p1', issueId: 1, assignableUsers: mockUsers }
    })
    await wrapper.find('input#title').setValue('Tâche avec desc')
    await wrapper.find('textarea#description').setValue('Ma description')
    await wrapper.find('form').trigger('submit.prevent')
    expect(projectService.createTask).toHaveBeenCalledWith(
      'p1',
      1,
      expect.objectContaining({ title: 'Tâche avec desc', description: 'Ma description' })
    )
  })

  it('devrait créer une tâche avec definition of done', async () => {
    const wrapper = mount(CreateTaskForm, {
      props: { projectId: 'p1', issueId: 1, assignableUsers: mockUsers }
    })
    await wrapper.find('input#title').setValue('Tâche avec DoD')
    await wrapper.find('textarea#definitionOfDone').setValue('Ma DoD')
    await wrapper.find('form').trigger('submit.prevent')
    expect(projectService.createTask).toHaveBeenCalledWith(
      'p1',
      1,
      expect.objectContaining({ title: 'Tâche avec DoD', definitionOfDone: 'Ma DoD' })
    )
  })

  it('devrait créer une tâche avec assignee', async () => {
    const wrapper = mount(CreateTaskForm, {
      props: { projectId: 'p1', issueId: 1, assignableUsers: mockUsers }
    })
    await wrapper.find('input#title').setValue('Tâche assignée')
    await wrapper.find('select#assignee').setValue('1')
    await wrapper.find('form').trigger('submit.prevent')
    expect(projectService.createTask).toHaveBeenCalledWith(
      'p1',
      1,
      expect.objectContaining({ title: 'Tâche assignée', assigneeId: 1 })
    )
  })

  it('devrait créer une tâche avec status', async () => {
    const wrapper = mount(CreateTaskForm, {
      props: { projectId: 'p1', issueId: 1, assignableUsers: mockUsers }
    })
    await wrapper.find('input#title').setValue('Tâche en cours')
    await wrapper.find('select#status').setValue('IN_PROGRESS')
    await wrapper.find('form').trigger('submit.prevent')
    expect(projectService.createTask).toHaveBeenCalledWith(
      'p1',
      1,
      expect.objectContaining({ title: 'Tâche en cours', status: 'IN_PROGRESS' })
    )
  })

  it('devrait afficher un message d\'erreur si la création échoue', async () => {
    vi.mocked(projectService.createTask).mockRejectedValue(new Error('Erreur de création'))
    const wrapper = mount(CreateTaskForm, {
      props: { projectId: 'p1', issueId: 1, assignableUsers: mockUsers }
    })
    await wrapper.find('input#title').setValue('Tâche erreur')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    const message = wrapper.find('.message.error')
    expect(message.exists()).toBe(true)
    expect(message.text()).toContain('Erreur')
  })

  it('devrait réinitialiser le formulaire après création', async () => {
    vi.useFakeTimers()
    const wrapper = mount(CreateTaskForm, {
      props: { projectId: 'p1', issueId: 1, assignableUsers: mockUsers }
    })
    await wrapper.find('input#title').setValue('Tâche reset')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    const titleInput = wrapper.find('input#title').element as HTMLInputElement
    expect(titleInput.value).toBe('')
    vi.useRealTimers()
  })
})
