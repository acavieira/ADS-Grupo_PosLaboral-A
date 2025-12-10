import { ref, inject, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ApiClientKey } from '@/plugins/api'
import { LoggerKey } from '@/plugins/logger'
import { useRepositoryStore } from '@/stores/repository'
import { useTimeRangeStore } from '@/stores/timeRange'
import type { IRepoOverviewStatsDTO } from '@/models/IRepoOverviewStatsDTO'
import type { IRepoOverviewStats } from '@/models/IRepoOverviewStats'


// --- Helper Logic for Dynamic Labels ---

/**
 * Determines the activity label based on commit volume.
 * @param count - Total number of commits
 * @returns A human-readable status string (e.g., 'Active development')
 */
const getCommitLabel = (count: number): string => {
  if (count > 30) return 'Active development'
  if (count > 0) return 'Maintenance mode'
  return 'No recent activity'
}

/**
 * Determines the velocity label based on merged PRs.
 * @param count - Number of merged Pull Requests
 * @returns A human-readable velocity string
 */
const getPrLabel = (count: number): string => {
  if (count > 10) return 'High velocity'
  if (count > 0) return 'Steady flow'
  return 'No changes merged'
}

/**
 * Determines the triage label based on closed issues.
 * @param count - Number of closed issues
 * @returns A human-readable triage status string
 */
const getIssueLabel = (count: number): string => {
  if (count > 15) return 'Heavy triage'
  if (count > 0) return 'Resolving quickly'
  return 'No issues closed'
}

/**
 * Composable to fetch and manage the high-level repository overview.
 * * Handles fetching KPI data (commits, PRs, issues) and mapping them to
 * human-readable labels using helper functions.
 * * @throws {Error} If `ApiClient` or `Logger` are not provided.
 * @returns Reactive state for repository statistics and loading status.
 */
export function useRepositoryOverview() {
  const api = inject(ApiClientKey)
  const logger = inject(LoggerKey)
  if (!api || !logger) throw new Error('Dependencies not provided')

  const repoStore = useRepositoryStore()
  const timeStore = useTimeRangeStore()
  const { currentRepository, getCurrentRepositoryFullName } = storeToRefs(repoStore)
  const { timeRange } = storeToRefs(timeStore)

  /** Loading state for the stats fetching operation. */
  const isLoading = ref(false)

  // Initial State
  /** Holds the last error that occurred during fetching, or null. */
  const error = ref<any>(null)

  /**
   * Main statistics object containing both raw counts and formatted labels.
   * Includes commit activity, PR velocity, issue resolution, and peak activity times.
   */
  const stats = ref<IRepoOverviewStats>({
    commits: 0,
    commitsLabel: 'No recent activity',
    prsMerged: 0,
    prsLabel: 'No changes merged',
    issuesClosed: 0,
    issuesLabel: 'No issues closed',
    openPrs: 0,
    openIssues: 0,
    peakDay: '-',
    peakHour: '-',
    teamSize: 0,
  })

  /**
   * Fetches the statistics DTO from the API and maps it to the internal state.
   * * Applies logic helpers (`getCommitLabel`, etc.) to generate UI labels dynamically.
   */
  const fetchStats = async () => {
    if (!getCurrentRepositoryFullName.value) return
    error.value = null
    isLoading.value = true
    try {
      const encodedName = encodeURIComponent(getCurrentRepositoryFullName.value)
      const url = `/api/github/stats/${encodedName}/${encodeURIComponent(timeRange.value)}`

      const dto = await api.get<IRepoOverviewStatsDTO>(url)

      // 3. Map Data AND Generate Labels
      stats.value = {
        commits: dto.kpis.commits,
        commitsLabel: getCommitLabel(dto.kpis.commits),

        prsMerged: dto.kpis.prsMerged,
        prsLabel: getPrLabel(dto.kpis.prsMerged),

        issuesClosed: dto.kpis.issuesClosed,
        issuesLabel: getIssueLabel(dto.kpis.issuesClosed),

        openPrs: dto.openWork.openPrs,
        openIssues: dto.openWork.openIssues,
        peakDay: dto.peakActivity.mostActiveDay,
        peakHour: dto.peakActivity.peakHourUtc ?? '-',
        teamSize: dto.peakActivity.teamSize,
      }
    } catch (e) {
      error.value = e
      logger.error('Error loading repo stats', {
        error: e,
        repo: getCurrentRepositoryFullName.value,
      })
    } finally {
      isLoading.value = false
    }
  }

  // Watcher
  watch([timeRange, getCurrentRepositoryFullName], () => {
    fetchStats()
  }, { immediate: true })

  return {
    stats,
    isLoading,
    error,
    currentRepository,
    fetchStats
  }
}
