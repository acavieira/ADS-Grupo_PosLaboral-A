import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import Tabs from './Tabs.vue'

// Define the interface locally for tests
interface ITab {
  key: string
  title: string
  icon?: string
}

const vuetify = createVuetify({
  components,
  directives,
})

describe('Tabs.vue', () => {
  const mockTabs: ITab[] = [
    { key: 'tab1', title: 'Repo Tab 1' },
    { key: 'tab2', title: 'Repo Tab 2' },
    { key: 'user1', title: 'User 1', icon: 'user1.jpg' },
  ]

  const mountComponent = (props = {}) => {
    return mount(Tabs, {
      global: {
        plugins: [vuetify],
      },
      props: {
        tabs: mockTabs,
        activeTab: 'tab1',
        ...props,
      },
    })
  }

  it('correctly splits tabs into repository (text) and collaborator (icon) sections', () => {
    const wrapper = mountComponent()

    // Repository tabs (no icon)
    // The component has two sections. We can find the text items by the class 'base-tab-item px-4'
    // or by looking for elements containing the text directly.
    const textTabs = wrapper.findAll('.base-tab-item.px-4')
    expect(textTabs).toHaveLength(2) // tab1 and tab2
    expect(textTabs[0].text()).toContain('Repo Tab 1')

    // Collaborator tabs (with icon)
    // Looking for the class used for icons: 'base-tab-item pa-0'
    const iconTabs = wrapper.findAll('.base-tab-item.pa-0')
    expect(iconTabs).toHaveLength(1) // user1
  })

  it('applies the active class to the correct tab', () => {
    const wrapper = mountComponent({ activeTab: 'tab2' })

    const tabs = wrapper.findAll('.base-tab-item')
    const activeTab = tabs.find(t => t.classes().includes('base-tab-active'))

    expect(activeTab).toBeDefined()
    expect(activeTab?.text()).toContain('Repo Tab 2')
  })

  it('emits "tab-change" when a repository tab is clicked', async () => {
    const wrapper = mountComponent()

    // Find the second text tab (tab2)
    const textTabs = wrapper.findAll('.base-tab-item.px-4')
    await textTabs[1].trigger('click')

    expect(wrapper.emitted('tab-change')).toBeTruthy()
    expect(wrapper.emitted('tab-change')?.[0]).toEqual(['tab2'])
  })

  it('emits "tab-change" when a collaborator tab is clicked', async () => {
    const wrapper = mountComponent()

    // Find the icon tab
    const iconTab = wrapper.find('.base-tab-item.pa-0')
    await iconTab.trigger('click')

    expect(wrapper.emitted('tab-change')).toBeTruthy()
    expect(wrapper.emitted('tab-change')?.[0]).toEqual(['user1'])
  })

  it('renders avatars correctly for collaborator tabs', () => {
    const wrapper = mountComponent()
    const avatar = wrapper.findComponent(components.VAvatar)
    const img = wrapper.findComponent(components.VImg)

    expect(avatar.exists()).toBe(true)
    expect(img.exists()).toBe(true)
    expect(img.props('src')).toBe('user1.jpg')
  })
})
