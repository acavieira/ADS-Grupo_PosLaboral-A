import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import BaseCard from './BaseCard.vue'

const vuetify = createVuetify({
  components,
  directives,
})

describe('BaseCard.vue', () => {
  const mountComponent = (props = {}, slots = {}) => {
    return mount(BaseCard, {
      global: {
        plugins: [vuetify],
      },
      props,
      slots,
    })
  }

  it('renders correctly with default props', () => {
    const wrapper = mountComponent()

    expect(wrapper.classes()).toContain('custom-styled-card')
    expect(wrapper.exists()).toBe(true)
  })

  it('renders slot content correctly', () => {
    const content = '<div data-test="content">Test Content</div>'
    const wrapper = mountComponent({}, { default: content })

    expect(wrapper.find('[data-test="content"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Content')
  })

  it('applies the maxWidth prop correctly', () => {
    const maxWidth = '500px'
    const wrapper = mountComponent({ maxWidth })

    const cardElement = wrapper.find('.v-card')
    expect(cardElement.attributes('style')).toContain(`max-width: ${maxWidth}`)
  })

  it('passes the elevation prop to VCard', () => {
    const elevation = 5
    const wrapper = mountComponent({ elevation })

    const vCard = wrapper.findComponent(components.VCard)
    expect(vCard.props('elevation')).toBe(elevation)
  })

  it('applies custom className when provided', () => {
    const className = 'my-extra-class'
    const wrapper = mountComponent({ className })

    expect(wrapper.classes()).toContain(className)
  })

})
