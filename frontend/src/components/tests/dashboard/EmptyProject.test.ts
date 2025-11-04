import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import EmptyProject from '../../dashboard/EmptyProject.vue'

describe('EmptyProject', () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/projects', component: { template: '<div>Projects</div>' } }
    ]
  })

  it('displays the provided message', () => {
    const wrapper = mount(EmptyProject, {
      props: { message: 'Vous n\'avez créé aucun projet pour le moment.' },
      global: { plugins: [router] }
    })

    expect(wrapper.find('p').text()).toBe('Vous n\'avez créé aucun projet pour le moment.')
  })

  it('shows create button when showCreateButton is true', () => {
    const wrapper = mount(EmptyProject, {
      props: {
        message: 'Test message',
        showCreateButton: true
      },
      global: { plugins: [router] }
    })

    expect(wrapper.find('.btn').exists()).toBe(true)
    expect(wrapper.find('.btn').text()).toBe('Créer un projet')
    expect(wrapper.find('.btn').attributes('to')).toBe('/projects')
  })

  it('hides create button when showCreateButton is false or undefined', () => {
    const wrapper1 = mount(EmptyProject, {
      props: { message: 'Test', showCreateButton: false },
      global: { plugins: [router] }
    })
    expect(wrapper1.find('.btn').exists()).toBe(false)

    const wrapper2 = mount(EmptyProject, {
      props: { message: 'Test' },
      global: { plugins: [router] }
    })
    expect(wrapper2.find('.btn').exists()).toBe(false)
  })

  it('updates when props change', async () => {
    const wrapper = mount(EmptyProject, {
      props: { message: 'Initial', showCreateButton: false },
      global: { plugins: [router] }
    })

    await wrapper.setProps({ message: 'Updated', showCreateButton: true })

    expect(wrapper.find('p').text()).toBe('Updated')
    expect(wrapper.find('.btn').exists()).toBe(true)
  })
})
