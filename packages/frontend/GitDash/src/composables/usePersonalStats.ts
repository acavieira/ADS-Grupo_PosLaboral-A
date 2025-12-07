import { ref, inject, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ApiClientKey } from '@/plugins/api'
import { LoggerKey } from '@/plugins/logger'
import { useRepositoryStore } from '@/stores/repository'
import { useTimeRangeStore } from '@/stores/timeRange'
import type { CommitData } from '@/components/StatisticGraph/StatisticGraph.vue'
import type { IRepoContributionStatsDTO } from '@/models/IRepoContributionStatsDTO.ts'
import type { IActivityDTO } from '@/models/IActivityDTO.ts'
import type { ICodeChangeStatsDTO } from '@/models/ICodeChangeStatsDTO.ts'
import type { IPersonalTotals } from '@/models/IPersonalTotals.ts'


export function usePersonalStats(login: string) {
  const api = inject(ApiClientKey)
  const logger = inject(LoggerKey)
  if (!api || !logger) throw new Error('Dependencies not provided')

  const { getCurrentRepositoryFullName } = storeToRefs(useRepositoryStore())
  const { timeRange } = storeToRefs(useTimeRangeStore())

  // --- State ---

  const totals = ref<IPersonalTotals>({
    commits: 0,
    prTotal: 0,
    prMerged: 0,
    issueTotal: 0,
    issueClosed: 0,
    reviews: 0
  })
  const loadingTotals = ref(false)
  const errorTotals = ref(false)

  const codeChanges = ref<ICodeChangeStatsDTO>({ additions: 0, deletions: 0 })
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
      time: encodeURIComponent(timeRange.value),
    }
  }

  // --- Fetch Functions ---

  // 1. Fetch Totals (RepoContributionStats)
  const fetchTotals = async () => {
    const params = getParams()
    if (!params) return
    loadingTotals.value = true
    errorTotals.value = false

    try {
      const url = `/api/github/repositories/${params.repo}/collaborators/${params.user}/activity?range=${params.time}`
      const res = await api.get<IRepoContributionStatsDTO>(url)

      totals.value = {
        commits: res.commits.totalCount,

        prTotal: res.pullRequests.totalCount,
        prMerged: res.pullRequests.mergedCount,

        issueTotal: res.issues.totalCount,
        issueClosed: res.issues.closedCount,

        reviews: res.reviews.givenCount
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
    const params = getParams()
    if (!params) return
    loadingChanges.value = true
    errorChanges.value = false

    try {
      const url = `/api/github/repositories/${params.repo}/collaborators/${params.user}/code-changes?range=${params.time}`
      const res = await api.get<ICodeChangeStatsDTO>(url)

      codeChanges.value = {
        additions: res.additions,
        deletions: res.deletions,
      }
    } catch (e) {
      errorChanges.value = true
    } finally {
      loadingChanges.value = false
    }
  }

  // 3. Fetch Activity (List<number>)
  const fetchActivity = async () => {
    const params = getParams()
    if (!params) return
    loadingActivity.value = true
    errorActivity.value = false

    try {
      const url = `/api/github/repositories/${params.repo}/collaborators/${params.user}/weekly-activity`
      const res = await api.get<IActivityDTO>(url)
      const data = res.weeks;
      // Map the array of numbers [10, 5, 0...] to chart objects { label: 'W1', value: 10 }
      // The backend ensures 12 weeks, so we just map the index.
      chartData.value = data.map((value, index) => ({
        label: `W${index + 1}`,
        value: value,
      }))
    } catch (e) {
      errorActivity.value = true
    } finally {
      loadingActivity.value = false
    }
  }

  // --- Watcher ---
  watch(
    [timeRange, getCurrentRepositoryFullName],
    () => {
      fetchTotals()
      fetchChanges()
      fetchActivity()
    },
    { immediate: true },
  )

  return {
    totals,
    loadingTotals,
    errorTotals,
    codeChanges,
    loadingChanges,
    errorChanges,
    chartData,
    loadingActivity,
    errorActivity,
  }
}
