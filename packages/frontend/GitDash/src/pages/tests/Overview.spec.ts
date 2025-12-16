import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import Overview from '@/pages/Overview.vue'

// Import components to check for their existence
import { StatKpiCard, DataErrorAlert } from '@git-dash/ui'
import RepositoryCard from '@/components/RepositoryCard/RepositoryCard.vue'
import OpenWorkCard from '@/components/OpenWorkCard/OpenWorkCard.vue'
import PeakActivityCard from '@/components/PeakActivityCard/PeakActivityCard.vue'

// 1. Mock the Pinia store
// We return a Ref for 'getHumanReadableTimeRange' because the component uses storeToRefs
vi.mock('@/stores/timeRange.ts', () => ({
  useTimeRangeStore: () => ({
    getHumanReadableTimeRange: ref('Last 7 Days')
  })
}))

// 2. Mock the Composable
// We create a mock factory so we can change return values in each test
const mockUseRepositoryOverview = vi.fn()

vi.mock('@/composables/useRepositoryOverview', () => ({
  useRepositoryOverview: () => mockUseRepositoryOverview()
}))

describe('RepositoryOverviewPage', () => {
  // Reset mocks before each test to ensure clean state
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Loading state correctly', () => {
    // Arrange: Simulate loading state
    mockUseRepositoryOverview.mockReturnValue({
      isLoading: true,
      error: null,
      currentRepository: null,
      stats: {},
      fetchStats: vi.fn()
    })

    const wrapper = shallowMount(Overview)

    // Assert: Progress circular should exist
    // Note: Since we use shallowMount, v-progress-circular becomes <v-progress-circular-stub>
    const progress = wrapper.find('v-progress-circular-stub')
    expect(progress.exists()).toBe(true)

    // Assert: Content components should NOT exist
    expect(wrapper.findComponent(RepositoryCard).exists()).toBe(false)
    expect(wrapper.findComponent(StatKpiCard).exists()).toBe(false)
  })

  it('renders the Error state correctly', () => {
    // Arrange: Simulate error state
    mockUseRepositoryOverview.mockReturnValue({
      isLoading: false,
      error: { message: 'Network Error' },
      currentRepository: { fullName: 'my-org/my-repo' }, // Optional: if you want to test the prop passed
      stats: {},
      fetchStats: vi.fn()
    })

    const wrapper = shallowMount(Overview)

    // Assert: Error Alert should exist
    const errorAlert = wrapper.findComponent(DataErrorAlert)
    expect(errorAlert.exists()).toBe(true)

    // Verify props passed to the error alert
    expect(errorAlert.props('resourceName')).toBe('my-org/my-repo')

    // Assert: Loading and Main content should NOT exist
    expect(wrapper.find('v-progress-circular-stub').exists()).toBe(false)
    expect(wrapper.findComponent(StatKpiCard).exists()).toBe(false)
  })

  it('renders the Data/Content state correctly', () => {
    // Arrange: Simulate success state with data
    const mockStats = {
      commits: 100,
      commitsLabel: '+10%',
      prsMerged: 5,
      prsLabel: '-2%',
      issuesClosed: 12,
      issuesLabel: '+5%',
      openPrs: 3,
      openIssues: 8,
      peakDay: 'Monday',
      peakHour: '14:00',
      teamSize: 5
    }

    mockUseRepositoryOverview.mockReturnValue({
      isLoading: false,
      error: null,
      currentRepository: { fullName: 'active-repo' },
      stats: mockStats,
      fetchStats: vi.fn()
    })

    const wrapper = shallowMount(Overview, {
      global: {
        stubs: {
          'v-row': { template: '<div><slot /></div>' },
          'v-col': { template: '<div><slot /></div>' }
        }
      }
    })

    // Assert: Repository Header Card exists
    expect(wrapper.findComponent(RepositoryCard).exists()).toBe(true)

    // Assert: KPI Cards exist (There are 3 of them)
    const kpiCards = wrapper.findAllComponents(StatKpiCard)
    expect(kpiCards.length).toBe(3)

    // Verify one of the KPI cards has correct text (from store + stats)
    expect(kpiCards[0].props('title')).toContain('Commits (Last 7 Days)')
    expect(kpiCards[0].props('value')).toBe(100)

    // Assert: Complex Visualization Cards exist
    expect(wrapper.findComponent(OpenWorkCard).exists()).toBe(true)
    expect(wrapper.findComponent(PeakActivityCard).exists()).toBe(true)

    // Assert: Loading and Error should NOT exist
    expect(wrapper.find('v-progress-circular-stub').exists()).toBe(false)
    expect(wrapper.findComponent(DataErrorAlert).exists()).toBe(false)
  })
})
