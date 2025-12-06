<template>
    <v-row v-if="currentRepository" class="mb-2">
      <v-col cols="12">
        <BaseCard class="pa-6">
          <h2 class="text-h6 mb-1">
            {{ currentRepository.fullName }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-3">
            {{ currentRepository.description || 'No description available.' }}
          </p>

          <div class="d-flex align-center text-body-2 ga-4">
            <span>
              <v-icon size="16" class="mr-1">mdi-star-outline</v-icon>
              {{ currentRepository.starred }} stars
            </span>
            <span>
              <v-icon size="16" class="mr-1">mdi-source-fork</v-icon>
              {{ currentRepository.forked }} forks
            </span>
            <v-chip size="x-small" color="grey-lighten-3" class="text-caption">
              Public
            </v-chip>
          </div>
        </BaseCard>
      </v-col>
    </v-row>

    <!-- Main stats grid (Overview tab) -->
    <v-row class="mb-2">
      <v-col cols="12" md="4">
        <BaseCard>
          <div class="text-subtitle-2 mb-2">
            Commits ({{ getHumanReadableTimeRange }})
          </div>
          <div class="text-h5 mb-1">{{ stats.commitsLast7 }}</div>
          <div class="text-caption text-medium-emphasis">Active development</div>
        </BaseCard>
      </v-col>

      <v-col cols="12" md="4">
        <BaseCard>
          <div class="text-subtitle-2 mb-2">
            PRs Merged ({{ getHumanReadableTimeRange }})
          </div>
          <div class="text-h5 mb-1">{{ stats.prsMergedLast7 }}</div>
          <div class="text-caption text-medium-emphasis">High velocity</div>
        </BaseCard>
      </v-col>

      <v-col cols="12" md="4">
        <BaseCard>
          <div class="text-subtitle-2 mb-2">
            Issues Closed ({{ getHumanReadableTimeRange }})
          </div>
          <div class="text-h5 mb-1">{{ stats.issuesClosedLast7 }}</div>
          <div class="text-caption text-medium-emphasis">Resolving quickly</div>
        </BaseCard>
      </v-col>
    </v-row>

    <!-- Bottom cards -->
    <v-row>
      <v-col cols="12" md="6">
        <BaseCard>
          <div class="text-subtitle-2 mb-4">Open Work Status</div>
          <div class="d-flex justify-space-between mb-2">
            <span>Open Pull Requests</span>
            <v-chip size="small" variant="tonal">{{ stats.openPrs }}</v-chip>
          </div>
          <div class="d-flex justify-space-between">
            <span>Open Issues</span>
            <v-chip size="small" variant="tonal">{{ stats.openIssues }}</v-chip>
          </div>
        </BaseCard>
      </v-col>

      <v-col cols="12" md="6">
        <BaseCard>
          <div class="text-subtitle-2 mb-4">Peak Activity</div>
          <div class="d-flex justify-space-between mb-2">
            <span>Most Active Day</span>
            <v-chip size="small" color="black" text-color="white">
              {{ stats.peakDay }}
            </v-chip>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span>Peak Hour (UTC)</span>
            <v-chip size="small" color="black" text-color="white">
              {{ stats.peakHour }}
            </v-chip>
          </div>
          <div class="d-flex justify-space-between">
            <span>Team Size</span>
            <v-chip size="small" variant="tonal">
              {{ stats.teamSize }} collaborators
            </v-chip>
          </div>
        </BaseCard>
      </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/BaseCard/BaseCard.vue'
import type { IRepoOverviewStatsDTO } from '@/models/IRepoOverviewStatsDTO.ts'
import { ApiClientKey } from '@/plugins/api.ts'
import { LoggerKey } from '@/plugins/logger.ts'
import { useRepositoryStore } from '@/stores/repository.ts'
import { useTimeRangeStore } from '@/stores/timeRange.ts'
import { storeToRefs } from 'pinia'

const api = inject(ApiClientKey)
if (!api) throw new Error('ApiClient not provided')

const logger = inject(LoggerKey)
if (!logger) throw new Error('logger not provided')

const repoStore = useRepositoryStore()
const timeStore = useTimeRangeStore()
const { currentRepository, getCurrentRepositoryFullName } = storeToRefs(repoStore)
const { timeRange, getHumanReadableTimeRange } = storeToRefs(timeStore)

const router = useRouter()


// view model usado no template para os stats
const stats = ref({
  commitsLast7: 0,
  prsMergedLast7: 0,
  issuesClosedLast7: 0,
  openPrs: 0,
  openIssues: 0,
  peakDay: '',
  peakHour: '',
  teamSize: 0,
})

// stats do repositório
const loadRepoStats = async () => {
  if (!getCurrentRepositoryFullName.value) return

  try {
    const encodedName = encodeURIComponent(getCurrentRepositoryFullName.value)
    const url = `/api/github/stats/${encodedName}/${encodeURIComponent(
      timeRange.value
    )}`

    const dto = await api.get<IRepoOverviewStatsDTO>(url)

    stats.value = {
      commitsLast7: dto.kpis.commits,
      prsMergedLast7: dto.kpis.prsMerged,
      issuesClosedLast7: dto.kpis.issuesClosed,
      openPrs: dto.openWork.openPrs,
      openIssues: dto.openWork.openIssues,
      peakDay: dto.peakActivity.mostActiveDay,
      peakHour: dto.peakActivity.peakHourUtc ?? '',
      teamSize: dto.peakActivity.teamSize,
    }
  } catch (e) {
    logger.error('Error loading repo stats', {
      error: e,
      repo: getCurrentRepositoryFullName.value,
      timeRange: timeRange.value,
    })
  }
}

// ------- Ciclo de vida / watchers -------

onMounted(async () => {

  if (!getCurrentRepositoryFullName.value) {
    router.push({ name: 'dashboard' })
    return
  }

  await loadRepoStats()
})

// sempre que mudar o timeRange, recarrega stats + colaboradores
watch(timeRange, async () => {
  await loadRepoStats()
})
</script>
