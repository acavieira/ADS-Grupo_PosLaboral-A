import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import UrlInputCard from './UrlInputCard.vue'

const vuetify = createVuetify({
  components,
  directives,
})

describe('UrlInputCard.vue', () => {
  // Stubs for child components
  const BaseCardStub = { template: '<div class="base-card-stub"><slot /></div>' }
  // We use a button in the stub so click events flow naturally
  const BaseButtonStub = {
    template: '<button class="base-button-stub" :disabled="disabled"><slot /></button>',
    props: ['disabled', 'color', 'block']
  }

  const mountComponent = () => {
    return mount(UrlInputCard, {
      global: {
        plugins: [vuetify],
        stubs: {
          BaseCard: BaseCardStub,
          BaseButton: BaseButtonStub,
        },
      },
    })
  }

  it('renders the title and instructions correctly', () => {
    const wrapper = mountComponent()

    expect(wrapper.text()).toContain('Enter repository URL')
    expect(wrapper.text()).toContain('Paste the GitHub repository URL directly')
  })

  it('updates the internal url state when typing', async () => {
    const wrapper = mountComponent()
    const input = wrapper.find('input')

    await input.setValue('https://github.com/vuejs/core')

    // Check if the v-model updated correctly (accessing component's internal state via vm is possible but implementation details, checking value is safer)
    expect((input.element as HTMLInputElement).value).toBe('https://github.com/vuejs/core')
  })

  it('disables the button when the input is empty', async () => {
    const wrapper = mountComponent()
    const button = wrapper.find('.base-button-stub')

    // Initially empty, button should be disabled
    expect(button.attributes('disabled')).toBeDefined()

    // Type something
    await wrapper.find('input').setValue('abc')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('emits "load-url" with the input value when the button is clicked', async () => {
    const wrapper = mountComponent()
    const testUrl = 'https://github.com/my/repo'

    // 1. Enter URL
    await wrapper.find('input').setValue(testUrl)

    // 2. Click Submit Button
    // Since we stubbed BaseButton as a native button, we can trigger click directly
    await wrapper.find('.base-button-stub').trigger('click')

    // 3. Verify Event
    expect(wrapper.emitted('load-url')).toBeTruthy()
    expect(wrapper.emitted('load-url')?.[0]).toEqual([testUrl])
  })

})
