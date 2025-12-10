import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import DataErrorAlert from './DataErrorAlert.vue'

const vuetify = createVuetify({
  components,
  directives,
})

describe('DataErrorAlert.vue', () => {
  const mountComponent = (props = {}, slots = {}) => {
    return mount(DataErrorAlert, {
      global: {
        plugins: [vuetify],
      },
      props,
      slots,
    })
  }

  it('renders the default title and message correctly', () => {
    const wrapper = mountComponent()

    expect(wrapper.text()).toContain('Access Restricted or Data Unavailable')
    expect(wrapper.text()).toContain('We could not retrieve statistics for this resource')
  })

  it('renders a custom title when provided', () => {
    const title = 'System Error'
    const wrapper = mountComponent({ title })

    expect(wrapper.text()).toContain(title)
  })

  it('displays the resource name in the default message if provided', () => {
    const resourceName = 'MyProject'
    const wrapper = mountComponent({ resourceName })

    // "this resource" should be replaced by the resourceName
    expect(wrapper.text()).not.toContain('statistics for this resource')
    expect(wrapper.text()).toContain(`statistics for ${resourceName}`)
    expect(wrapper.find('strong').text()).toBe(resourceName)
  })

  it('renders custom slot content', () => {
    const content = '<span>Custom error message here</span>'
    const wrapper = mountComponent({}, { default: content })

    expect(wrapper.html()).toContain(content)
    // Default message should be gone
    expect(wrapper.text()).not.toContain('We could not retrieve statistics')
  })

  it('emits the "retry" event when the button is clicked', async () => {
    const wrapper = mountComponent()

    // Find the button inside the append slot
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Retry')

    await button.trigger('click')

    expect(wrapper.emitted('retry')).toBeTruthy()
    expect(wrapper.emitted('retry')?.length).toBe(1)
  })
})
