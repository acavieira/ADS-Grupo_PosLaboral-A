import { ref, inject } from 'vue'
import { ApiClientKey } from '@/plugins/api'
import { LoggerKey } from '@/plugins/logger'
import type { IRepository } from '@/models/IRepository'
import type { IRepositoryDTO } from '@/models/IRepositoryDTO'

export function useRepositories() {
  const api = inject(ApiClientKey)
  const logger = inject(LoggerKey)

  if (!api || !logger) {
    throw new Error('Dependencies not provided')
  }

  const allRepositories = ref<IRepository[]>([])
  const recentRepositories = ref<IRepository[]>([])

  // Loading state for lists
  const isLoading = ref(false)
  // Loading state for the specific URL action
  const isUrlLoading = ref(false)

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

  const fetchRecentRepositories = async () => {
    try {
      const res = await api.get<IRepositoryDTO>('/api/github/repositories/recent')
      recentRepositories.value = res.repositories
    } catch (e) {
      logger.error('Error loading recent repositories', { error: e })
    }
  }

  /**
   * Fetches a single repository by its GitHub URL.
   * Rethrows error so the component can handle 404s specifically.
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
