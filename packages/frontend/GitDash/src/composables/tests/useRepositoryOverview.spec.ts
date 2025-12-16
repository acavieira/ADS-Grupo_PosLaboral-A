import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, createApp, h, ref } from 'vue'
import { flushPromises } from '@vue/test-utils'

// System under test
import { useRepositoryOverview } from '../useRepositoryOverview'

// Dependencies
import { ApiClientKey } from '@/plugins/api'
import { LoggerKey } from '@/plugins/logger'

// --- Mocks ---

// 1. Mock External Dependencies
const mockApi = {
  get: vi.fn()
}

const mockLogger = {
  error: vi.fn()
}

// 2. Mock Pinia State
const mockCurrentRepo = ref<any>(null)
const mockRepoFullName = ref('')
const mockTimeRange = ref('7d')

// 3. Mock Store Modules
vi.mock('pinia', () => ({
  storeToRefs: (val: any) => val
}))

vi.mock('@/stores/repository', () => ({
  useRepositoryStore: () => ({
    currentRepository: mockCurrentRepo,
    getCurrentRepositoryFullName: mockRepoFullName
  })
}))

vi.mock('@/stores/timeRange', () => ({
  useTimeRangeStore: () => ({
    timeRange: mockTimeRange
  })
}))

// --- Helper ---
function withSetup(composableCallback: () => any, providers: any[] = []) {
  let result: any

  const Component = defineComponent({
    setup() {
      result = composableCallback()
      return () => h('div')
    }
  })

  const app = createApp(Component)
  providers.forEach(([key, value]) => {
    app.provide(key, value)
  })
  app.mount(document.createElement('div'))

  return { result, app }
}

describe('useRepositoryOverview', () => {
  const providers = [
    [ApiClientKey, mockApi],
    [LoggerKey, mockLogger]
  ]

  // Default valid DTO for happy path
  const validDto = {
    kpis: { commits: 5, prsMerged: 2, issuesClosed: 2 },
    openWork: { openPrs: 1, openIssues: 1 },
    peakActivity: { mostActiveDay: 'Monday', peakHourUtc: '14:00', teamSize: 3 }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentRepo.value = { id: 1, name: 'repo' }
    mockRepoFullName.value = 'org/repo'
    mockTimeRange.value = '7d'
  })

  afterEach(() => {
    mockRepoFullName.value = ''
    mockCurrentRepo.value = null
  })

  it('throws error if dependencies are missing', () => {
    const run = () => withSetup(() => useRepositoryOverview(), [])
    expect(run).toThrowError('Dependencies not provided')
  })

  it('fetches and maps data correctly on mount', async () => {
    // Arrange
    mockApi.get.mockResolvedValue(validDto)

    // Act
    const { result } = withSetup(() => useRepositoryOverview(), providers)
    await flushPromises()

    // Assert: State updated
    expect(result.isLoading.value).toBe(false)
    expect(result.error.value).toBe(null)

    // Verify Mapping
    expect(result.stats.value.commits).toBe(5)
    expect(result.stats.value.peakDay).toBe('Monday')
    expect(result.stats.value.teamSize).toBe(3)

    // Verify URL Encoding
    const expectedUrl = `/api/github/stats/${encodeURIComponent('org/repo')}/${encodeURIComponent('7d')}`
    expect(mockApi.get).toHaveBeenCalledWith(expectedUrl)
  })

  it('generates correct "High Activity" labels', async () => {
    // Arrange: Return numbers high enough to trigger top-tier labels
    // Logic from file: commits > 30, PRs > 10, Issues > 15
    const highActivityDto = {
      ...validDto,
      kpis: { commits: 31, prsMerged: 11, issuesClosed: 16 }
    }
    mockApi.get.mockResolvedValue(highActivityDto)

    // Act
    const { result } = withSetup(() => useRepositoryOverview(), providers)
    await flushPromises()

    // Assert
    expect(result.stats.value.commitsLabel).toBe('Active development')
    expect(result.stats.value.prsLabel).toBe('High velocity')
    expect(result.stats.value.issuesLabel).toBe('Heavy triage')
  })

  it('generates correct "No Activity" labels', async () => {
    // Arrange: Return zeros
    const zeroActivityDto = {
      ...validDto,
      kpis: { commits: 0, prsMerged: 0, issuesClosed: 0 }
    }
    mockApi.get.mockResolvedValue(zeroActivityDto)

    // Act
    const { result } = withSetup(() => useRepositoryOverview(), providers)
    await flushPromises()

    // Assert
    expect(result.stats.value.commitsLabel).toBe('No recent activity')
    expect(result.stats.value.prsLabel).toBe('No changes merged')
    expect(result.stats.value.issuesLabel).toBe('No issues closed')
  })

  it('generates correct "Moderate Activity" labels', async () => {
    // Arrange: Between 0 and thresholds
    const moderateActivityDto = {
      ...validDto,
      kpis: { commits: 15, prsMerged: 5, issuesClosed: 5 }
    }
    mockApi.get.mockResolvedValue(moderateActivityDto)

    // Act
    const { result } = withSetup(() => useRepositoryOverview(), providers)
    await flushPromises()

    // Assert
    expect(result.stats.value.commitsLabel).toBe('Maintenance mode')
    expect(result.stats.value.prsLabel).toBe('Steady flow')
    expect(result.stats.value.issuesLabel).toBe('Resolving quickly')
  })

  it('handles API errors gracefully', async () => {
    // Arrange
    const error = new Error('Server Error')
    mockApi.get.mockRejectedValue(error)

    // Act
    const { result } = withSetup(() => useRepositoryOverview(), providers)

    // Check loading during fetch
    expect(result.isLoading.value).toBe(true)

    await flushPromises()

    // Assert
    expect(result.isLoading.value).toBe(false)
    expect(result.error.value).toBe(error)
    expect(mockLogger.error).toHaveBeenCalledWith('Error loading repo stats', expect.objectContaining({ error }))
  })

  it('refetches when dependencies change', async () => {
    // Arrange
    mockApi.get.mockResolvedValue(validDto)
    withSetup(() => useRepositoryOverview(), providers)
    await flushPromises()
    mockApi.get.mockClear()

    // Act: Change Time Range
    mockTimeRange.value = '1y'
    await flushPromises()

    // Assert
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('1y'))
  })
})
