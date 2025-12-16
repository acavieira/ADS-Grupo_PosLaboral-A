import { describe, it, expect } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import StatisticGraph from './StatisticGraph.vue'


// Mock interface
interface ICommitData {
  label: string
  value: number
}

describe('StatisticGraph.vue', () => {
  const mockItems: ICommitData[] = [
    { label: 'Mon', value: 10 },
    { label: 'Tue', value: 25 },
    { label: 'Wed', value: 5 }
  ]

  const mountComponent = (items = mockItems) => {
    return mount(StatisticGraph, {
      props: { items },
      global: {
        stubs: {
          BaseCard: { template: '<div><slot /></div>' },
          'v-card-title': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          // CRITICAL: Stub apexchart. Rendering real canvas in tests is slow/flaky.
          // We capture props to assert against them.
          apexchart: {
            template: '<div data-test="chart"></div>',
            props: ['series', 'options', 'type', 'height']
          }
        }
      }
    })
  }

  it('renders the title correctly', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Weekly Commit Activity')
  })

  it('transforms input items into ApexCharts series format', () => {
    const wrapper = mountComponent()
    const chart = wrapper.findComponent('[data-test="chart"]')

    const passedSeries = (chart as any).props('series')

    // Expect specific structure: [{ name: 'Commits', data: [{x, y}, ...] }]
    expect(passedSeries).toHaveLength(1)
    expect(passedSeries[0].name).toBe('Commits')

    // Check data mapping
    expect(passedSeries[0].data).toEqual([
      { x: 'Mon', y: 10 },
      { x: 'Tue', y: 25 },
      { x: 'Wed', y: 5 }
    ])
  })

  it('handles empty data correctly', () => {
    const wrapper = mountComponent([])
    const chart = wrapper.findComponent('[data-test="chart"]')

    const passedSeries = (chart as any).props('series')

    expect(passedSeries[0].data).toEqual([])
  })

  it('passes correct configuration options to the chart', () => {
    const wrapper = mountComponent()
    const chart = wrapper.findComponent('[data-test="chart"]')

    const options = (chart as any).props('options')

    // Assert key configuration values
    expect(options.chart.type).toBe('area')
    expect(options.chart.toolbar.show).toBe(false)
    expect(options.colors).toEqual(['#5C95FF'])

    // Check Y-axis formatter exists (though hard to test implementation details of the function)
    expect(typeof options.yaxis.labels.formatter).toBe('function')
  })

  it('passes correct layout props (height, type)', () => {
    const wrapper = mountComponent()
    const chart = wrapper.findComponent('[data-test="chart"]')

    expect((chart as any).props('height')).toBe('300')
    expect((chart as any).props('type')).toBe('area')
  })
})
