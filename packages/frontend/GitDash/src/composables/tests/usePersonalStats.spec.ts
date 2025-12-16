import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, defineComponent, createApp, h, type Ref } from 'vue'
import { flushPromises } from '@vue/test-utils'

// System under test
import { usePersonalStats } from '../usePersonalStats'

// Dependencies types
import { ApiClientKey } from '@/plugins/api'
import { LoggerKey } from '@/plugins/logger'

// --- Mocks ---

// 1. Mock API Client
const mockApi = {
  get: vi.fn()
}

// 2. Mock Logger
const mockLogger = {
  error: vi.fn()
}

// 3. Mock Pinia Stores & Helper
// We need these Refs to be accessible outside the mock so we can change them in tests
const mockRepoName = ref('')
const mockTimeRange = ref('last_30_days')

// Mock 'storeToRefs' to simply return the object passed to it.
// This allows us to mock the store hooks returning simple objects with Refs.
vi.mock('pinia', () => ({
  storeToRefs: (val: any) => val
}))

vi.mock('@/stores/repository', () => ({
  useRepositoryStore: () => ({
    getCurrentRepositoryFullName: mockRepoName
  })
}))

vi.mock('@/stores/timeRange', () => ({
  useTimeRangeStore: () => ({
    timeRange: mockTimeRange
  })
}))

/**
 * Helper to run a composable within a Vue context (required for 'inject')
 * allowing us to provide mocks.
 */
function withSetup(composableCallback: () => any, providers: any[] = []) {
  let result: any

  const Component = defineComponent({
    setup() {
      result = composableCallback()
      return () => h('div')
    }
  })

  const app = createApp(Component)

  // Register providers (API, Logger)
  providers.forEach(([key, value]) => {
    app.provide(key, value)
  })

  app.mount(document.createElement('div'))

  return { result, app }
}

describe('usePersonalStats', () => {
  const login = 'test-user'

  // Reset mocks and state before each test
  beforeEach(() => {
    vi.clearAllMocks()
    mockRepoName.value = 'org/repo'
    mockTimeRange.value = '7d'
  })

  afterEach(() => {
    mockRepoName.value = ''
  })

  it('throws an error if dependencies are not provided', () => {
    // Arrange: Run without providing API or Logger
    // We wrap it in a function so expect(Fn).toThrow works
    const run = () => withSetup(() => usePersonalStats(login), [])

    // Assert
    expect(run).toThrowError('Dependencies not provided')
  })

  it('fetches and maps data correctly on initialization', async () => {
    // Arrange: Setup API responses
    const mockTotals = {
      commits: { totalCount: 10 },
      pullRequests: { totalCount: 5, mergedCount: 3 },
      issues: { totalCount: 4, closedCount: 2 },
      reviews: { givenCount: 8 }
    }
    const mockCodeChanges = { additions: 100, deletions: 50 }
    const mockActivity = { weeks: [10, 20, 5] }

    mockApi.get
      .mockResolvedValueOnce(mockTotals)      // 1. fetchTotals
      .mockResolvedValueOnce(mockCodeChanges) // 2. fetchChanges
      .mockResolvedValueOnce(mockActivity)    // 3. fetchActivity

    // Act: Initialize composable
    const { result } = withSetup(() => usePersonalStats(login), [
      [ApiClientKey, mockApi],
      [LoggerKey, mockLogger]
    ])

    // Wait for async watchers/fetches to complete
    await flushPromises()

    // Assert: Check Totals Mapping
    expect(result.totals.value).toEqual({
      commits: 10,
      prTotal: 5,
      prMerged: 3,
      issueTotal: 4,
      issueClosed: 2,
      reviews: 8
    })
    expect(result.loadingTotals.value).toBe(false)
    expect(result.errorTotals.value).toBe(false)

    // Assert: Check Code Changes
    expect(result.codeChanges.value).toEqual({ additions: 100, deletions: 50 })

    // Assert: Check Activity Chart Mapping (Should map array to object with labels)
    expect(result.chartData.value).toEqual([
      { label: 'W1', value: 10 },
      { label: 'W2', value: 20 },
      { label: 'W3', value: 5 },
    ])

    // Verify API calls used encoded params
    const expectedRepo = encodeURIComponent('org/repo')
    const expectedUser = encodeURIComponent(login)

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining(`/repositories/${expectedRepo}/collaborators/${expectedUser}`)
    )
  })

  it('handles API errors gracefully and sets error flags', async () => {
    // Arrange: Make API fail
    const error = new Error('Network Error')
    mockApi.get.mockRejectedValue(error)

    // Act
    const { result } = withSetup(() => usePersonalStats(login), [
      [ApiClientKey, mockApi],
      [LoggerKey, mockLogger]
    ])

    await flushPromises()

    // Assert: Totals Error
    expect(result.errorTotals.value).toBe(true)
    expect(result.totals.value.commits).toBe(0) // Should remain default
    expect(mockLogger.error).toHaveBeenCalledWith('Error fetching totals', { error })

    // Assert: Other Errors
    expect(result.errorChanges.value).toBe(true)
    expect(result.errorActivity.value).toBe(true)

    // Loadings should be reset to false
    expect(result.loadingTotals.value).toBe(false)
  })

  it('sets loading states correctly during fetch', async () => {
    // Fix for "Variable used before assigned" error:
    // We initialize it with a dummy function so TS knows it has a value.
    let resolveApi: (val: any) => void = () => {}

    const pendingPromise = new Promise((resolve) => { resolveApi = resolve })

    mockApi.get.mockReturnValue(pendingPromise)

    // Act
    const { result } = withSetup(() => usePersonalStats(login), [
      [ApiClientKey, mockApi],
      [LoggerKey, mockLogger]
    ])

    // Assert: Loading should be true immediately after mount (immediate watcher)
    expect(result.loadingTotals.value).toBe(true)
    expect(result.loadingChanges.value).toBe(true)

    // Finish promise
    resolveApi({ commits: { totalCount: 0 }, pullRequests: {}, issues: {}, reviews: {} })

    await flushPromises()

    // Assert: Loading should be false now
    expect(result.loadingTotals.value).toBe(false)
  })
})
