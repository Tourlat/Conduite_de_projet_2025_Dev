import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileCard from '../../dashboard/ProfileCard.vue'

describe('ProfileCard', () => {
  const mockUser = {
    email: 'test@example.com',
    name: 'Test User'
  }

  it('renders the profile title', () => {
    const wrapper = mount(ProfileCard, {
      props: { user: mockUser }
    })

    expect(wrapper.find('h2').text()).toBe('Profil')
  })

  it('displays user email correctly', () => {
    const wrapper = mount(ProfileCard, {
      props: { user: mockUser }
    })

    const email = wrapper.find('.user-email')
    expect(email.exists()).toBe(true)
    expect(email.text()).toBe(mockUser.email)
  })

  it('displays user name correctly', () => {
    const wrapper = mount(ProfileCard, {
      props: { user: mockUser }
    })

    const name = wrapper.find('.user-name')
    expect(name.exists()).toBe(true)
    expect(name.text()).toBe(mockUser.name)
  })

  it('renders all user information', () => {
    const wrapper = mount(ProfileCard, {
      props: { user: mockUser }
    })

    const text = wrapper.text()
    expect(text).toContain('Profil')
    expect(text).toContain(mockUser.email)
    expect(text).toContain(mockUser.name)
  })

  it('has the correct card structure', () => {
    const wrapper = mount(ProfileCard, {
      props: { user: mockUser }
    })

    expect(wrapper.find('.card').exists()).toBe(true)
    expect(wrapper.find('.card h2').exists()).toBe(true)
  })

  it('renders two paragraphs for email and name', () => {
    const wrapper = mount(ProfileCard, {
      props: { user: mockUser }
    })

    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
  })

  it('applies correct CSS classes to email and name', () => {
    const wrapper = mount(ProfileCard, {
      props: { user: mockUser }
    })

    expect(wrapper.find('.user-email').exists()).toBe(true)
    expect(wrapper.find('.user-name').exists()).toBe(true)
  })

  it('updates when user prop changes', async () => {
    const wrapper = mount(ProfileCard, {
      props: { user: mockUser }
    })

    const newUser = {
      email: 'updated@example.com',
      name: 'Updated User'
    }

    await wrapper.setProps({ user: newUser })

    expect(wrapper.find('.user-email').text()).toBe(newUser.email)
    expect(wrapper.find('.user-name').text()).toBe(newUser.name)
  })

  it('handles empty user name', async () => {
    const userWithEmptyName = {
      email: 'test@example.com',
      name: ''
    }

    const wrapper = mount(ProfileCard, {
      props: { user: userWithEmptyName }
    })

    expect(wrapper.find('.user-name').text()).toBe('')
  })

  it('handles empty user email', async () => {
    const userWithEmptyEmail = {
      email: '',
      name: 'Test User'
    }

    const wrapper = mount(ProfileCard, {
      props: { user: userWithEmptyEmail }
    })

    expect(wrapper.find('.user-email').text()).toBe('')
  })
})
