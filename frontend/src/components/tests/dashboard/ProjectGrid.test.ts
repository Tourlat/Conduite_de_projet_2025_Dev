import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectGrid from '../../dashboard/ProjectGrid.vue'
import ProjectCard from '../../dashboard/ProjectCard.vue'

describe('ProjectGrid', () => {
  const mockCreator1 = {
    id: 1,
    email: 'creator1@example.com',
    name: 'Creator One'
  }

  const mockCreator2 = {
    id: 2,
    email: 'creator2@example.com',
    name: 'Creator Two'
  }

  const mockProjects = [
    {
      id: "1",
      name: 'Project 1',
      description: 'Description 1',
      createdAt: '2025-11-01T00:00:00.000Z',
      creator: mockCreator1
    },
    {
      id: "2",
      name: 'Project 2',
      description: 'Description 2',
      createdAt: '2025-11-02T00:00:00.000Z',
      creator: mockCreator2
    },
    {
      id: "3",
      name: 'Project 3',
      description: 'Description 3',
      createdAt: '2025-11-03T00:00:00.000Z',
      creator: mockCreator1
    }
  ]

  it('renders correct number of ProjectCard components', () => {
    const wrapper = mount(ProjectGrid, {
      props: {
        projects: mockProjects,
        currentUserId: 1
      }
    })

    const projectCards = wrapper.findAllComponents(ProjectCard)
    expect(projectCards.length).toBe(3)
  })

  it('renders no ProjectCard when projects array is empty', () => {
    const wrapper = mount(ProjectGrid, {
      props: {
        projects: [],
        currentUserId: 1
      }
    })

    expect(wrapper.findAllComponents(ProjectCard).length).toBe(0)
  })

  it('passes correct isCreator prop based on currentUserId', () => {
    const wrapper = mount(ProjectGrid, {
      props: {
        projects: mockProjects,
        currentUserId: 1
      }
    })

    const projectCards = wrapper.findAllComponents(ProjectCard)
    
    // Projects 1 and 3 are created by user 1
    expect(projectCards[0]!.props('isCreator')).toBe(true)
    expect(projectCards[1]!.props('isCreator')).toBe(false)
    expect(projectCards[2]!.props('isCreator')).toBe(true)
  })

  it('emits project-click event when ProjectCard is clicked', async () => {
    const wrapper = mount(ProjectGrid, {
      props: {
        projects: mockProjects,
        currentUserId: 1
      }
    })

    const firstCard = wrapper.findAllComponents(ProjectCard)[0]!
    await firstCard.vm.$emit('click', mockProjects[0])

    expect(wrapper.emitted('project-click')).toBeTruthy()
    expect(wrapper.emitted('project-click')?.[0]).toEqual([mockProjects[0]])
  })

  it('updates when currentUserId changes', async () => {
    const wrapper = mount(ProjectGrid, {
      props: {
        projects: mockProjects,
        currentUserId: 1
      }
    })

    let projectCards = wrapper.findAllComponents(ProjectCard)
    expect(projectCards[0]!.props('isCreator')).toBe(true)

    await wrapper.setProps({ currentUserId: 2 })

    projectCards = wrapper.findAllComponents(ProjectCard)
    expect(projectCards[0]!.props('isCreator')).toBe(false)
    expect(projectCards[1]!.props('isCreator')).toBe(true)
  })
})

