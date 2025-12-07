<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-skeleton-loader v-if="loadingTotals" type="card" height="120" />
        <StatKpiCard
          v-else
          title="Total Commits"
          :value="errorTotals ? '-' : totals.commits"
          caption="Commits contributed"
          icon="mdi-source-branch"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-skeleton-loader v-if="loadingTotals" type="card" height="120" />
        <StatKpiCard
          v-else
          title="Pull Requests"
          :value="errorTotals ? '-' : totals.pullRequests"
          caption="PRs opened"
          icon="mdi-git"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-skeleton-loader v-if="loadingTotals" type="card" height="120" />
        <StatKpiCard
          v-else
          title="Issues"
          :value="errorTotals ? '-' : totals.issues"
          caption="Issues created"
          icon="mdi-alert-circle-outline"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-skeleton-loader v-if="loadingTotals" type="card" height="120" />
        <StatKpiCard
          v-else
          title="Role"
          :value="errorTotals ? '-' : totals.role"
          caption="Repository permission"
          icon="mdi-account-badge-outline"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <BaseCard v-if="loadingActivity" class="d-flex align-center justify-center" style="height: 300px">
          <v-progress-circular indeterminate color="primary" />
        </BaseCard>

        <BaseCard v-else-if="errorActivity" class="d-flex align-center justify-center text-medium-emphasis" style="height: 300px">
          <div class="text-center">
            <v-icon size="40" class="mb-2">mdi-alert-circle-outline</v-icon>
            <div>Failed to load activity graph</div>
          </div>
        </BaseCard>

        <StatisticGraph v-else :items="chartData" />
      </v-col>

      <v-col cols="12" md="6">
        <BaseCard v-if="loadingChanges" class="d-flex align-center justify-center" style="height: 300px">
          <v-progress-circular indeterminate color="primary" />
        </BaseCard>

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
import { useRoute } from 'vue-router'
import BaseCard from '@/components/BaseCard/BaseCard.vue'
import StatisticGraph from '@/components/StatisticGraph/StatisticGraph.vue'
import CodeChangesCard from '@/components/CodeChangesCard/CodeChangesCard.vue'
import { usePersonalStats } from '@/composables/usePersonalStats'
import StatKpiCard from '@git-dash/ui/components/StatKpiCard/StatKpiCard.vue'

const route = useRoute()
const login = (route.query.login as string) || ''

const {
  totals, loadingTotals, errorTotals,
  codeChanges, loadingChanges,
  chartData, loadingActivity, errorActivity
} = usePersonalStats(login)
</script>
