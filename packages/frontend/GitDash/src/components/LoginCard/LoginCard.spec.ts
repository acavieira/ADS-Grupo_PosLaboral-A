import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginCard from './LoginCard.vue'

describe('LoginCard.vue', () => {
  // Save original to restore later
  const originalLocation = window.location

  // We will update this variable to change window.location behavior per test
  let locationMock: any

  beforeEach(() => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://test-backend')

    // Default mock implementation: a simple object
    locationMock = { href: '' }

    // Define window.location ONCE as a getter that returns our mutable locationMock
    Object.defineProperty(window, 'location', {
      configurable: true,
      get() { return locationMock }
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
    vi.unstubAllEnvs()
  })

  const mountComponent = () => {
    return mount(LoginCard, {
      global: {
        stubs: {
          BaseCard: { template: '<div><slot /></div>' },
          BaseButton: {
            name: 'BaseButton',
            template: '<button @click="$emit(\'click\')" :disabled="loading"><slot /></button>',
            props: ['loading', 'disabled']
          },
          'v-container': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-avatar': { template: '<div><slot /></div>' },
          'v-img': true,
          'v-icon': true,
        },
      },
    })
  }

  it('renders title and description correctly', () => {
    const wrapper = mountComponent()

    expect(wrapper.text()).toContain('GitDash')
    expect(wrapper.text()).toContain('Connect your GitHub account')
    expect(wrapper.text()).toContain('Sign in with GitHub')
  })

  it('redirects to the backend URL on button click', async () => {
    const wrapper = mountComponent()
    const button = wrapper.findComponent({ name: 'BaseButton' })

    await button.trigger('click')

    // Check our mock object
    expect(window.location.href).toBe('http://test-backend/login')
  })

  it('sets loading state during login', async () => {
    const wrapper = mountComponent()
    const button = wrapper.findComponent({ name: 'BaseButton' })

    await button.trigger('click')

    expect(wrapper.text()).toContain('Redirecting to GitHub...')
    expect(button.props('loading')).toBe(true)
  })

  it('handles errors if redirection fails', async () => {
    // FIX: Swap the mock object to one that throws when 'href' is set.
    // Since window.location is a getter returning 'locationMock', this takes effect immediately.
    locationMock = {
      set href(val: string) {
        throw new Error('Navigation failed')
      }
    }

    const wrapper = mountComponent()

    await wrapper.findComponent({ name: 'BaseButton' }).trigger('click')

    // The catch block should have executed
    expect(wrapper.text()).toContain('Failed to start login')

    const button = wrapper.findComponent({ name: 'BaseButton' })
    expect(button.props('loading')).toBe(false)
  })
})
