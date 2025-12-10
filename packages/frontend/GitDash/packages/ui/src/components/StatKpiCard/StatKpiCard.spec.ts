import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import StatKpiCard from './StatKpiCard.vue'

const vuetify = createVuetify({
  components,
  directives,
})

describe('StatKpiCard.vue', () => {
  // We stub BaseCard to focus the test on StatKpiCard's internal logic
  // and ensure the slot is rendered.
  const BaseCardStub = {
    template: '<div class="base-card-stub"><slot /></div>',
  }

  const mountComponent = (props = {}) => {
    return mount(StatKpiCard, {
      global: {
        plugins: [vuetify],
        stubs: {
          BaseCard: BaseCardStub,
        },
      },
      props: {
        title: 'Test Title',
        value: '100',
        caption: 'Test Caption',
        ...props,
      },
    })
  }

  it('renders title, value, and caption correctly', () => {
    const props = {
      title: 'Total Sales',
      value: '$500',
      caption: 'vs last month',
    }
    const wrapper = mountComponent(props)

    expect(wrapper.text()).toContain(props.title)
    expect(wrapper.text()).toContain(props.value)
    expect(wrapper.text()).toContain(props.caption)
  })

  it('does not render the icon element when prop is missing', () => {
    const wrapper = mountComponent({ icon: undefined })

    const iconComponent = wrapper.findComponent(components.VIcon)
    expect(iconComponent.exists()).toBe(false)
  })

  it('accepts numeric values for the value prop', () => {
    const wrapper = mountComponent({ value: 12345 })

    expect(wrapper.text()).toContain('12345')
  })
})
