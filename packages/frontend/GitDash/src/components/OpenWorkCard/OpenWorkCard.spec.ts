import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OpenWorkCard from './OpenWorkCard.vue'

describe('OpenWorkCard.vue', () => {
  const mountComponent = (props: { openPrs: number; openIssues: number }) => {
    return mount(OpenWorkCard, {
      props,
      global: {
        stubs: {
          BaseCard: { template: '<div><slot /></div>' },

          // FIX: Added 'name' so findAllComponents can locate it
          'v-chip': {
            name: 'v-chip',
            template: '<div class="v-chip"><slot /></div>',
            props: ['color', 'variant']
          },

          // Stub v-icon to check existence and icon name
          'v-icon': { template: '<span class="v-icon"><slot /></span>' },
        },
      },
    })
  }

  it('renders titles and correct numbers', () => {
    const wrapper = mountComponent({ openPrs: 12, openIssues: 7 })

    expect(wrapper.text()).toContain('Open Work Status')
    expect(wrapper.text()).toContain('Open Pull Requests')
    expect(wrapper.text()).toContain('Open Issues')

    // Check if numbers are rendered within the text
    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('7')
  })

  describe('Pull Requests Logic', () => {
    it('shows blue chip and icon when PRs > 0', () => {
      const wrapper = mountComponent({ openPrs: 5, openIssues: 0 })

      // Get the first chip (PRs)
      const prChip = wrapper.findAllComponents({ name: 'v-chip' })[0]

      expect(prChip.props('color')).toBe('blue-darken-4')
      // Icon should be present
      expect(prChip.find('.v-icon').exists()).toBe(true)
      expect(prChip.find('.v-icon').text()).toContain('mdi-source-pull')
    })

    it('shows grey chip and NO icon when PRs = 0', () => {
      const wrapper = mountComponent({ openPrs: 0, openIssues: 0 })

      const prChip = wrapper.findAllComponents({ name: 'v-chip' })[0]

      expect(prChip.props('color')).toBe('grey-lighten-1')
      // Icon should NOT be present
      expect(prChip.find('.v-icon').exists()).toBe(false)
    })
  })

  describe('Issues Logic', () => {
    it('shows red chip when Issues > 0', () => {
      const wrapper = mountComponent({ openPrs: 0, openIssues: 3 })

      // Get the second chip (Issues)
      const issueChip = wrapper.findAllComponents({ name: 'v-chip' })[1]

      expect(issueChip.props('color')).toBe('red-darken-4')
    })

    it('shows grey chip when Issues = 0', () => {
      const wrapper = mountComponent({ openPrs: 0, openIssues: 0 })

      const issueChip = wrapper.findAllComponents({ name: 'v-chip' })[1]

      expect(issueChip.props('color')).toBe('grey-lighten-1')
    })

    it('shows alert icon ONLY when Issues > 5', () => {
      // Case: 6 issues (threshold exceeded)
      const wrapper = mountComponent({ openPrs: 0, openIssues: 6 })
      const issueChip = wrapper.findAllComponents({ name: 'v-chip' })[1]

      expect(issueChip.find('.v-icon').exists()).toBe(true)
      expect(issueChip.find('.v-icon').text()).toContain('mdi-alert-circle-outline')
    })

    it('does NOT show alert icon when Issues <= 5', () => {
      // Case: 5 issues (threshold not exceeded)
      const wrapper = mountComponent({ openPrs: 0, openIssues: 5 })
      const issueChip = wrapper.findAllComponents({ name: 'v-chip' })[1]

      // It is still red (count > 0), but no icon
      expect(issueChip.props('color')).toBe('red-darken-4')
      expect(issueChip.find('.v-icon').exists()).toBe(false)
    })
  })
})
