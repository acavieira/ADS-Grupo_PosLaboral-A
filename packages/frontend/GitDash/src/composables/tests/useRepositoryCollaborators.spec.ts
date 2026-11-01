import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, createApp, h, ref } from 'vue'
import { flushPromises } from '@vue/test-utils'

// System under test
import { useRepositoryCollaborators } from '../useRepositoryCollaborators'

// Dependencies
import { ApiClientKey } from '@/plugins/api'
import { LoggerKey } from '@/plugins/logger'

// --- Mocks ---
const mockApi = { get: vi.fn() }
const mockLogger = { error: vi.fn() }

// Global Mock State
const mockCurrentRepo = ref<any>(null)
const mockRepoFullName = ref('')
const mockTimeRange = ref('7d')

// Mock Pinia
vi.mock('pinia', () => ({ storeToRefs: (val: any) => val }))

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

describe('useRepositoryCollaborators', () => {
  const providers = [
    [ApiClientKey, mockApi],
    [LoggerKey, mockLogger]
  ]

  // Variable to track the app instance
  let appInstance: any = null

  function withSetup(composableCallback: () => any, providers: any[] = []) {
    let result: any
    const Component = defineComponent({
      setup() {
        result = composableCallback()
        return () => h('div')
      }
    })

    const app = createApp(Component)
    providers.forEach(([key, value]) => app.provide(key, value))
    app.mount(document.createElement('div'))

    // Track the app so we can unmount it later
    appInstance = app

    return { result, app }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentRepo.value = { id: 1, name: 'repo' }
    mockRepoFullName.value = 'org/repo'
    mockTimeRange.value = '30d'
  })

  // !!! CRITICAL FIX: Unmount the app after each test to kill watchers
  afterEach(() => {
    if (appInstance) {
      appInstance.unmount()
      appInstance = null
    }
    // Reset state to avoid leaking data
    mockRepoFullName.value = ''
    mockCurrentRepo.value = null
  })

  it('throws error if dependencies are missing', () => {
    // We wrap this so it doesn't create a persistent app that needs cleanup
    const run = () => {
      const { app } = withSetup(() => useRepositoryCollaborators(), [])
      app.unmount() // Clean up immediately if it throws
    }
    expect(run).toThrowError('Dependencies (API or Logger) not provided')
  })

  it('fetches collaborators immediately upon mounting if repo is selected', async () => {
    const mockResponse = {
      collaborators: [{ login: 'alice', commits: 10 }]
    }
    mockApi.get.mockResolvedValue(mockResponse)

    const { result } = withSetup(() => useRepositoryCollaborators(), providers)
    await flushPromises()

    expect(result.isLoading.value).toBe(false)
    expect(result.collaborators.value).toEqual(mockResponse.collaborators)

    const expectedUrl = `/api/github/collaborators/${encodeURIComponent('org/repo')}/${encodeURIComponent('30d')}?pseudonymize=true`
    expect(mockApi.get).toHaveBeenCalledWith(expectedUrl)
  })

  it('handles API errors gracefully', async () => {
    const errorObj = new Error('Access Denied')
    mockApi.get.mockRejectedValue(errorObj)

    const { result } = withSetup(() => useRepositoryCollaborators(), providers)

    expect(result.isLoading.value).toBe(true)
    await flushPromises()

    expect(result.isLoading.value).toBe(false)
    expect(result.collaborators.value).toEqual([])
    expect(result.error.value).toBe(errorObj)
    expect(mockLogger.error).toHaveBeenCalled()
  })

  it('does not fetch if repository name is missing', async () => {
    mockRepoFullName.value = '' // Set invalid state BEFORE mounting

    withSetup(() => useRepositoryCollaborators(), providers)
    await flushPromises()

    expect(mockApi.get).not.toHaveBeenCalled()
  })

  it('refetches when Time Range changes', async () => {
    mockApi.get.mockResolvedValue({ collaborators: [] })

    withSetup(() => useRepositoryCollaborators(), providers)
    await flushPromises()
    mockApi.get.mockClear() // Clear the initial call

    // Act
    mockTimeRange.value = '1y'
    await flushPromises()

    // Assert
    expect(mockApi.get).toHaveBeenCalledTimes(1)
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('1y'))
  })

  it('asks for pseudonyms by default', async () => {
    mockApi.get.mockResolvedValue({ collaborators: [] })

    const { result } = withSetup(() => useRepositoryCollaborators(), providers)
    await flushPromises()

    expect(result.pseudonymize.value).toBe(true)
    expect(mockApi.get).toHaveBeenCalledTimes(1)
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('?pseudonymize=true'))
  })

  it('refetches without the parameter when the option is turned off', async () => {
    mockApi.get.mockResolvedValue({ collaborators: [] })

    const { result } = withSetup(() => useRepositoryCollaborators(), providers)
    await flushPromises()
    mockApi.get.mockClear()

    result.pseudonymize.value = false
    await flushPromises()

    expect(mockApi.get).toHaveBeenCalledTimes(1)
    expect(mockApi.get).toHaveBeenCalledWith(expect.not.stringContaining('pseudonymize'))
  })

  it('uses the alias as identifier, keeps the opaque reference and leaves the avatar empty when pseudonymized', async () => {
    mockApi.get.mockResolvedValue({
      pseudonymized: true,
      collaborators: [
        { alias: 'Colaborador 1', reference: '~opaque-1', role: 'admin', commits: 7, pullRequests: 2, issues: 1 }
      ]
    })

    const { result } = withSetup(() => useRepositoryCollaborators(), providers)
    await flushPromises()

    expect(result.collaborators.value).toEqual([
      {
        login: 'Colaborador 1',
        avatarUrl: '',
        reference: '~opaque-1',
        role: 'admin',
        commits: 7,
        pullRequests: 2,
        issues: 1
      }
    ])
  })

  it('keeps the repository label from the API only while pseudonymized', async () => {
    mockApi.get.mockResolvedValue({
      pseudonymized: true,
      repository: 'Colaborador 1/repo',
      collaborators: []
    })

    const { result } = withSetup(() => useRepositoryCollaborators(), providers)
    await flushPromises()
    expect(result.repositoryLabel.value).toBe('Colaborador 1/repo')

    mockApi.get.mockResolvedValue({ pseudonymized: false, repository: 'ana/repo', collaborators: [] })
    result.pseudonymize.value = false
    await flushPromises()
    expect(result.repositoryLabel.value).toBeNull()
  })

  it('clears the repository label when the request fails', async () => {
    mockApi.get.mockResolvedValueOnce({
      pseudonymized: true,
      repository: 'Colaborador 1/repo',
      collaborators: []
    })

    const { result } = withSetup(() => useRepositoryCollaborators(), providers)
    await flushPromises()
    expect(result.repositoryLabel.value).toBe('Colaborador 1/repo')

    mockApi.get.mockRejectedValue(new Error('boom'))
    await result.fetchCollaborators()

    expect(result.repositoryLabel.value).toBeNull()
  })

  it('refetches when Repository changes', async () => {
    mockApi.get.mockResolvedValue({ collaborators: [] })

    withSetup(() => useRepositoryCollaborators(), providers)
    await flushPromises()
    mockApi.get.mockClear()

    // Act
    mockRepoFullName.value = 'org/new-repo'
    mockCurrentRepo.value = { id: 2, name: 'new-repo' }
    await flushPromises()

    // Assert
    expect(mockApi.get).toHaveBeenCalledTimes(1)
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('org%2Fnew-repo'))
  })
})
