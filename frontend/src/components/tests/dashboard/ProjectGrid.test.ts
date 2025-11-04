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
      id: 1,
      name: 'Project 1',
      description: 'Description 1',
      createdAt: '2025-11-01T00:00:00.000Z',
      creator: mockCreator1
    },
    {
      id: 2,
      name: 'Project 2',
      description: 'Description 2',
      createdAt: '2025-11-02T00:00:00.000Z',
      creator: mockCreator2
    },
    {
      id: 3,
      name: 'Project 3',
      description: 'Description 3',
      createdAt: '2025-11-03T00:00:00.000Z',
      creator: mockCreator1
    }
  ]

  describe('Rendering', () => {
    it('renders the projects grid container', () => {
      const wrapper = mount(ProjectGrid, {
        props: {
          projects: mockProjects,
          currentUserId: 1
        }
      })

      expect(wrapper.find('.projects-grid').exists()).toBe(true)
    })

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

      const projectCards = wrapper.findAllComponents(ProjectCard)
      expect(projectCards.length).toBe(0)
    })
  })

  describe('ProjectCard Props', () => {
    it('passes correct project prop to each ProjectCard', () => {
      const wrapper = mount(ProjectGrid, {
        props: {
          projects: mockProjects,
          currentUserId: 1
        }
      })

      const projectCards = wrapper.findAllComponents(ProjectCard)
      
      projectCards.forEach((card, index) => {
        expect(card.props('project')).toEqual(mockProjects[index])
      })
    })

    it('passes isCreator as true when project creator matches currentUserId', () => {
      const wrapper = mount(ProjectGrid, {
        props: {
          projects: mockProjects,
          currentUserId: 1
        }
      })

      const projectCards = wrapper.findAllComponents(ProjectCard)
      
      // Project 1 and 3 are created by user 1
      expect(projectCards[0]!.props('isCreator')).toBe(true)
      expect(projectCards[1]!.props('isCreator')).toBe(false)
      expect(projectCards[2]!.props('isCreator')).toBe(true)
    })

    it('passes isCreator as false when project creator does not match currentUserId', () => {
      const wrapper = mount(ProjectGrid, {
        props: {
          projects: mockProjects,
          currentUserId: 2
        }
      })

      const projectCards = wrapper.findAllComponents(ProjectCard)
      
      // Only Project 2 is created by user 2
      expect(projectCards[0]!.props('isCreator')).toBe(false)
      expect(projectCards[1]!.props('isCreator')).toBe(true)
      expect(projectCards[2]!.props('isCreator')).toBe(false)
    })

    it('handles projects without creator', () => {
      const projectsWithoutCreator = [
        {
          id: 1,
          name: 'Project Without Creator',
          description: 'Test',
          createdAt: '2025-11-01T00:00:00.000Z',
          creator: undefined
        }
      ]

      const wrapper = mount(ProjectGrid, {
        props: {
          projects: projectsWithoutCreator,
          currentUserId: 1
        }
      })

      const projectCards = wrapper.findAllComponents(ProjectCard)
      expect(projectCards[0]!.props('isCreator')).toBe(false)
    })
  })

  describe('Event Handling', () => {
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

    it('emits project-click with correct project for each card', async () => {
      const wrapper = mount(ProjectGrid, {
        props: {
          projects: mockProjects,
          currentUserId: 1
        }
      })

      const projectCards = wrapper.findAllComponents(ProjectCard)

      // Click on second project
      await projectCards[1]!.vm.$emit('click', mockProjects[1])

      expect(wrapper.emitted('project-click')?.[0]).toEqual([mockProjects[1]])
    })

    it('handles multiple clicks correctly', async () => {
      const wrapper = mount(ProjectGrid, {
        props: {
          projects: mockProjects,
          currentUserId: 1
        }
      })

      const projectCards = wrapper.findAllComponents(ProjectCard)

      // Click on first project
      await projectCards[0]!.vm.$emit('click', mockProjects[0])
      
      // Click on second project
      await projectCards[1]!.vm.$emit('click', mockProjects[1])

      const emittedEvents = wrapper.emitted('project-click')
      expect(emittedEvents?.length).toBe(2)
      expect(emittedEvents?.[0]).toEqual([mockProjects[0]])
      expect(emittedEvents?.[1]).toEqual([mockProjects[1]])
    })
  })

  describe('Props Updates', () => {
    it('updates ProjectCard components when projects prop changes', async () => {
      const wrapper = mount(ProjectGrid, {
        props: {
          projects: [mockProjects[0]!],
          currentUserId: 1
        }
      })

      expect(wrapper.findAllComponents(ProjectCard).length).toBe(1)

      await wrapper.setProps({ projects: mockProjects })

      expect(wrapper.findAllComponents(ProjectCard).length).toBe(3)
    })

    it('updates isCreator when currentUserId changes', async () => {
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

  describe('Key Attribute', () => {
    it('uses project id as key for each ProjectCard', () => {
      const wrapper = mount(ProjectGrid, {
        props: {
          projects: mockProjects,
          currentUserId: 1
        }
      })

      const projectCards = wrapper.findAllComponents(ProjectCard)
      
      projectCards.forEach((card, index) => {
        // Vue Test Utils doesn't directly expose the key, but we can verify
        // that each card has a unique project prop with an id
        expect(card.props('project').id).toBe(mockProjects[index]!.id)
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles single project', () => {
      const wrapper = mount(ProjectGrid, {
        props: {
          projects: [mockProjects[0]!],
          currentUserId: 1
        }
      })

      const projectCards = wrapper.findAllComponents(ProjectCard)
      expect(projectCards.length).toBe(1)
      expect(projectCards[0]!.props('project')).toEqual(mockProjects[0])
    })

    it('handles large number of projects', () => {
      const manyProjects = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Project ${i + 1}`,
        description: `Description ${i + 1}`,
        createdAt: '2025-11-01T00:00:00.000Z',
        creator: mockCreator1
      }))

      const wrapper = mount(ProjectGrid, {
        props: {
          projects: manyProjects,
          currentUserId: 1
        }
      })

      const projectCards = wrapper.findAllComponents(ProjectCard)
      expect(projectCards.length).toBe(20)
    })

    it('handles currentUserId of 0', () => {
      const wrapper = mount(ProjectGrid, {
        props: {
          projects: mockProjects,
          currentUserId: 0
        }
      })

      const projectCards = wrapper.findAllComponents(ProjectCard)
      // All projects should show isCreator as false
      projectCards.forEach(card => {
        expect(card.props('isCreator')).toBe(false)
      })
    })
  })
})
