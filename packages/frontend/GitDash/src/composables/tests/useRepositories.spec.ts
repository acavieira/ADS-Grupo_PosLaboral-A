import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, createApp, h } from 'vue'
import { flushPromises } from '@vue/test-utils'

// System under test
import { useRepositories } from '../useRepositories'

// Dependencies
import { ApiClientKey } from '@/plugins/api'
import { LoggerKey } from '@/plugins/logger'

// --- Helper for Injection ---
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

describe('useRepositories', () => {
  // --- Mocks ---
  const mockApi = {
    get: vi.fn()
  }

  const mockLogger = {
    error: vi.fn()
  }

  const providers = [
    [ApiClientKey, mockApi],
    [LoggerKey, mockLogger]
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws an error if dependencies are not provided', () => {
    const run = () => withSetup(() => useRepositories(), [])
    expect(run).toThrowError('Dependencies not provided')
  })

  it('initializes with default empty states', () => {
    const { result } = withSetup(() => useRepositories(), providers)

    expect(result.allRepositories.value).toEqual([])
    expect(result.recentRepositories.value).toEqual([])
    expect(result.isLoading.value).toBe(false)
    expect(result.isUrlLoading.value).toBe(false)
  })

  describe('fetchAllRepositories', () => {
    it('fetches data and updates state successfully', async () => {
      // Arrange
      const mockData = { repositories: [{ id: 1, name: 'repo-1' }] }
      mockApi.get.mockResolvedValue(mockData)

      const { result } = withSetup(() => useRepositories(), providers)

      // Act
      const promise = result.fetchAllRepositories()

      // Assert: Loading should be true while pending
      expect(result.isLoading.value).toBe(true)

      await promise

      // Assert: Data loaded, loading false
      expect(result.allRepositories.value).toEqual(mockData.repositories)
      expect(result.isLoading.value).toBe(false)
      expect(mockApi.get).toHaveBeenCalledWith('/api/github/repositories')
    })

    it('handles errors by logging and resetting loading state', async () => {
      // Arrange
      const error = new Error('API Error')
      mockApi.get.mockRejectedValue(error)

      const { result } = withSetup(() => useRepositories(), providers)

      // Act
      await result.fetchAllRepositories()

      // Assert
      expect(result.isLoading.value).toBe(false)
      expect(result.allRepositories.value).toEqual([]) // Should remain empty
      expect(mockLogger.error).toHaveBeenCalledWith('Error loading all repositories', { error })
    })
  })

  describe('fetchRecentRepositories', () => {
    it('fetches recent repos successfully', async () => {
      // Arrange
      const mockData = { repositories: [{ id: 99, name: 'recent-repo' }] }
      mockApi.get.mockResolvedValue(mockData)

      const { result } = withSetup(() => useRepositories(), providers)

      // Act
      await result.fetchRecentRepositories()

      // Assert
      expect(result.recentRepositories.value).toEqual(mockData.repositories)
      expect(mockApi.get).toHaveBeenCalledWith('/api/github/recentRepositories')
    })

    it('logs error on failure', async () => {
      const error = new Error('Fail')
      mockApi.get.mockRejectedValue(error)

      const { result } = withSetup(() => useRepositories(), providers)

      await result.fetchRecentRepositories()

      expect(mockLogger.error).toHaveBeenCalledWith('Error loading recent repositories', { error })
    })
  })

  describe('loadRepositoryByUrl', () => {
    it('loads repository with specific loading state and parameter encoding', async () => {
      // Arrange
      const mockRepo = { id: 123, fullName: 'user/repo' }
      // We simulate a delay to test the loading state
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let resolveApi: Function = () => {}
      const promise = new Promise(r => { resolveApi = r })
      mockApi.get.mockReturnValue(promise)

      const { result } = withSetup(() => useRepositories(), providers)
      const inputUrl = 'https://github.com/user/repo'

      // Act
      const actionPromise = result.loadRepositoryByUrl(inputUrl)

      // Assert: Specific loading state should be true
      expect(result.isUrlLoading.value).toBe(true)
      expect(result.isLoading.value).toBe(false) // General loading should NOT be affected

      // Finish API call
      resolveApi(mockRepo)
      const returnedRepo = await actionPromise

      // Assert
      expect(returnedRepo).toEqual(mockRepo)
      expect(result.isUrlLoading.value).toBe(false)

      // Verify URL encoding
      // encodeURIComponent('https://github.com/user/repo') -> https%3A%2F%2Fgithub.com%2Fuser%2Frepo
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('url=https%3A%2F%2Fgithub.com%2Fuser%2Frepo')
      )
    })

    it('rethrows error to the caller after logging', async () => {
      // Arrange
      const error = new Error('Not Found')
      mockApi.get.mockRejectedValue(error)

      const { result } = withSetup(() => useRepositories(), providers)

      // Act & Assert
      // We expect the function to THROW, so the UI can show a specific alert
      await expect(result.loadRepositoryByUrl('bad-url')).rejects.toThrow('Not Found')

      // Ensure side effects occurred
      expect(result.isUrlLoading.value).toBe(false)
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('init', () => {
    it('calls fetchAll and fetchRecent in parallel', async () => {
      // Arrange
      mockApi.get.mockResolvedValue({ repositories: [] })
      const { result } = withSetup(() => useRepositories(), providers)

      // Act
      await result.init()

      // Assert
      expect(mockApi.get).toHaveBeenCalledTimes(2)
      expect(mockApi.get).toHaveBeenCalledWith('/api/github/repositories')
      expect(mockApi.get).toHaveBeenCalledWith('/api/github/recentRepositories')
    })
  })
})
