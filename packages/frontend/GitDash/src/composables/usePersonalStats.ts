import { ref, inject, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ApiClientKey } from '@/plugins/api'
import { LoggerKey } from '@/plugins/logger'
import { useRepositoryStore } from '@/stores/repository'
import { useTimeRangeStore } from '@/stores/timeRange'
import type { CommitData } from '@/components/StatisticGraph/StatisticGraph.vue'

// --- DTO Interfaces (Matching Backend) ---

interface RepoContributionStatsDTO {
  commits: {
    totalCount: number
  }
  pullRequests: {
    totalCount: number
    mergedCount: number
  }
  issues: {
    totalCount: number
    closedCount: number
  }
  reviews: {
    givenCount: number
  }
  // Assuming 'role' might still be sent alongside these stats,
  // or it defaults to a string if not present in this specific DTO
  role?: string
}

interface CodeChangeStatsDTO {
  additions: number
  deletions: number
}

// The backend returns a simple list of numbers [0, 5, 10, ...]
type ActivityDTO = number[]

// --- Composable ---

export function usePersonalStats(login: string) {
  const api = inject(ApiClientKey)
  const logger = inject(LoggerKey)
  if (!api || !logger) throw new Error('Dependencies not provided')

  const { getCurrentRepositoryFullName } = storeToRefs(useRepositoryStore())
  const { timeRange } = storeToRefs(useTimeRangeStore())

  // --- State ---

  const totals = ref({ commits: 0, pullRequests: 0, issues: 0, role: 'contributor' })
  const loadingTotals = ref(false)
  const errorTotals = ref(false)

  const codeChanges = ref({ additions: 0, deletions: 0 })
  const loadingChanges = ref(false)
  const errorChanges = ref(false)

  const chartData = ref<CommitData[]>([])
  const loadingActivity = ref(false)
  const errorActivity = ref(false)

  // --- Helper ---
  const getParams = () => {
    if (!getCurrentRepositoryFullName.value || !login) return null
    return {
      repo: encodeURIComponent(getCurrentRepositoryFullName.value),
      user: encodeURIComponent(login),
      time: encodeURIComponent(timeRange.value)
    }
  }

  // --- Fetch Functions ---

  // 1. Fetch Totals (RepoContributionStats)
  const fetchTotals = async () => {
    const params = getParams(); if (!params) return
    loadingTotals.value = true; errorTotals.value = false

    try {
      const url = `/api/github/collaborators/${params.repo}/${params.user}/stats/${params.time}`
      const res = await api.get<RepoContributionStatsDTO>(url)

      // Map the nested DTO structure to flat UI state
      totals.value = {
        commits: res.commits.totalCount,
        pullRequests: res.pullRequests.totalCount, // Or mergedCount, depending on preference
        issues: res.issues.totalCount,             // Or closedCount
        role: res.role || 'contributor'
      }
    } catch (e) {
      errorTotals.value = true
      logger.error('Error fetching totals', { error: e })
    } finally {
      loadingTotals.value = false
    }
  }

  // 2. Fetch Code Changes (CodeChangeStats)
  const fetchChanges = async () => {
    const params = getParams(); if (!params) return
    loadingChanges.value = true; errorChanges.value = false

    try {
      const url = `/api/github/collaborators/${params.repo}/${params.user}/changes/${params.time}`
      const res = await api.get<CodeChangeStatsDTO>(url)

      codeChanges.value = {
        additions: res.additions,
        deletions: res.deletions
      }
    } catch (e) {
      errorChanges.value = true
    } finally {
      loadingChanges.value = false
    }
  }

  // 3. Fetch Activity (List<number>)
  const fetchActivity = async () => {
    const params = getParams(); if (!params) return
    loadingActivity.value = true; errorActivity.value = false

    try {
      const url = `/api/github/collaborators/${params.repo}/${params.user}/activity/${params.time}`
      const res = await api.get<ActivityDTO>(url)

      // Map the array of numbers [10, 5, 0...] to chart objects { label: 'W1', value: 10 }
      // The backend ensures 12 weeks, so we just map the index.
      chartData.value = res.map((value, index) => ({
        label: `W${index + 1}`,
        value: value
      }))

    } catch (e) {
      errorActivity.value = true
    } finally {
      loadingActivity.value = false
    }
  }

  // --- Watcher ---
  watch([timeRange, getCurrentRepositoryFullName], () => {
    fetchTotals()
    fetchChanges()
    fetchActivity()
  }, { immediate: true })

  return {
    totals, loadingTotals, errorTotals,
    codeChanges, loadingChanges, errorChanges,
    chartData, loadingActivity, errorActivity
  }
}
