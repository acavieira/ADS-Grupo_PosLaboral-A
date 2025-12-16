import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'

// Import the component
import PersonalStatsPage from '@/pages/PersonalStats.vue'

// Import child components for existence checks
import StatisticGraph from '@/components/StatisticGraph/StatisticGraph.vue'
import CodeChangesCard from '@/components/CodeChangesCard/CodeChangesCard.vue'
import { StatKpiCard } from '@git-dash/ui'

// 1. Mock the Pinia Store
vi.mock('@/stores/timeRange.ts', () => ({
  useTimeRangeStore: () => ({
    getHumanReadableTimeRange: ref('Last 30 Days')
  })
}))

// 2. Mock the Composable
// We use a mock function so we can change the return values per test
const mockUsePersonalStats = vi.fn()

vi.mock('@/composables/usePersonalStats', () => ({
  usePersonalStats: (collaborator: string) => mockUsePersonalStats(collaborator)
}))

describe('PersonalStatsPage', () => {
  // Common stub configuration to ensure v-row/v-col render their children
  const globalConfig = {
    stubs: {
      'v-row': { template: '<div><slot /></div>' },
      'v-col': { template: '<div><slot /></div>' },
      // We stub v-skeleton-loader simply to identify it easily
      'v-skeleton-loader': true,
      'v-progress-circular': true
    }
  }

  const defaultProps = {
    collaborator: 'johndoe'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders initial full-page loading state correctly', () => {
    // Arrange: Loading is true, no data yet
    mockUsePersonalStats.mockReturnValue({
      loadingTotals: true,
      totals: { commits: 0 }, // falsy check in template
      loadingActivity: false,
      loadingChanges: false,
      chartData: [],
      codeChanges: {}
    })

    const wrapper = shallowMount(PersonalStatsPage, {
      props: defaultProps,
      global: globalConfig
    })

    // Assert: Loader exists
    expect(wrapper.find('v-progress-circular-stub').exists()).toBe(true)

    // Assert: Content hidden
    expect(wrapper.findComponent(StatKpiCard).exists()).toBe(false)
  })

  it('renders KPI cards when data is loaded', () => {
    // Arrange: Data loaded
    mockUsePersonalStats.mockReturnValue({
      loadingTotals: false,
      totals: {
        commits: 50,
        prTotal: 10,
        prMerged: 8,
        issueTotal: 5,
        issueClosed: 5,
        reviews: 12
      },
      loadingActivity: false,
      loadingChanges: false,
      chartData: [],
      codeChanges: {}
    })

    const wrapper = shallowMount(PersonalStatsPage, {
      props: defaultProps,
      global: globalConfig
    })

    // Assert: Main loader gone
    expect(wrapper.find('v-progress-circular-stub').exists()).toBe(false)

    // Assert: 4 KPI Cards exist
    const cards = wrapper.findAllComponents(StatKpiCard)
    expect(cards.length).toBe(4)

    // Verify prop binding on one card
    expect(cards[0].props('value')).toBe(50) // Total Commits
    expect(cards[3].props('value')).toBe(12) // Reviews Given
  })

  it('renders Skeleton Loader for Activity Graph while loading', () => {
    // Arrange: Main loaded, Activity loading
    mockUsePersonalStats.mockReturnValue({
      loadingTotals: false,
      totals: { commits: 1 },
      loadingActivity: true, // <--- TARGET
      loadingChanges: false,
      chartData: [],
      codeChanges: {}
    })

    const wrapper = shallowMount(PersonalStatsPage, {
      props: defaultProps,
      global: globalConfig
    })

    // Assert: StatisticGraph should NOT be there
    expect(wrapper.findComponent(StatisticGraph).exists()).toBe(false)

    // Assert: Skeleton loader should be there
    // Since we have multiple skeletons, we can check if any exist,
    // or try to find the specific column wrapper.
    const skeletons = wrapper.findAll('v-skeleton-loader-stub')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders StatisticGraph when activity data is loaded', () => {
    // Arrange
    mockUsePersonalStats.mockReturnValue({
      loadingTotals: false,
      totals: { commits: 1 },
      loadingActivity: false, // <--- TARGET
      loadingChanges: false,
      chartData: [{ date: '2023-01-01', value: 10 }],
      codeChanges: {}
    })

    const wrapper = shallowMount(PersonalStatsPage, {
      props: defaultProps,
      global: globalConfig
    })

    // Assert: Graph exists
    expect(wrapper.findComponent(StatisticGraph).exists()).toBe(true)
  })

  it('renders Skeleton Loader for Code Changes while loading', () => {
    // Arrange
    mockUsePersonalStats.mockReturnValue({
      loadingTotals: false,
      totals: { commits: 1 },
      loadingActivity: false,
      loadingChanges: true, // <--- TARGET
      chartData: [],
      codeChanges: {}
    })

    const wrapper = shallowMount(PersonalStatsPage, {
      props: defaultProps,
      global: globalConfig
    })

    // Assert: CodeChangesCard should NOT be there
    expect(wrapper.findComponent(CodeChangesCard).exists()).toBe(false)

    // Assert: Skeleton exists
    expect(wrapper.find('v-skeleton-loader-stub').exists()).toBe(true)
  })

  it('renders CodeChangesCard when changes data is loaded', () => {
    // Arrange
    mockUsePersonalStats.mockReturnValue({
      loadingTotals: false,
      totals: { commits: 1 },
      loadingActivity: false,
      loadingChanges: false, // <--- TARGET
      chartData: [],
      codeChanges: { additions: 100, deletions: 50 }
    })

    const wrapper = shallowMount(PersonalStatsPage, {
      props: defaultProps,
      global: globalConfig
    })

    // Assert: Card exists
    const card = wrapper.findComponent(CodeChangesCard)
    expect(card.exists()).toBe(true)

    // Check props passed
    expect(card.props('additions')).toBe(100)
    expect(card.props('deletions')).toBe(50)
  })
})
