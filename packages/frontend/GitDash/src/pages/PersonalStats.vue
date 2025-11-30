<template>
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <BaseCard class="pa-4">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="text-caption text-medium-emphasis">Total Commits</span>
              <v-icon size="18">mdi-source-branch</v-icon>
            </div>
            <div class="text-h5 mb-1">{{ totals.totalCommits }}</div>
            <div class="text-caption text-medium-emphasis">Commits contributed</div>
          </BaseCard>
        </v-col>

        <v-col cols="12" md="3">
          <BaseCard class="pa-4">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="text-caption text-medium-emphasis">Pull Requests</span>
              <v-icon size="18">mdi-git</v-icon>
            </div>
            <div class="text-h5 mb-1">{{ totals.pullRequests }}</div>
            <div class="text-caption text-medium-emphasis">PRs opened</div>
          </BaseCard>
        </v-col>

        <v-col cols="12" md="3">
          <BaseCard class="pa-4">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="text-caption text-medium-emphasis">Issues</span>
              <v-icon size="18">mdi-alert-circle-outline</v-icon>
            </div>
            <div class="text-h5 mb-1">{{ totals.issues }}</div>
            <div class="text-caption text-medium-emphasis">Issues created</div>
          </BaseCard>
        </v-col>

        <v-col cols="12" md="3">
          <BaseCard class="pa-4">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="text-caption text-medium-emphasis">Role</span>
              <v-icon size="18">mdi-account-badge-outline</v-icon>
            </div>
            <div class="text-h6 mb-1 text-capitalize">
              {{ collaborator.role }}
            </div>
            <div class="text-caption text-medium-emphasis">Repository permission</div>
          </BaseCard>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <StatisticGraph :items="chartData" />
        </v-col>
        <v-col cols="6">
          <CodeChangesCard
            :additions="mockStats.additions"
            :deletions="mockStats.deletions"
          />
        </v-col>
      </v-row>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { useRoute } from 'vue-router'

import BaseCard from '@/components/BaseCard/BaseCard.vue'
import { ApiClientKey } from '@/plugins/api.ts'
import { LoggerKey } from '@/plugins/logger.ts'
import StatisticGraph, { type CommitData } from '@/components/StatisticGraph/StatisticGraph.vue'
import CodeChangesCard, { type CodeChangeStats } from '@/components/CodeChangesCard/CodeChangesCard.vue';

// Mock Data
const mockStats = ref<CodeChangeStats>({
  additions: 12543,
  deletions: 4321
});
const route = useRoute()

const chartData = ref<CommitData[]>([
  { label: 'W1', value: 14 },
  { label: 'W2', value: 20 },
  { label: 'W3', value: 16 },
  { label: 'W4', value: 21 },
  { label: 'W5', value: 22 },
  { label: 'W6', value: 17 },
  { label: 'W7', value: 17 },
  { label: 'W8', value: 18 },
  { label: 'W9', value: 15 },
  { label: 'W10', value: 21 },
  { label: 'W11', value: 23 },
  { label: 'W12', value: 17 },
])

const api = inject(ApiClientKey)
if (!api) throw new Error('ApiClient not provided')

const logger = inject(LoggerKey)
if (!logger) throw new Error('logger not provided')


const collaborator = ref({
  login: (route.query.login as string) || '',
  avatarUrl: '',
  name: '',
  role: '',
})


const totals = ref({
  totalCommits: 0,
  pullRequests: 0,
  issues: 0,
})

/* API Fetch */
// const loadCollaboratorStats = async () => {
//   if (!currentRepoFullName.value || !collaborator.value.login) return
//
//   try {
//     const repo = encodeURIComponent(currentRepoFullName.value)
//     const login = encodeURIComponent(collaborator.value.login)
//
//     const dto = await api.get<ICollaboratorStatsDTO>(
//       `/api/github/repositories/${repo}/collaborators/${login}?timeRange=${encodeURIComponent(
//         timeRange.value,
//       )}`,
//     )
//
//     const collaboratorsList = dto.collaborators
//
//     collaborator.value.avatarUrl = collaboratorsList.avatarUrl
//     collaborator.value.role = collaboratorsList.role
//
//     totals.value = {
//       totalCommits: collaboratorsList.commits,
//       pullRequests: collaboratorsList.pullRequests,
//       issues: collaboratorsList.issues,
//     }
//   } catch (err) {
//     logger.error('Error fetching collaborator stats', { err })
//   }
// }


/* Lifecycle - leave it - it's important to have when we have backend
// onMounted(async () => {
//   await loadCollaboratorStats()
// })
//
// watch(timeRange, async () => {
//   await loadCollaboratorStats()
// })*/
</script>
