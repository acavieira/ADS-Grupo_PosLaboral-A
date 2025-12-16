import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PeakActivityCard from './PeakActivityCard.vue'

describe('PeakActivityCard.vue', () => {
  const mountComponent = (props: { peakDay: string; peakHour: string; teamSize: number }) => {
    return mount(PeakActivityCard, {
      props,
      global: {
        stubs: {
          BaseCard: { template: '<div><slot /></div>' },

          // FIX: Added 'name' property so findAllComponents can locate it
          'v-chip': {
            name: 'v-chip',
            template: '<div class="v-chip"><slot /></div>',
            props: ['color']
          },
          'v-icon': { template: '<span></span>' },
        },
      },
    })
  }

  it('renders provided props correctly', () => {
    const wrapper = mountComponent({
      peakDay: 'Wednesday',
      peakHour: '14:00',
      teamSize: 5
    })

    expect(wrapper.text()).toContain('Wednesday')
    expect(wrapper.text()).toContain('14:00')
    expect(wrapper.text()).toContain('5 collaborators')
  })

  describe('Weekend Highlighting Logic', () => {
    it('uses black color for Weekdays', () => {
      const wrapper = mountComponent({
        peakDay: 'Monday',
        peakHour: '10:00',
        teamSize: 1
      })

      // First chip is the Day chip
      const dayChip = wrapper.findAllComponents({ name: 'v-chip' })[0]
      expect(dayChip.props('color')).toBe('black')
    })

    it('uses red color for Saturdays', () => {
      const wrapper = mountComponent({
        peakDay: 'Saturday',
        peakHour: '10:00',
        teamSize: 1
      })

      const dayChip = wrapper.findAllComponents({ name: 'v-chip' })[0]
      expect(dayChip.props('color')).toBe('red-darken-4')
    })

    it('uses red color for Sundays (case insensitive)', () => {
      const wrapper = mountComponent({
        peakDay: 'SUNDAY',
        peakHour: '10:00',
        teamSize: 1
      })

      const dayChip = wrapper.findAllComponents({ name: 'v-chip' })[0]
      expect(dayChip.props('color')).toBe('red-darken-4')
    })
  })

  describe('Team Size Logic', () => {
    it('highlights team in blue if size > 1', () => {
      const wrapper = mountComponent({
        peakDay: 'Monday',
        peakHour: '10:00',
        teamSize: 3
      })

      // Third chip is the Team Size chip
      const teamChip = wrapper.findAllComponents({ name: 'v-chip' })[2]
      expect(teamChip.props('color')).toBe('blue-darken-4')
    })

    it('uses grey color for solo developers (size = 1)', () => {
      const wrapper = mountComponent({
        peakDay: 'Monday',
        peakHour: '10:00',
        teamSize: 1
      })

      const teamChip = wrapper.findAllComponents({ name: 'v-chip' })[2]
      expect(teamChip.props('color')).toBe('grey-lighten-1')
    })
  })
})
