import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EditTaskForm from '../../tasks/EditTaskForm.vue'
import projectService from '../../../services/projectService'

vi.mock('../../../services/projectService', () => ({
  default: { updateTask: vi.fn() }
}))

describe('EditTaskForm - Tests simples', () => {
  const mockTask = {
    id: 1,
    title: 'Task Test',
    description: 'Description',
    definitionOfDone: 'DoD',
    status: 'TODO' as const,
    issueId: 1,
    assigneeId: 1,
    createdAt: '2025-11-11T10:00:00Z'
  }

  const mockUsers = [
    { id: 1, name: 'John', email: 'john@test.com' },
    { id: 2, name: 'Jane', email: 'jane@test.com' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectService.updateTask).mockResolvedValue({
      ...mockTask,
      title: 'Updated'
    })
  })

  it('devrait afficher le formulaire', async () => {
    const wrapper = mount(EditTaskForm, {
      props: { projectId: 'p1', issueId: 1, task: mockTask, assignableUsers: mockUsers }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('h3').text()).toBe('Modifier la tâche')
  })

  it('devrait pré-remplir les champs', async () => {
    const wrapper = mount(EditTaskForm, {
      props: { projectId: 'p1', issueId: 1, task: mockTask, assignableUsers: mockUsers }
    })
    await wrapper.vm.$nextTick()
    const titleInput = wrapper.find('input#title').element as HTMLInputElement
    expect(titleInput.value).toBe('Task Test')
  })

  it('devrait mettre à jour la tâche', async () => {
    const wrapper = mount(EditTaskForm, {
      props: { projectId: 'p1', issueId: 1, task: mockTask, assignableUsers: mockUsers }
    })
    await wrapper.vm.$nextTick()
    await wrapper.find('input#title').setValue('Modifié')
    await wrapper.find('form').trigger('submit.prevent')
    expect(projectService.updateTask).toHaveBeenCalledWith(
      'p1',
      1,
      1,
      expect.objectContaining({ title: 'Modifié' })
    )
  })

  it('devrait émettre close au clic sur Annuler', async () => {
    const wrapper = mount(EditTaskForm, {
      props: { projectId: 'p1', issueId: 1, task: mockTask, assignableUsers: mockUsers }
    })
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('devrait émettre task-updated après mise à jour', async () => {
    vi.useFakeTimers()
    const wrapper = mount(EditTaskForm, {
      props: { projectId: 'p1', issueId: 1, task: mockTask, assignableUsers: mockUsers }
    })
    await wrapper.vm.$nextTick()
    await wrapper.find('input#title').setValue('Titre modifié')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(500)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('taskUpdated')).toBeTruthy()
    vi.useRealTimers()
  })

  it('devrait modifier la description', async () => {
    const wrapper = mount(EditTaskForm, {
      props: { projectId: 'p1', issueId: 1, task: mockTask, assignableUsers: mockUsers }
    })
    await wrapper.vm.$nextTick()
    await wrapper.find('textarea#description').setValue('Nouvelle description')
    await wrapper.find('form').trigger('submit.prevent')
    expect(projectService.updateTask).toHaveBeenCalledWith(
      'p1',
      1,
      1,
      expect.objectContaining({ description: 'Nouvelle description' })
    )
  })

  it('devrait modifier la definition of done', async () => {
    const wrapper = mount(EditTaskForm, {
      props: { projectId: 'p1', issueId: 1, task: mockTask, assignableUsers: mockUsers }
    })
    await wrapper.vm.$nextTick()
    await wrapper.find('textarea#definitionOfDone').setValue('Nouvelle DoD')
    await wrapper.find('form').trigger('submit.prevent')
    expect(projectService.updateTask).toHaveBeenCalledWith(
      'p1',
      1,
      1,
      expect.objectContaining({ definitionOfDone: 'Nouvelle DoD' })
    )
  })

  it('devrait modifier le status', async () => {
    const wrapper = mount(EditTaskForm, {
      props: { projectId: 'p1', issueId: 1, task: mockTask, assignableUsers: mockUsers }
    })
    await wrapper.vm.$nextTick()
    await wrapper.find('select#status').setValue('DONE')
    await wrapper.find('form').trigger('submit.prevent')
    expect(projectService.updateTask).toHaveBeenCalledWith(
      'p1',
      1,
      1,
      expect.objectContaining({ status: 'DONE' })
    )
  })

  it('devrait modifier l\'assignee', async () => {
    const wrapper = mount(EditTaskForm, {
      props: { projectId: 'p1', issueId: 1, task: mockTask, assignableUsers: mockUsers }
    })
    await wrapper.vm.$nextTick()
    await wrapper.find('select#assignee').setValue('2')
    await wrapper.find('form').trigger('submit.prevent')
    expect(projectService.updateTask).toHaveBeenCalledWith(
      'p1',
      1,
      1,
      expect.objectContaining({ assigneeId: 2 })
    )
  })

  it('devrait valider le titre obligatoire', async () => {
    const wrapper = mount(EditTaskForm, {
      props: { projectId: 'p1', issueId: 1, task: mockTask, assignableUsers: mockUsers }
    })
    await wrapper.vm.$nextTick()
    await wrapper.find('input#title').setValue('')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(projectService.updateTask).not.toHaveBeenCalled()
  })

  it('devrait afficher un message d\'erreur si la mise à jour échoue', async () => {
    vi.mocked(projectService.updateTask).mockRejectedValue(new Error('Erreur de mise à jour'))
    const wrapper = mount(EditTaskForm, {
      props: { projectId: 'p1', issueId: 1, task: mockTask, assignableUsers: mockUsers }
    })
    await wrapper.vm.$nextTick()
    await wrapper.find('input#title').setValue('Titre erreur')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    const message = wrapper.find('.message.error')
    expect(message.exists()).toBe(true)
    expect(message.text()).toContain('Erreur')
  })

  it('devrait pré-remplir tous les champs', async () => {
    const wrapper = mount(EditTaskForm, {
      props: { projectId: 'p1', issueId: 1, task: mockTask, assignableUsers: mockUsers }
    })
    await wrapper.vm.$nextTick()
    const titleInput = wrapper.find('input#title').element as HTMLInputElement
    const descInput = wrapper.find('textarea#description').element as HTMLTextAreaElement
    const dodInput = wrapper.find('textarea#definitionOfDone').element as HTMLTextAreaElement
    const statusInput = wrapper.find('select#status').element as HTMLSelectElement
    const assigneeInput = wrapper.find('select#assignee').element as HTMLSelectElement
    expect(titleInput.value).toBe('Task Test')
    expect(descInput.value).toBe('Description')
    expect(dodInput.value).toBe('DoD')
    expect(statusInput.value).toBe('TODO')
    expect(assigneeInput.value).toBe('1')
  })
})
