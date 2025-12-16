import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HeaderMenu from './HeaderMenu.vue'
import { useRoute, useRouter } from 'vue-router'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
  useRoute: vi.fn(),
}))

describe('HeaderMenu.vue', () => {
  let routerPushMock: ReturnType<typeof vi.fn>

  // Mock data
  const mockCollaborators = [
    {
      login: 'alice',
      avatar_url: 'http://avatar/alice.jpg',
      html_url: 'http://github/alice'
    },
    {
      login: 'bob',
      avatar_url: 'http://avatar/bob.jpg',
      html_url: 'http://github/bob'
    }
  ]

  beforeEach(() => {
    routerPushMock = vi.fn()

    // Default mocks
    vi.mocked(useRouter).mockReturnValue({
      push: routerPushMock,
    } as any)

    vi.mocked(useRoute).mockReturnValue({
      query: { repo: 'owner/repo-name' } // Default scenario: repo exists in query
    } as any)
  })

  const mountComponent = (props = {}) => {
    return mount(HeaderMenu, {
      props: {
        collaborators: mockCollaborators,
        modelValue: 'overview',
        ...props
      },
      global: {
        stubs: {
          'v-sheet': { template: '<div><slot /></div>' },
          'v-tabs': {
            name: 'v-tabs', // FIX: Added name
            template: '<div class="v-tabs"><slot /></div>',
            props: ['modelValue']
          },
          'v-tab': {
            name: 'v-tab', // FIX: Added name
            template: '<div class="v-tab"><slot /></div>'
          },
          'v-avatar': { template: '<div><slot /></div>' },
          'v-img': {
            name: 'v-img', // FIX: Added name
            // FIX: Bind :src and :alt so they appear in the DOM attributes
            template: '<img :src="src" :alt="alt" @click="$emit(\'click\')" />',
            props: ['src', 'alt']
          },
        }
      }
    })
  }

  it('renders tabs and collaborators', () => {
    const wrapper = mountComponent()

    // Check tabs
    const tabs = wrapper.findAll('.v-tab')
    expect(tabs[0].text()).toContain('Repository Overview')
    expect(tabs[1].text()).toContain('Collaborators')

    // Check collaborators (avatars)
    // We search for the component stub now to be safe, or the img tag
    const images = wrapper.findAll('img')
    expect(images).toHaveLength(2)

    // Now that the stub binds :src="src", this attribute will exist
    expect(images[0].attributes('src')).toBe('http://avatar/alice.jpg')
  })

  it('emits events when active tab changes', async () => {
    const wrapper = mountComponent()

    // Find the v-tabs component by name (now works because stub has name)
    const vTabs = wrapper.findComponent({ name: 'v-tabs' })

    // Simulate v-tabs emitting an update (user clicked a tab)
    await vTabs.vm.$emit('update:modelValue', 'collaborators')

    // Verify watcher logic
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['collaborators'])
    expect(wrapper.emitted('tabChange')?.[0]).toEqual(['collaborators'])
  })

  it('navigates to personal-stats with correct query params on avatar click', async () => {
    const wrapper = mountComponent()

    // Find first avatar image and click it (Alice)
    await wrapper.findAll('img')[0].trigger('click')

    expect(routerPushMock).toHaveBeenCalledWith({
      name: 'personal-stats',
      query: {
        repo: 'owner/repo-name', // Comes from the mocked useRoute
        login: 'alice'
      }
    })
  })

  it('navigates without "repo" param if it is missing in current route', async () => {
    // Override useRoute for this specific test case
    vi.mocked(useRoute).mockReturnValue({
      query: {} // No repo param
    } as any)

    const wrapper = mountComponent()

    // Click Bob
    await wrapper.findAll('img')[1].trigger('click')

    expect(routerPushMock).toHaveBeenCalledWith({
      name: 'personal-stats',
      query: {
        // repo key should be missing or handled via spread
        login: 'bob'
      }
    })
  })

  it('initializes activeTab from modelValue prop', () => {
    const wrapper = mountComponent({ modelValue: 'collaborators' })

    const vTabs = wrapper.findComponent({ name: 'v-tabs' })

    // Check if the internal v-tabs received the prop
    expect(vTabs.props('modelValue')).toBe('collaborators')
  })
})
