import { ref, inject } from 'vue'
import { ApiClientKey } from '@/plugins/api'
import { LoggerKey } from '@/plugins/logger'
import type { IRepository } from '@/models/IRepository'
import type { IRepositoryDTO } from '@/models/IRepositoryDTO'

/**
 * Composable for managing GitHub repository data.
 * * Handles fetching lists of repositories (all/recent) and looking up specific repositories by URL.
 * * @throws {Error} If `ApiClient` or `Logger` are not provided via dependency injection.
 * @returns An object containing repository lists, loading states, and fetch methods.
 */
export function useRepositories() {
  const api = inject(ApiClientKey)
  const logger = inject(LoggerKey)

  if (!api || !logger) {
    throw new Error('Dependencies not provided')
  }

  /** List of all repositories available to the user. */
  const allRepositories = ref<IRepository[]>([])

  /** List of recently accessed repositories. */
  const recentRepositories = ref<IRepository[]>([])

  /** * General loading state.
   * True when fetching lists (all or recent repositories).
   */
  const isLoading = ref(false)

  /** * Specific loading state for the "Load by URL" action.
   * Used to show a spinner specifically on the input/button.
   */
  const isUrlLoading = ref(false)

  /**
   * Fetches the complete list of repositories from the backend.
   * Updates `allRepositories` and handles `isLoading`.
   */
  const fetchAllRepositories = async () => {
    isLoading.value = true
    try {
      const res = await api.get<IRepositoryDTO>('/api/github/repositories')
      allRepositories.value = res.repositories
    } catch (e) {
      logger.error('Error loading all repositories', { error: e })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetches the list of recently visited repositories.
   * Updates `recentRepositories` silently (without global loading state).
   */
  const fetchRecentRepositories = async () => {
    try {
      const res = await api.get<IRepositoryDTO>('/api/github/recentRepositories')
      recentRepositories.value = res.repositories
    } catch (e) {
      logger.error('Error loading recent repositories', { error: e })
    }
  }

  /**
   * Fetches a single repository by its GitHub URL.
   * * Rethrows errors so the UI component can handle 404s or validation errors specifically.
   * * @param urlInput - The full GitHub URL to resolve (e.g., "https://github.com/user/repo").
   * @returns The resolved repository object.
   * @throws Will throw if the API call fails to allow UI error handling.
   */
  const loadRepositoryByUrl = async (urlInput: string): Promise<IRepository> => {
    isUrlLoading.value = true
    try {
      // Endpoint based on your screenshot
      // Using query parameter 'url'
      const endpoint = `/api/GitHub/repository-by-url?url=${encodeURIComponent(urlInput)}`

      // Assuming the backend returns the IRepository object directly
      const repo = await api.get<IRepository>(endpoint)
      return repo
    } catch (e) {
      logger.error('Error loading repository by URL', { error: e, url: urlInput })
      throw e // Bubble up to component for UI handling
    } finally {
      isUrlLoading.value = false
    }
  }

  /**
   * Initializer function.
   * Fetches both all and recent repositories in parallel.
   */
  const init = async () => {
    await Promise.all([fetchAllRepositories(), fetchRecentRepositories()])
  }

  return {
    allRepositories,
    recentRepositories,
    isLoading,
    isUrlLoading, // Exported for the button spinner
    fetchAllRepositories,
    fetchRecentRepositories,
    loadRepositoryByUrl, // Exported function
    init
  }
}
