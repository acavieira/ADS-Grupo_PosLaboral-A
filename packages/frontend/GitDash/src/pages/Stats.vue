<template>
  <BaseLayout>
    <!-- Top bar: Change Repository + time range -->
    <v-row class="align-center mb-4">
      <v-col cols="12" md="8" class="d-flex align-center ga-4">
        <BaseButton
          color="grey"
          class="text-none"
          @click="goBack"
        >
          <template #default>
            <v-icon start>mdi-arrow-left</v-icon>
            Change Repository
          </template>
        </BaseButton>

        <span class="text-subtitle-1 font-weight-medium" v-if="currentRepo">
          {{ currentRepo.fullName }}
        </span>
      </v-col>

      <v-col cols="12" md="4" class="d-flex justify-end">
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

    <!-- Tabs + avatars -->
    <v-row class="mb-4">
      <v-col cols="12">
        <HeaderMenu
          v-model="activeTab"
          :collaborators="headerCollaborators"
          @tabChange="handleTabChange"
        />
      </v-col>
    </v-row>

    <!-- Repository overview card -->
    <v-row v-if="currentRepo" class="mb-6">
      <v-col cols="12">
        <BaseCard class="pa-6">
          <h2 class="text-h6 mb-1">
            {{ currentRepo.fullName }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-3">
            {{ currentRepo.description || 'No description available.' }}
          </p>

          <div class="d-flex align-center text-body-2 ga-4">
            <span>
              <v-icon size="16" class="mr-1">mdi-star-outline</v-icon>
              {{ currentRepo.starred }} stars
            </span>
            <span>
              <v-icon size="16" class="mr-1">mdi-source-fork</v-icon>
              {{ currentRepo.forked }} forks
            </span>
            <v-chip size="x-small" color="grey-lighten-3" class="text-caption">
              Public
            </v-chip>
          </div>
        </BaseCard>
      </v-col>
    </v-row>

    <!-- Main stats grid (Overview tab) -->
    <v-row v-if="activeTab === 'overview'" class="ga-4 mb-6">
      <v-col cols="12" md="4">
        <BaseCard class="pa-5">
          <div class="text-subtitle-2 mb-2">
            Commits ({{ rangeTitle }})
          </div>
          <div class="text-h5 mb-1">{{ stats.commitsLast7 }}</div>
          <div class="text-caption text-medium-emphasis">Active development</div>
        </BaseCard>
      </v-col>

      <v-col cols="12" md="4">
        <BaseCard class="pa-5">
          <div class="text-subtitle-2 mb-2">
            PRs Merged ({{ rangeTitle }})
          </div>
          <div class="text-h5 mb-1">{{ stats.prsMergedLast7 }}</div>
          <div class="text-caption text-medium-emphasis">High velocity</div>
        </BaseCard>
      </v-col>

      <v-col cols="12" md="4">
        <BaseCard class="pa-5">
          <div class="text-subtitle-2 mb-2">
            Issues Closed ({{ rangeTitle }})
          </div>
          <div class="text-h5 mb-1">{{ stats.issuesClosedLast7 }}</div>
          <div class="text-caption text-medium-emphasis">Resolving quickly</div>
        </BaseCard>
      </v-col>
    </v-row>

    <!-- Bottom cards -->
    <v-row v-if="activeTab === 'overview'" class="ga-4">
      <v-col cols="12" md="6">
        <BaseCard class="pa-5">
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
        <BaseCard class="pa-5">
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

    <!-- Collaborators tab -->
    <v-row v-if="activeTab === 'collaborators'" class="mt-4">
      <v-col cols="12">
        <CollaboratorsTable :collaborators="collaboratorsDetailed" />
      </v-col>
    </v-row>
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseLayout from '@/components/BaseLayout/BaseLayout.vue'
import BaseCard from '@/components/BaseCard/BaseCard.vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import HeaderMenu from '@/components/HeaderMenu/HeaderMenu.vue'
import CollaboratorsTable from '@/components/Collaborators/Collaborators.vue'

import type { IRepository } from '@/models/IRepository.ts'
import type { IRepositoryDTO } from '@/models/IRepositoryDTO.ts'
import type { IRepoOverviewStatsDTO } from '@/models/IRepoOverviewStatsDTO.ts'
import { ApiClientKey } from '@/plugins/api.ts'
import { LoggerKey } from '@/plugins/logger.ts'
import { useUserStore } from '@/stores/user'

const api = inject(ApiClientKey)
if (!api) throw new Error('ApiClient not provided')

const logger = inject(LoggerKey)
if (!logger) throw new Error('logger not provided')

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { fetchUser } = userStore

// ------- Tipos -------

type Role = 'admin' | 'write' | 'read'

interface CollaboratorStats {
  login: string
  avatarUrl: string
  role: Role
  commits: number
  pullRequests: number
  issues: number
}

// ------- Estado -------

const activeTab = ref('overview')

// estes valores são os que o backend espera (1 week, 1 month, 3 months)
const timeRange = ref('1 week')
const timeRanges = [
  { title: 'Last Week', value: '1 week' },
  { title: 'Last Month', value: '1 month' },
  { title: 'Last 3 months', value: '3 months' },
]

// texto humano para mostrar nos cards (Commits (Last Week / Last Month))
const rangeTitle = computed(() => {
  return timeRanges.find(tr => tr.value === timeRange.value)?.title ?? 'Last Week'
})

const repositories = ref<IRepository[]>([])

// colaboradores detalhados (para a tabela)
const collaboratorsDetailed = ref<CollaboratorStats[]>([])

// colaboradores para o HeaderMenu (apenas avatar + link)
const headerCollaborators = computed(() =>
  collaboratorsDetailed.value.map(c => ({
    login: c.login,
    avatar_url: c.avatarUrl,
    html_url: `https://github.com/${c.login}`,
  }))
)

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

const repoFullName = computed(() => route.query.repo as string | undefined)

const currentRepo = computed<IRepository | null>(() => {
  if (!repoFullName.value) return null
  return repositories.value.find(r => r.fullName === repoFullName.value) ?? null
})

// ------- Navegação -------

const goBack = () => {
  router.push('/dashboard')
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

// ------- Loads do backend -------

const loadRepositories = async () => {
  try {
    const res = await api.get<IRepositoryDTO>('/api/github/repositories')
    repositories.value = res.repositories
  } catch (e) {
    logger.error('Error loading repositories in stats page', { error: e })
  }
}

// stats do repositório
const loadRepoStats = async () => {
  if (!repoFullName.value) return

  try {
    const encodedName = encodeURIComponent(repoFullName.value)
    const url = `/api/github/repositories/${encodedName}/stats?timeRange=${encodeURIComponent(
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
      repo: repoFullName.value,
      timeRange: timeRange.value,
    })
  }
}

// colaboradores do repositório
const loadCollaborators = async () => {
  if (!repoFullName.value) return

  try {
    const encodedName = encodeURIComponent(repoFullName.value)
    const url = `/api/github/repositories/${encodedName}/collaborators?timeRange=${encodeURIComponent(
      timeRange.value
    )}`

    // o backend devolve List<Collaborator>, que aqui mapeamos para o tipo CollaboratorStats
    const dto = await api.get<CollaboratorStats[]>(url)
    collaboratorsDetailed.value = dto
  } catch (e) {
    logger.error('Error loading collaborators', {
      error: e,
      repo: repoFullName.value,
      timeRange: timeRange.value,
    })
  }
}

// ------- Ciclo de vida / watchers -------

onMounted(async () => {
  await fetchUser()
  await loadRepositories()

  if (!repoFullName.value) {
    router.push({ name: 'dashboard' })
    return
  }

  await loadRepoStats()
  await loadCollaborators()
})

// sempre que mudar o timeRange, recarrega stats + colaboradores
watch(timeRange, async () => {
  await loadRepoStats()
  await loadCollaborators()
})
</script>
