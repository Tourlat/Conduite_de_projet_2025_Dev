import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import EmptyProject from '../../dashboard/EmptyProject.vue'

describe('EmptyProject', () => {
  // Create a simple router for testing
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/projects', component: { template: '<div>Projects</div>' } }
    ]
  })

  describe('Message Display', () => {
    it('displays the provided message', () => {
      const testMessage = 'Vous n\'avez créé aucun projet pour le moment.'
      const wrapper = mount(EmptyProject, {
        props: {
          message: testMessage
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('p').text()).toBe(testMessage)
    })

    it('displays different messages correctly', () => {
      const message1 = 'Aucun projet trouvé.'
      const wrapper1 = mount(EmptyProject, {
        props: {
          message: message1
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper1.find('p').text()).toBe(message1)

      const message2 = 'Vous n\'êtes collaborateur sur aucun projet.'
      const wrapper2 = mount(EmptyProject, {
        props: {
          message: message2
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper2.find('p').text()).toBe(message2)
    })

    it('handles empty message', () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: ''
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('p').text()).toBe('')
    })
  })

  describe('Create Button', () => {
    it('shows create button when showCreateButton is true', () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Test message',
          showCreateButton: true
        },
        global: {
          plugins: [router]
        }
      })

      const button = wrapper.find('.btn')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('Créer un projet')
    })

    it('hides create button when showCreateButton is false', () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Test message',
          showCreateButton: false
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('.btn').exists()).toBe(false)
    })

    it('hides create button when showCreateButton is undefined', () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Test message'
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('.btn').exists()).toBe(false)
    })

    it('button links to /projects route', () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Test message',
          showCreateButton: true
        },
        global: {
          plugins: [router]
        }
      })

      const link = wrapper.find('.btn')
      expect(link.attributes('to')).toBe('/projects')
    })

    it('button is a router-link component', () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Test message',
          showCreateButton: true
        },
        global: {
          plugins: [router]
        }
      })

      const routerLink = wrapper.findComponent({ name: 'RouterLink' })
      expect(routerLink.exists()).toBe(true)
    })
  })

  describe('Component Structure', () => {
    it('has the correct container class', () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Test message'
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('.no-projects').exists()).toBe(true)
    })

    it('renders message inside a paragraph', () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Test message'
        },
        global: {
          plugins: [router]
        }
      })

      const paragraph = wrapper.find('.no-projects p')
      expect(paragraph.exists()).toBe(true)
    })

    it('has correct structure with button', () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Test message',
          showCreateButton: true
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('.no-projects').exists()).toBe(true)
      expect(wrapper.find('.no-projects p').exists()).toBe(true)
      expect(wrapper.find('.no-projects .btn').exists()).toBe(true)
    })

    it('has correct structure without button', () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Test message',
          showCreateButton: false
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('.no-projects').exists()).toBe(true)
      expect(wrapper.find('.no-projects p').exists()).toBe(true)
      expect(wrapper.find('.no-projects .btn').exists()).toBe(false)
    })
  })

  describe('Props Updates', () => {
    it('updates message when prop changes', async () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Initial message'
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('p').text()).toBe('Initial message')

      await wrapper.setProps({ message: 'Updated message' })

      expect(wrapper.find('p').text()).toBe('Updated message')
    })

    it('shows button when showCreateButton changes to true', async () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Test message',
          showCreateButton: false
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('.btn').exists()).toBe(false)

      await wrapper.setProps({ showCreateButton: true })

      expect(wrapper.find('.btn').exists()).toBe(true)
    })

    it('hides button when showCreateButton changes to false', async () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Test message',
          showCreateButton: true
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('.btn').exists()).toBe(true)

      await wrapper.setProps({ showCreateButton: false })

      expect(wrapper.find('.btn').exists()).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('handles very long messages', () => {
      const longMessage = 'A'.repeat(200)
      const wrapper = mount(EmptyProject, {
        props: {
          message: longMessage
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('p').text()).toBe(longMessage)
    })

    it('handles messages with special characters', () => {
      const specialMessage = 'Message avec accents: éàç & symboles <>'
      const wrapper = mount(EmptyProject, {
        props: {
          message: specialMessage
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('p').text()).toBe(specialMessage)
    })

    it('handles multiline messages', () => {
      const multilineMessage = 'Ligne 1\nLigne 2\nLigne 3'
      const wrapper = mount(EmptyProject, {
        props: {
          message: multilineMessage
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('p').text()).toBe(multilineMessage)
    })
  })

  describe('Accessibility', () => {
    it('button has proper text content', () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Test message',
          showCreateButton: true
        },
        global: {
          plugins: [router]
        }
      })

      const button = wrapper.find('.btn')
      expect(button.text()).toBe('Créer un projet')
    })

    it('message is in a semantic paragraph element', () => {
      const wrapper = mount(EmptyProject, {
        props: {
          message: 'Test message'
        },
        global: {
          plugins: [router]
        }
      })

      const paragraph = wrapper.find('p')
      expect(paragraph.element.tagName).toBe('P')
    })
  })
})
