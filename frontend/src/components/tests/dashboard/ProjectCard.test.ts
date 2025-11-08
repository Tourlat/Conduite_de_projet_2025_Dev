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
    id: "1",
    name: 'Test Project',
    description: 'Test Description',
    createdAt: '2025-11-01T00:00:00.000Z',
    creator: mockCreator
  }

  it('displays correct badge for creator', () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: mockProject,
        isCreator: true
      }
    })

    const badge = wrapper.find('.project-badge')
    expect(badge.text()).toBe('Créateur')
    expect(badge.classes()).toContain('creator-badge')
  })

  it('displays correct badge for collaborator', () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: mockProject,
        isCreator: false
      }
    })

    const badge = wrapper.find('.project-badge')
    expect(badge.text()).toBe('Collaborateur')
    expect(badge.classes()).toContain('collaborator-badge')
  })

  it('renders project information correctly', () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: mockProject,
        isCreator: true
      }
    })

    expect(wrapper.find('h3').text()).toBe(mockProject.name)
    expect(wrapper.find('.project-description').text()).toBe(mockProject.description)
  })

  it('shows "Pas de description" when description is missing', () => {
    const projectWithoutDescription = { ...mockProject, description: undefined }
    const wrapper = mount(ProjectCard, {
      props: {
        project: projectWithoutDescription,
        isCreator: true
      }
    })

    const description = wrapper.find('.project-description.no-description')
    expect(description.text()).toBe('Pas de description')
  })

  it('shows creation date for creator and creator name for collaborator', () => {
    const creatorWrapper = mount(ProjectCard, {
      props: { project: mockProject, isCreator: true }
    })
    expect(creatorWrapper.find('.project-date').exists()).toBe(true)
    expect(creatorWrapper.text()).toContain('Créé le')

    const collaboratorWrapper = mount(ProjectCard, {
      props: { project: mockProject, isCreator: false }
    })
    expect(collaboratorWrapper.find('.project-creator').exists()).toBe(true)
    expect(collaboratorWrapper.text()).toContain(`Par ${mockProject.creator?.name}`)
  })

  it('emits click event with project when clicked', async () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockProject, isCreator: true }
    })

    await wrapper.find('.project-card').trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toEqual([mockProject])
  })
})

