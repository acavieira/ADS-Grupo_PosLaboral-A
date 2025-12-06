<template>
    <v-row v-if="currentRepository" class="mb-2">
      <v-col cols="12">
        <RepositoryCard :repo="currentRepository" :clickable="false"/>
      </v-col>
    </v-row>
    <div v-if="isLoading" class="d-flex justify-center pa-12">
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
        <OpenWorkCard
          :open-prs="stats.openPrs"
          :open-issues="stats.openIssues"
        />
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
import { storeToRefs } from 'pinia'
import { useTimeRangeStore } from '@/stores/timeRange.ts'
import { useRepositoryOverview } from '@/composables/useRepositoryOverview'

// Components
import StatKpiCard from '@git-dash/ui/components/StatKpiCard/StatKpiCard.vue'
import RepositoryCard from '@/components/RepositoryCard/RepositoryCard.vue'
import OpenWorkCard from '@/components/OpenWorkCard/OpenWorkCard.vue'
import PeakActivityCard from '@/components/PeakActivityCard/PeakActivityCard.vue'

// Logic
const { getHumanReadableTimeRange } = storeToRefs(useTimeRangeStore())
const { stats, currentRepository, isLoading } = useRepositoryOverview()

// Create a reactive alias for the template
const humanTimeRange = getHumanReadableTimeRange
</script>
