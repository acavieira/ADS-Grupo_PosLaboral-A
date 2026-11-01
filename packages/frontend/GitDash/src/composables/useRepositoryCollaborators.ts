import { ref, inject, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRepositoryStore } from '@/stores/repository'
import { useTimeRangeStore } from '@/stores/timeRange'
import { ApiClientKey } from '@/plugins/api'
import { LoggerKey } from '@/plugins/logger'
import type {
  ICollaboratorStatsDTO,
  IPseudonymizedCollaboratorStatsDTO,
} from '@/models/ICollaboratorStatsDTO'
import type { ICollaboratorStats } from '@/models/ICollaboratorStats'
import type { IPseudonymizedCollaboratorStats } from '@/models/IPseudonymizedCollaboratorStats'

/**
 * Com a pseudonimização ativa a API não devolve `login` nem `avatarUrl`.
 * O pseudónimo ocupa o lugar do `login` (é o identificador de cada linha) e o avatar fica vazio.
 * A `reference` opaca é o que as vistas individuais pedem à API em vez do login.
 */
const fromPseudonymized = (c: IPseudonymizedCollaboratorStats): ICollaboratorStats => ({
  login: c.alias,
  avatarUrl: '',
  reference: c.reference,
  role: c.role,
  commits: c.commits,
  pullRequests: c.pullRequests,
  issues: c.issues,
})

/**
 * Composable to manage the list of collaborators for the current repository.
 * * Automatically reacts to changes in the global `RepositoryStore` or `TimeRangeStore`
 * and refetches data accordingly.
 * * @throws {Error} If `ApiClient` or `Logger` are not provided via dependency injection.
 * @returns State and methods to manage repository collaborators.
 */
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

  /** * The list of collaborator statistics (commits, lines changed, etc.).
   */
  const collaborators = ref<ICollaboratorStats[]>([])

  /** * Indicates if the collaborators list is currently being fetched.
   */
  const isLoading = ref(false)

  /** * Holds any error object if the fetch operation fails.
   * Null if no error occurred.
   */
  const error = ref<unknown>(null)

  /** * When true, the API replaces logins and avatars with pseudonyms ("Colaborador 1..n").
   * On by default (privacy by default); changing it refetches the list.
   */
  const pseudonymize = ref(true)

  /** * Repository name as the API labels it when pseudonymized: the owner's login is replaced by
   * the alias ("Colaborador 1/repo") when the owner is one of the collaborators.
   * Null when not pseudonymized or while there is no answer yet.
   */
  const repositoryLabel = ref<string | null>(null)

  // Fetch Function

  /**
   * Manually triggers the fetch of collaborators.
   * * Typically not needed as the watcher handles updates automatically,
   * but useful for manual "Refresh" buttons.
   */
  const fetchCollaborators = async () => {
    if (!getCurrentRepositoryFullName.value) return

    isLoading.value = true
    error.value = null

    try {
      const encodedName = encodeURIComponent(getCurrentRepositoryFullName.value)
      const baseUrl = `/api/github/collaborators/${encodedName}/${encodeURIComponent(timeRange.value)}`
      const url = pseudonymize.value ? `${baseUrl}?pseudonymize=true` : baseUrl

      const dto = await api.get<ICollaboratorStatsDTO | IPseudonymizedCollaboratorStatsDTO>(url)
      collaborators.value = dto.pseudonymized
        ? dto.collaborators.map(fromPseudonymized)
        : dto.collaborators
      repositoryLabel.value = dto.pseudonymized ? dto.repository : null
    } catch (e) {
      error.value = e
      repositoryLabel.value = null
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
    [currentRepository, timeRange, pseudonymize],
    ([newRepo, newTime, newPseudonymize], [oldRepo, oldTime, oldPseudonymize]) => {
      if (
        newRepo &&
        (newRepo !== oldRepo || newTime !== oldTime || newPseudonymize !== oldPseudonymize)
      ) {
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
    pseudonymize,
    repositoryLabel,
    // We expose this in case the component wants to force a reload manually
    fetchCollaborators
  }
}