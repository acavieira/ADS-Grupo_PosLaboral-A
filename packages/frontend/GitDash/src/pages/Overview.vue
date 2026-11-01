<template>
  <v-row v-if="currentRepository" class="mb-2">
    <v-col cols="12">
      <RepositoryCard :repo="displayedRepository ?? currentRepository" :clickable="false" />
    </v-col>
  </v-row>
  <div v-if="error">
    <DataErrorAlert :resource-name="repositoryName ?? currentRepository?.fullName" @retry="fetchStats" />
  </div>
  <div v-else-if="isLoading" class="d-flex justify-center pa-12">
    <v-progress-circular indeterminate color="primary" />
  </div>
  <div v-else>
    <v-row class="mb-2">
      <v-col cols="12" md="4">
        <StatKpiCard
          :title="`Commits (${humanTimeRange})`"
          :value="stats.commits"
          :caption="stats.commitsLabel"
        />
      </v-col>

      <v-col cols="12" md="4">
        <StatKpiCard
          :title="`PRs Merged (${humanTimeRange})`"
          :value="stats.prsMerged"
          :caption="stats.prsLabel"
        />
      </v-col>

      <v-col cols="12" md="4">
        <StatKpiCard
          :title="`Issues Closed (${humanTimeRange})`"
          :value="stats.issuesClosed"
          :caption="stats.issuesLabel"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <OpenWorkCard :open-prs="stats.openPrs" :open-issues="stats.openIssues" />
      </v-col>

      <v-col cols="12" md="6">
        <PeakActivityCard
          :peak-day="stats.peakDay"
          :peak-hour="stats.peakHour"
          :team-size="stats.teamSize"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTimeRangeStore } from '@/stores/timeRange.ts'
import { useRepositoryOverview } from '@/composables/useRepositoryOverview'

// Components
import { StatKpiCard, DataErrorAlert } from '@git-dash/ui'
import RepositoryCard from '@/components/RepositoryCard/RepositoryCard.vue'
import OpenWorkCard from '@/components/OpenWorkCard/OpenWorkCard.vue'
import PeakActivityCard from '@/components/PeakActivityCard/PeakActivityCard.vue'

const props = defineProps<{
  /** Name shown instead of the repository's real full name (e.g. with the owner hidden). */
  repositoryName?: string
}>()

// Logic
const { getHumanReadableTimeRange } = storeToRefs(useTimeRangeStore())
const { stats, currentRepository, error, isLoading, fetchStats } = useRepositoryOverview()

const displayedRepository = computed(() => {
  const repository = unref(currentRepository)
  return repository && props.repositoryName ? { ...repository, fullName: props.repositoryName } : null
})

// Create a reactive alias for the template
const humanTimeRange = getHumanReadableTimeRange
</script>
