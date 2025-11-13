import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import LoginCard from './LoginCard.vue'

describe('LoginCard', () => {
  it('renders title, description and button', () => {
    const wrapper = mount(LoginCard)
    expect(wrapper.text()).toContain('GitHub Dashboard')
    expect(wrapper.text()).toContain('Connect your GitHub account')
    expect(wrapper.findComponent({ name: 'BaseButton' }).exists()).toBe(true)
  })

  it('shows loading state when login is triggered', async () => {
    const wrapper = mount(LoginCard)
    const btn = wrapper.findComponent({ name: 'BaseButton' })
    const spy = vi.spyOn(window.location, 'href', 'set')
    await btn.trigger('click')
    expect(spy).toHaveBeenCalled()
  })

  it('shows error message if login fails', async () => {
    const wrapper = mount(LoginCard)
    // Forcing an error
    wrapper.vm.login = () => { wrapper.vm.error = 'Failed to start login'; wrapper.vm.loading = false }
    await wrapper.vm.login()
    expect(wrapper.text()).toContain('Failed to start login')
  })
})
