<template>
  <div v-if="loadingTotals && !totals.commits" class="d-flex justify-center pa-12">
    <v-progress-circular indeterminate color="primary" />
  </div>

  <div v-else>
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4" lg="3"> <StatKpiCard
        title="Total Commits"
        :value="totals.commits"
        caption="All time contributions"
        icon="mdi-source-branch"
      />
      </v-col>

      <v-col cols="12" sm="6" md="4" lg="3">
        <StatKpiCard
          title="Pull Requests"
          :value="totals.prTotal"
          :caption="`${totals.prMerged} merged`"
          icon="mdi-source-pull"
        />
      </v-col>

      <v-col cols="12" sm="6" md="4" lg="3">
        <StatKpiCard
          title="Issues"
          :value="totals.issueTotal"
          :caption="`${totals.issueClosed} closed`"
          icon="mdi-alert-circle-outline"
        />
      </v-col>

      <v-col cols="12" sm="6" md="4" lg="3">
        <StatKpiCard
          title="Reviews Given"
          :value="totals.reviews"
          caption="Participated in review"
          icon="mdi-eye-outline"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-skeleton-loader v-if="loadingActivity" type="card" height="300" />
        <StatisticGraph v-else :items="chartData" />
      </v-col>

      <v-col cols="12" md="6">
        <v-skeleton-loader v-if="loadingChanges" type="card" height="300" />
        <CodeChangesCard
          v-else
          :additions="codeChanges.additions"
          :deletions="codeChanges.deletions"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { usePersonalStats } from '@/composables/usePersonalStats'

// Components
import StatisticGraph from '@/components/StatisticGraph/StatisticGraph.vue'
import CodeChangesCard from '@/components/CodeChangesCard/CodeChangesCard.vue'
import StatKpiCard from '@git-dash/ui/components/StatKpiCard/StatKpiCard.vue'

const props = defineProps<{
  collaborator: string
}>()

// Pass the login as a getter function so the composable reacts when tabs change
const {
  totals,
  codeChanges,
  chartData,
  loadingTotals,
  loadingActivity,
  loadingChanges
} = usePersonalStats(props.collaborator)
</script>
