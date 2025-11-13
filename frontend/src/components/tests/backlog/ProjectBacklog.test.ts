import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ProjectBacklog from '../../pages/ProjectBacklog.vue'
import BacklogColumn from '../../backlog/BacklogColumn.vue'
import type { IssueResponse } from '../../../services/projectService'

const mockGetIssuesByProject = vi.fn()
const mockGetProjects = vi.fn()

vi.mock('../../../services/projectService', () => ({
  default: {
    getIssuesByProject: () => mockGetIssuesByProject()
  }
}))

vi.mock('../../../stores/projectStore', () => ({
  projectStore: {
    state: {
      projects: []
    },
    getProjects: () => mockGetProjects()
  }
}))

const mockIssues: IssueResponse[] = [
  {
    id: 1,
    title: 'Issue TODO',
    description: 'Description',
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
    title: 'Issue IN_PROGRESS',
    description: 'Description',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    storyPoints: 3,
    assigneeId: undefined,
    projectId: 'project-123',
    creatorId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Issue CLOSED',
    description: 'Description',
    status: 'CLOSED',
    priority: 'LOW',
    storyPoints: 2,
    assigneeId: undefined,
    projectId: 'project-123',
    creatorId: 1,
    createdAt: new Date().toISOString()
  }
]

const createTestRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/projects/:id/backlog',
        component: ProjectBacklog
      }
    ]
  })
}

describe('ProjectBacklog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetIssuesByProject.mockResolvedValue(mockIssues)
    mockGetProjects.mockResolvedValue([
      { id: 'project-123', name: 'Mon Projet', description: 'Description' }
    ])
  })

  it('devrait afficher le titre du backlog avec le nom du projet', async () => {
    const router = createTestRouter()
    await router.push('/projects/project-123/backlog')

    const wrapper = mount(ProjectBacklog, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()

    expect(wrapper.find('h1').text()).toContain('Mon Projet')
  })

  it('devrait afficher un message de chargement', () => {
    const router = createTestRouter()
    const wrapper = mount(ProjectBacklog, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.find('.loading').text()).toBe('Chargement du backlog...')
  })

  it('devrait afficher les 3 colonnes du backlog', async () => {
    const router = createTestRouter()
    await router.push('/projects/project-123/backlog')

    const wrapper = mount(ProjectBacklog, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()

    const columns = wrapper.findAllComponents(BacklogColumn)
    expect(columns).toHaveLength(3)
    expect(columns[0]?.props('title')).toBe('À faire')
    expect(columns[1]?.props('title')).toBe('En cours')
    expect(columns[2]?.props('title')).toBe('Fermé')
  })

  it('devrait filtrer les issues par statut', async () => {
    const router = createTestRouter()
    await router.push('/projects/project-123/backlog')

    const wrapper = mount(ProjectBacklog, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()

    const columns = wrapper.findAllComponents(BacklogColumn)
    expect(columns[0]?.props('issues')).toHaveLength(1)
    expect(columns[1]?.props('issues')).toHaveLength(1)
    expect(columns[2]?.props('issues')).toHaveLength(1)
  })

  it('devrait filtrer les issues par priorité', async () => {
    const router = createTestRouter()
    await router.push('/projects/project-123/backlog')

    const wrapper = mount(ProjectBacklog, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()

    const priorityFilter = wrapper.find('#priority-filter')
    await priorityFilter.setValue('HIGH')
    await wrapper.vm.$nextTick()

    const columns = wrapper.findAllComponents(BacklogColumn)
    const allIssues = columns.flatMap(col => col.props('issues') as IssueResponse[])
    expect(allIssues.every(issue => issue.priority === 'HIGH')).toBe(true)
  })

  it('devrait filtrer les issues assignées', async () => {
    const router = createTestRouter()
    await router.push('/projects/project-123/backlog')

    const wrapper = mount(ProjectBacklog, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()

    const assignmentFilter = wrapper.find('#assignment-filter')
    await assignmentFilter.setValue('assigned')
    await wrapper.vm.$nextTick()

    const columns = wrapper.findAllComponents(BacklogColumn)
    const allIssues = columns.flatMap(col => col.props('issues') as IssueResponse[])
    expect(allIssues.every(issue => issue.assigneeId != null)).toBe(true)
  })

  it('devrait filtrer les issues non assignées', async () => {
    const router = createTestRouter()
    await router.push('/projects/project-123/backlog')

    const wrapper = mount(ProjectBacklog, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()

    const assignmentFilter = wrapper.find('#assignment-filter')
    await assignmentFilter.setValue('unassigned')
    await wrapper.vm.$nextTick()

    const columns = wrapper.findAllComponents(BacklogColumn)
    const allIssues = columns.flatMap(col => col.props('issues') as IssueResponse[])
    expect(allIssues.every(issue => issue.assigneeId == null)).toBe(true)
  })

  it('devrait trier par ordre alphabétique par défaut', async () => {
    const router = createTestRouter()
    await router.push('/projects/project-123/backlog')

    const wrapper = mount(ProjectBacklog, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()

    const sortFilter = wrapper.find('#sort-filter')
    expect((sortFilter.element as HTMLSelectElement).value).toBe('alphabetical')
  })

  it('devrait trier par priorité descendante', async () => {
    const router = createTestRouter()
    await router.push('/projects/project-123/backlog')

    const wrapper = mount(ProjectBacklog, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()

    const sortFilter = wrapper.find('#sort-filter')
    await sortFilter.setValue('priority-desc')
    await wrapper.vm.$nextTick()

    const columns = wrapper.findAllComponents(BacklogColumn)
    const todoIssues = columns[0]?.props('issues') as IssueResponse[]
    
    if (todoIssues && todoIssues.length > 1) {
      const priorities = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      for (let i = 0; i < todoIssues.length - 1; i++) {
        const current = priorities[todoIssues[i]?.priority as keyof typeof priorities]
        const next = priorities[todoIssues[i + 1]?.priority as keyof typeof priorities]
        expect(current).toBeGreaterThanOrEqual(next)
      }
    }
  })

  it('devrait naviguer vers le projet quand on clique sur retour', async () => {
    const router = createTestRouter()
    await router.push('/projects/project-123/backlog')

    const wrapper = mount(ProjectBacklog, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()

    const backButton = wrapper.find('.btn-back')
    await backButton.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/projects/project-123')
  })
})
