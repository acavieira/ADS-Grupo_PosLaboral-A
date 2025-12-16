import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import LoginPage from '@/pages/Login.vue'
import LoginCard from '@/components/LoginCard/LoginCard.vue'

describe('LoginPage', () => {
  it('renders the LoginCard component', () => {
    // shallowMount automatically stubs all child components.
    // LoginCard will not be rendered; a stub <login-card-stub> will be created instead.
    const wrapper = shallowMount(LoginPage)

    // Verify that the page attempts to use the LoginCard component.
    // findComponent works even if the component is stubbed.
    expect(wrapper.findComponent(LoginCard).exists()).toBe(true)
  })
})
