import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileCard from '../../dashboard/ProfileCard.vue'

describe('ProfileCard', () => {
  const mockUser = {
    email: 'test@example.com',
    name: 'Test User'
  }

  it('renders user information correctly', () => {
    const wrapper = mount(ProfileCard, {
      props: { user: mockUser }
    })

    expect(wrapper.find('h2').text()).toBe('Profil')
    expect(wrapper.find('.user-email').text()).toBe(mockUser.email)
    expect(wrapper.find('.user-name').text()).toBe(mockUser.name)
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
})

