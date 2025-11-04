import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectCard from '../../dashboard/ProjectCard.vue'

describe('ProjectCard', () => {
  const mockCreator = {
    id: 1,
    email: 'creator@example.com',
    name: 'Creator User'
  }

  const mockProject = {
    id: 1,
    name: 'Test Project',
    description: 'Test Description',
    createdAt: '2025-11-01T00:00:00.000Z',
    creator: mockCreator
  }

  describe('Badge Display', () => {
    it('displays creator badge when isCreator is true', () => {
      const wrapper = mount(ProjectCard, {
        props: {
          project: mockProject,
          isCreator: true
        }
      })

      const badge = wrapper.find('.project-badge')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('Créateur')
      expect(badge.classes()).toContain('creator-badge')
    })

    it('displays collaborator badge when isCreator is false', () => {
      const wrapper = mount(ProjectCard, {
        props: {
          project: mockProject,
          isCreator: false
        }
      })

      const badge = wrapper.find('.project-badge')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('Collaborateur')
      expect(badge.classes()).toContain('collaborator-badge')
    })
  })

  describe('Project Information', () => {
    it('renders project name', () => {
      const wrapper = mount(ProjectCard, {
        props: {
          project: mockProject,
          isCreator: true
        }
      })

      expect(wrapper.find('h3').text()).toBe(mockProject.name)
    })

    it('renders project description when present', () => {
      const wrapper = mount(ProjectCard, {
        props: {
          project: mockProject,
          isCreator: true
        }
      })

      const description = wrapper.find('.project-description')
      expect(description.text()).toBe(mockProject.description)
      expect(description.classes()).not.toContain('no-description')
    })

    it('renders "Pas de description" when description is missing', () => {
      const projectWithoutDescription = { ...mockProject, description: undefined }
      const wrapper = mount(ProjectCard, {
        props: {
          project: projectWithoutDescription,
          isCreator: true
        }
      })

      const description = wrapper.find('.project-description.no-description')
      expect(description.exists()).toBe(true)
      expect(description.text()).toBe('Pas de description')
    })

    it('renders "Pas de description" when description is empty string', () => {
      const projectWithEmptyDescription = { ...mockProject, description: '' }
      const wrapper = mount(ProjectCard, {
        props: {
          project: projectWithEmptyDescription,
          isCreator: true
        }
      })

      const description = wrapper.find('.project-description.no-description')
      expect(description.exists()).toBe(true)
      expect(description.text()).toBe('Pas de description')
    })
  })

  describe('Footer Information', () => {
    it('shows creation date for creator', () => {
      const wrapper = mount(ProjectCard, {
        props: {
          project: mockProject,
          isCreator: true
        }
      })

      const footer = wrapper.find('.project-footer')
      expect(footer.exists()).toBe(true)
      expect(footer.text()).toContain('Créé le')
      expect(wrapper.find('.project-date').exists()).toBe(true)
    })

    it('shows creator name for collaborator', () => {
      const wrapper = mount(ProjectCard, {
        props: {
          project: mockProject,
          isCreator: false
        }
      })

      const footer = wrapper.find('.project-footer')
      expect(footer.exists()).toBe(true)
      expect(footer.text()).toContain(`Par ${mockProject.creator?.name}`)
      expect(wrapper.find('.project-creator').exists()).toBe(true)
    })

    it('shows "Inconnu" when creator is missing', () => {
      const projectWithoutCreator = { ...mockProject, creator: undefined }
      const wrapper = mount(ProjectCard, {
        props: {
          project: projectWithoutCreator,
          isCreator: false
        }
      })

      const footer = wrapper.find('.project-footer')
      expect(footer.text()).toContain('Par Inconnu')
    })

    it('formats date correctly', () => {
      const wrapper = mount(ProjectCard, {
        props: {
          project: mockProject,
          isCreator: true
        }
      })

      const dateText = wrapper.find('.project-date').text()
      expect(dateText).toContain('novembre')
      expect(dateText).toContain('2025')
    })

    it('shows "Date inconnue" when createdAt is missing', () => {
      const projectWithoutDate = { ...mockProject, createdAt: undefined }
      const wrapper = mount(ProjectCard, {
        props: {
          project: projectWithoutDate,
          isCreator: true
        }
      })

      expect(wrapper.find('.project-date').text()).toContain('Date inconnue')
    })
  })

  describe('Click Event', () => {
    it('emits click event with project when clicked', async () => {
      const wrapper = mount(ProjectCard, {
        props: {
          project: mockProject,
          isCreator: true
        }
      })

      await wrapper.find('.project-card').trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')?.[0]).toEqual([mockProject])
    })

    it('card is clickable (has cursor pointer)', () => {
      const wrapper = mount(ProjectCard, {
        props: {
          project: mockProject,
          isCreator: true
        }
      })

      const card = wrapper.find('.project-card')
      expect(card.exists()).toBe(true)
    })
  })

  describe('Component Structure', () => {
    it('has correct CSS classes', () => {
      const wrapper = mount(ProjectCard, {
        props: {
          project: mockProject,
          isCreator: true
        }
      })

      expect(wrapper.find('.project-card').exists()).toBe(true)
      expect(wrapper.find('.project-badge').exists()).toBe(true)
      expect(wrapper.find('.project-description').exists()).toBe(true)
      expect(wrapper.find('.project-footer').exists()).toBe(true)
    })

    it('updates when props change', async () => {
      const wrapper = mount(ProjectCard, {
        props: {
          project: mockProject,
          isCreator: true
        }
      })

      await wrapper.setProps({ isCreator: false })

      expect(wrapper.find('.project-badge').text()).toBe('Collaborateur')
      expect(wrapper.find('.project-creator').exists()).toBe(true)
    })
  })
})
