<template>
  <BaseLayout>
    <!-- Top bar: Change Repository + collaborator + time range -->
    <v-row class="align-center mb-4">
      <v-col cols="12" md="4" class="d-flex align-center ga-4">
        <BaseButton color="grey" class="text-none" @click="goBack">
          <template #default>
            <v-icon start>mdi-arrow-left</v-icon>
            Change Repository
          </template>
        </BaseButton>

        <div class="d-flex align-center ga-2">
          <v-avatar size="32">
            <v-img :src="collaborator.avatarUrl" :alt="collaborator.login" />
          </v-avatar>
          <div class="d-flex flex-column">
            <span class="text-subtitle-2 font-weight-medium">
              {{ collaborator.name || collaborator.login }}
            </span>
            <span class="text-caption text-medium-emphasis">
              {{ currentRepoFullName }}
            </span>
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="8" class="d-flex justify-end">
        <v-select
          v-model="timeRange"
          :items="timeRanges"
          item-title="title"
          item-value="value"
          density="comfortable"
          variant="outlined"
          hide-details
          style="max-width: 180px"
        />
      </v-col>
    </v-row>

    <!-- Tabs + collaborator chips -->
    <v-row class="mb-4">
      <v-col cols="12">
        <HeaderMenu
          v-model="activeTab"
          :collaborators="headerCollaborators"
          @tabChange="handleTabChange"
        />
      </v-col>
    </v-row>

    <!-- Only overview makes sense here -->
    <template v-if="activeTab === 'overview'">
      <!-- Personal KPIs -->
      <v-row class="ga-4 mb-4">
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
      <v-row justify="center">
        <v-col cols="12" md="8">
          <StatisticGraph :items="chartData" />
        </v-col>
      </v-row>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseLayout from '@/components/BaseLayout/BaseLayout.vue'
import BaseCard from '@/components/BaseCard/BaseCard.vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import HeaderMenu from '@/components/HeaderMenu/HeaderMenu.vue'

import type { ICollaboratorStatsDTO } from '@/models/ICollaboratorStatsDTO'
import { ApiClientKey } from '@/plugins/api.ts'
import { LoggerKey } from '@/plugins/logger.ts'
import StatisticGraph, { type CommitData } from '@/components/StatisticGraph/StatisticGraph.vue'

const router = useRouter()
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

/* State */
const activeTab = ref('overview')
const timeRange = ref('1 month') // default
const timeRanges = [
  { title: 'Last week', value: '1 week' },
  { title: 'Last month', value: '1 month' },
  { title: 'Last 3 months', value: '3 months' },
]

const currentRepoFullName = computed(() => (route.query.repo as string) || '')

const collaborator = ref({
  login: (route.query.login as string) || '',
  avatarUrl: '',
  name: '',
  role: '',
})

const headerCollaborators = ref([])

const totals = ref({
  totalCommits: 0,
  pullRequests: 0,
  issues: 0,
})

/* API Fetch */
const loadCollaboratorStats = async () => {
  if (!currentRepoFullName.value || !collaborator.value.login) return

  try {
    const repo = encodeURIComponent(currentRepoFullName.value)
    const login = encodeURIComponent(collaborator.value.login)

    const dto = await api.get<ICollaboratorStatsDTO>(
      `/api/github/repositories/${repo}/collaborators/${login}?timeRange=${encodeURIComponent(
        timeRange.value,
      )}`,
    )

    collaborator.value.avatarUrl = dto.avatarUrl
    collaborator.value.role = dto.role

    totals.value = {
      totalCommits: dto.commits,
      pullRequests: dto.pullRequests,
      issues: dto.issues,
    }
  } catch (err) {
    logger.error('Error fetching collaborator stats', { err })
  }
}

/* Navigation */
const goBack = () => {
  router.push({
    name: 'stats',
    query: { repo: currentRepoFullName.value },
  })
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

/* Lifecycle */
onMounted(async () => {
  await loadCollaboratorStats()
})

watch(timeRange, async () => {
  await loadCollaboratorStats()
})
</script>
