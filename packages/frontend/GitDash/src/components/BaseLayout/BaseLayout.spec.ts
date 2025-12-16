import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import BaseLayout from './BaseLayout.vue'
import { useRouter } from 'vue-router'
import { useTimeRangeStore } from '@/stores/timeRange'

// 1. Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}))

// 2. Define Type for Mock State to fix TS error
type MockState = {
  repository?: Record<string, any>
  timeRange?: Record<string, any>
}

describe('BaseLayout.vue', () => {
  let routerPushMock: ReturnType<typeof vi.fn>

  // 3. Fix Props: Changed 'label' to 'title' to match ITab interface
  const defaultProps = {
    tabs: [
      { key: 'overview', title: 'Overview' },
      { key: 'collaborators', title: 'Collaborators' }
    ],
    activeTab: 'overview',
  }

  beforeEach(() => {
    routerPushMock = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: routerPushMock,
    } as any)
  })

  // 4. Helper function with typed initialState
  const mountComponent = (initialState: MockState = {}) => {
    return mount(BaseLayout, {
      props: defaultProps,
      slots: {
        default: '<div data-test="slot-content">Slot Content</div>',
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              repository: {
                currentRepository: { id: 1, name: 'git-dash', owner: { login: 'user' } },
                // Safe merge to prevent undefined errors
                ...(initialState.repository || {})
              },
              timeRange: {
                timeRange: '1 week',
                ...(initialState.timeRange || {})
              }
            },
          }),
        ],
        // Stub child components to isolate the test (Taken from your snippet)
        stubs: {
          BaseButton: {
            name: 'BaseButton',
            template: '<button @click="$emit(\'click\')"><slot /></button>'
          },
          Tabs: {
            name: 'Tabs',
            template: '<div></div>',
            props: ['items', 'modelValue'] // Add props if needed for checks
          },
          'v-select': {
            name: 'v-select',
            template: '<select @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['items', 'modelValue']
          },
          'v-app': { template: '<div><slot /></div>' },
          'v-main': { template: '<div><slot /></div>' },
          'v-container': { template: '<div><slot /></div>' },
          'v-row': { template: '<div><slot /></div>' },
          'v-col': { template: '<div><slot /></div>' },
          'v-card': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-icon': true,
          'v-avatar': true,
          'v-img': true,
        },
      },
    })
  }


  it('renders repository name and slot content', () => {
    const wrapper = mountComponent()

    // Check if the slot content is rendered
    expect(wrapper.find('[data-test="slot-content"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Slot Content')
  })

  it('redirects to /repository-choice if currentRepository is missing (watcher)', async () => {
    // Mount with null repository
    mountComponent({
      repository: { currentRepository: null }
    })

    // Watcher with { immediate: true } should trigger immediately
    expect(routerPushMock).toHaveBeenCalledWith('/repository-choice')
  })

  it('"Back" button triggers redirect', async () => {
    const wrapper = mountComponent()

    // Find the button (our BaseButton stub) and click it
    await wrapper.findComponent({ name: 'BaseButton' }).trigger('click')

    expect(routerPushMock).toHaveBeenCalledWith('/repository-choice')
  })

  it('updates timeRange in store when select changes', async () => {
    const wrapper = mountComponent()
    const timeStore = useTimeRangeStore()

    // Find v-select
    const select = wrapper.findComponent({ name: 'v-select' })

    // Emulate value change (v-model emits update:modelValue)
    await select.vm.$emit('update:modelValue', '1 month')

    expect(timeStore.setTimeRange).toHaveBeenCalledWith('1 month')
  })

  it('emits events when switching tabs', async () => {
    const wrapper = mountComponent()

    // Find Tabs component
    const tabs = wrapper.findComponent({ name: 'Tabs' })

    // Emulate event from child component
    await tabs.vm.$emit('tab-change', 'commits')

    // Verify BaseLayout bubbled up the events
    expect(wrapper.emitted('update:activeTab')?.[0]).toEqual(['commits'])
    expect(wrapper.emitted('tab-change')?.[0]).toEqual(['commits'])
  })
})
