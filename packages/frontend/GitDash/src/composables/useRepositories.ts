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
  const isLoading = ref(false)

  const fetchAllRepositories = async () => {
    isLoading.value = true
    try {
      // Assuming existing endpoint
      const res = await api.get<IRepositoryDTO>('/api/github/repositories')
      allRepositories.value = res.repositories
    } catch (e) {
      logger.error('Error loading all repositories', { error: e })
    } finally {
      isLoading.value = false
    }
  }

  const fetchRecentRepositories = async () => {
    // New fetching logic as requested
    try {
      const res = await api.get<IRepositoryDTO>('/api/github/repositories/recent')
      recentRepositories.value = res.repositories
    } catch (e) {
      logger.error('Error loading recent repositories', { error: e })
    }
  }

  const init = async () => {
    await Promise.all([fetchAllRepositories(), fetchRecentRepositories()])
  }

  return {
    allRepositories,
    recentRepositories,
    isLoading,
    fetchAllRepositories,
    fetchRecentRepositories,
    init
  }
}
