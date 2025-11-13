import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from './BaseButton.vue'


describe('BaseButton', () => {
  it('renders the label (prop) by default', () => {
    const wrapper = mount(BaseButton, { props: { label: 'Click me' } })
    expect(wrapper.text()).toContain('Click me')
  })


  it('emits "click" with MouseEvent when clicked', async () => {
    const onClick = vi.fn()
    const wrapper = mount(BaseButton, {
      props: { label: 'Tap', onClick },
    })


    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)


    const calls = onClick.mock.calls
    expect(calls[0][0]).toBeInstanceOf(MouseEvent)
  })


  it('respects disabled state', async () => {
    const onClick = vi.fn()
    const wrapper = mount(BaseButton, {
      props: { label: 'Disabled', disabled: true, onClick },
    })
    await wrapper.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
    const btn = wrapper.find('button')
    expect(btn.exists()).toBe(true)
    const aria = btn.attributes('aria-disabled')
    expect(aria === 'true' || btn.attributes('disabled') !== undefined).toBe(true)
  })
})
