import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeChangesCard from './CodeChangesCard.vue'

describe('CodeChangesCard.vue', () => {
  // Helper factory to mount the component with specific props
  const mountComponent = (props: { additions: number; deletions: number }) => {
    return mount(CodeChangesCard, {
      props,
      global: {
        stubs: {
          // Stub BaseCard to render its slot content directly
          BaseCard: { template: '<div><slot /></div>' },
          // Stub Vuetify components
          'v-chip': { template: '<div data-test="net-chip"><slot /></div>' },
          'v-progress-linear': true, // We will check props on this stub
          'v-divider': true,
          'v-row': { template: '<div><slot /></div>' },
          'v-col': { template: '<div><slot /></div>' },
        },
      },
    })
  }

  it('renders correctly formatted numbers', () => {
    const wrapper = mountComponent({ additions: 1200, deletions: 350 })

    const text = wrapper.text()

    // Check formatting (1,200)
    expect(text).toContain('1,200')
    expect(text).toContain('350')
  })

  it('calculates Total Changes correctly', () => {
    const wrapper = mountComponent({ additions: 10, deletions: 20 })

    // 10 + 20 = 30
    expect(wrapper.text()).toContain('30')
  })

  it('calculates Net Change with a positive sign', () => {
    const wrapper = mountComponent({ additions: 100, deletions: 40 })

    // 100 - 40 = 60. Should display "+60 lines"
    const chip = wrapper.find('[data-test="net-chip"]')
    expect(chip.text()).toContain('+60 lines')
  })

  it('calculates Net Change with negative values correctly', () => {
    const wrapper = mountComponent({ additions: 20, deletions: 50 })

    // 20 - 50 = -30. Should display "-30 lines" (no plus sign)
    const chip = wrapper.find('[data-test="net-chip"]')
    expect(chip.text()).toContain('-30 lines')
  })

  it('calculates Add/Del Ratio correctly', () => {
    const wrapper = mountComponent({ additions: 100, deletions: 50 })

    // 100 / 50 = 2.00
    expect(wrapper.text()).toContain('2.00')
  })

  it('handles division by zero in Ratio (zero deletions)', () => {
    const wrapper = mountComponent({ additions: 50, deletions: 0 })

    // Logic: returns props.additions.toFixed(2) -> 50.00
    expect(wrapper.text()).toContain('50.00')
  })

  it('calculates progress bar percentages correctly', () => {
    const wrapper = mountComponent({ additions: 75, deletions: 25 })

    // Total = 100. Add% = 75%, Del% = 25%
    const progressBars = wrapper.findAllComponents({ name: 'v-progress-linear' })

    // Assuming first bar is Additions, second is Deletions based on template order
    expect(progressBars[0].props('modelValue')).toBe(75)
    expect(progressBars[1].props('modelValue')).toBe(25)
  })

  it('handles zero total changes (avoids NaN in percentages)', () => {
    const wrapper = mountComponent({ additions: 0, deletions: 0 })

    const progressBars = wrapper.findAllComponents({ name: 'v-progress-linear' })

    expect(progressBars[0].props('modelValue')).toBe(0)
    expect(progressBars[1].props('modelValue')).toBe(0)
    expect(wrapper.text()).toContain('0 lines') // Net change
  })
})
