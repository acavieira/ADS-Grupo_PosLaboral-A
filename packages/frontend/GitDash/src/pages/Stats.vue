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
          :collaborators="collaborators"
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
          <div class="text-subtitle-2 mb-2">Commits (Last 7 days)</div>
          <div class="text-h5 mb-1">{{ stats.commitsLast7 }}</div>
          <div class="text-caption text-medium-emphasis">Active development</div>
        </BaseCard>
      </v-col>

      <v-col cols="12" md="4">
        <BaseCard class="pa-5">
          <div class="text-subtitle-2 mb-2">PRs Merged (Last 7 days)</div>
          <div class="text-h5 mb-1">{{ stats.prsMergedLast7 }}</div>
          <div class="text-caption text-medium-emphasis">High velocity</div>
        </BaseCard>
      </v-col>

      <v-col cols="12" md="4">
        <BaseCard class="pa-5">
          <div class="text-subtitle-2 mb-2">Issues Closed (Last 7 days)</div>
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

    <!-- Collaborators tab (simples por enquanto) -->
    <v-row v-if="activeTab === 'collaborators'" class="mt-4">
      <v-col cols="12">
        <BaseCard class="pa-5">
          <h3 class="text-h6 mb-3">Collaborators</h3>
          <ul>
            <li v-for="c in collaborators" :key="c.login">
              <a :href="c.html_url" target="_blank">{{ c.login }}</a>
            </li>
          </ul>
        </BaseCard>
      </v-col>
    </v-row>
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseLayout from '@/components/BaseLayout/BaseLayout.vue'
import BaseCard from '@/components/BaseCard/BaseCard.vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import HeaderMenu from '@/components/HeaderMenu/HeaderMenu.vue'
import type { IRepository } from '@/models/IRepository.ts'
import type { IRepositoryDTO } from '@/models/IRepositoryDTO.ts'
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

const activeTab = ref('overview')
const timeRange = ref('last-7d')
const timeRanges = [
  { title: 'Last 7 days', value: 'last-7d' },
  { title: 'Last 30 days', value: 'last-30d' },
]

const repositories = ref<IRepository[]>([])
const collaborators = ref([
  // placeholder; depois vais buscar ao endpoint de colaboradores
  {
    login: 'alice_dev',
    avatar_url: '/avatars/alice.png',
    html_url: 'https://github.com/alice_dev',
  },
  {
    login: 'bob_coder',
    avatar_url: '/avatars/bob.png',
    html_url: 'https://github.com/bob_coder',
  },
  {
    login: 'charlie_123',
    avatar_url: '/avatars/charlie.png',
    html_url: 'https://github.com/charlie_123',
  },
])

// stats fictícios por agora; depois ligamos ao /api/github/.../stats
const stats = ref({
  commitsLast7: 45,
  prsMergedLast7: 12,
  issuesClosedLast7: 18,
  openPrs: 8,
  openIssues: 23,
  peakDay: 'Wednesday',
  peakHour: '14:00 - 15:00',
  teamSize: 5,
})

const repoFullName = computed(() => route.query.repo as string | undefined)

const currentRepo = computed<IRepository | null>(() => {
  if (!repoFullName.value) return null
  return repositories.value.find(r => r.fullName === repoFullName.value) ?? null
})

const goBack = () => {
  router.push('/dashboard')
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

const loadRepositories = async () => {
  try {
    const res = await api.get<IRepositoryDTO>('/api/github/repositories')
    repositories.value = res.repositories
  } catch (e) {
    logger.error('Error loading repositories in stats page', { error: e })
  }
}

onMounted(async () => {
  await fetchUser()
  await loadRepositories()
  if (!repoFullName.value) {
    // se alguém entrar direto em /stats sem query, volta ao dashboard
    router.push({ name: 'dashboard' })
  }
})
</script>
