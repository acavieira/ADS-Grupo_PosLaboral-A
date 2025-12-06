import { ref, inject, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRepositoryStore } from '@/stores/repository'
import { useTimeRangeStore } from '@/stores/timeRange'
import { ApiClientKey } from '@/plugins/api'
import { LoggerKey } from '@/plugins/logger'
import type { ICollaboratorStatsDTO } from '@/models/ICollaboratorStatsDTO'
import type { ICollaboratorStats } from '@/models/ICollaboratorStats'

export function useRepositoryCollaborators() {
  // Inject Dependencies
  const api = inject(ApiClientKey)
  const logger = inject(LoggerKey)

  if (!api || !logger) {
    throw new Error('Dependencies (API or Logger) not provided')
  }

  // Setup Stores
  const repoStore = useRepositoryStore()
  const timeStore = useTimeRangeStore()
  const { currentRepository, getCurrentRepositoryFullName } = storeToRefs(repoStore)
  const { timeRange } = storeToRefs(timeStore)

  // State
  const collaborators = ref<ICollaboratorStats[]>([])
  const isLoading = ref(false)
  const error = ref<unknown>(null)

  // Fetch Function
  const fetchCollaborators = async () => {
    if (!getCurrentRepositoryFullName.value) return

    isLoading.value = true
    error.value = null

    try {
      const encodedName = encodeURIComponent(getCurrentRepositoryFullName.value)
      const url = `/api/github/collaborators/${encodedName}/${encodeURIComponent(timeRange.value)}`

      const dto = await api.get<ICollaboratorStatsDTO>(url)
      collaborators.value = dto.collaborators
    } catch (e) {
      error.value = e
      logger.error('Error loading collaborators', {
        error: e,
        repo: getCurrentRepositoryFullName.value,
        timeRange: timeRange.value,
      })
    } finally {
      isLoading.value = false
    }
  }

  // Watcher
  // We handle the automation inside the composable so the component doesn't worry about it
  watch(
    [currentRepository, timeRange],
    ([newRepo, newTime], [oldRepo, oldTime]) => {
      if (newRepo && (newRepo !== oldRepo || newTime !== oldTime)) {
        fetchCollaborators()
      }
    },
    { immediate: true }
  )

  // Return what the component needs
  return {
    collaborators,
    isLoading,
    error,
    // We expose this in case the component wants to force a reload manually
    fetchCollaborators
  }
}
