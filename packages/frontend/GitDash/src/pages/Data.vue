<template>
  <BaseLayout
    :tabs="tabs"
    :active-tab="activeTab"
    @tab-change="handleTabChange"
  >
    <v-card flat>
      <v-card-text>
        <div v-if="activeTab === 'overview'">
          <Overview />
        </div>
        <div v-else-if="activeTab === 'collaborators'">
          <v-col cols="12">
            <CollaboratorsTable :collaborators="collaboratorsDetailed" />
          </v-col>
        </div>
        <div v-else-if="collaboratorTabs.some(tab => tab.key === activeTab)">
          <PersonalStats />
        </div>
      </v-card-text>
    </v-card>
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import type { Tab } from '@/models/Tab.ts'
import BaseLayout from '@/components/BaseLayout/BaseLayout.vue'
import Overview from '@/pages/Overview.vue'
import CollaboratorsTable from '@/components/Collaborators/Collaborators.vue'
import { ApiClientKey } from '@/plugins/api.ts'
import { LoggerKey } from '@/plugins/logger.ts'
import type { ICollaboratorStatsDTO } from '@/models/ICollaboratorStatsDTO.ts'
import { useRepositoryStore } from '@/stores/repository'
import { useTimeRangeStore } from '@/stores/timeRange.ts'
import { storeToRefs } from 'pinia'
import PersonalStats from '@/pages/PersonalStats.vue'
import type { ICollaboratorStats } from '@/models/ICollaboratorStats.ts'

const api = inject(ApiClientKey)
if (!api) {
  throw new Error('ApiClient not provided')
}

const logger = inject(LoggerKey)
if (!logger) {
  throw new Error('logger not provided')
}

const repoStore = useRepositoryStore()
const timeStore = useTimeRangeStore()
const { currentRepository, getCurrentRepositoryFullName } = storeToRefs(repoStore)
const { timeRange } = storeToRefs(timeStore)


const baseTabs: Tab[] = [
  { key: 'overview', title: 'Repository Overview' },
  { key: 'collaborators', title: 'Collaborators' },
]

const collaboratorTabs = computed((): Tab[] => {
  return collaboratorsDetailed.value.map((collaborator) => ({
    key: collaborator.login,
    title: collaborator.login,
    icon: collaborator.avatarUrl,
  }))
})

const tabs = computed((): Tab[] => {
  return [...baseTabs, ...collaboratorTabs.value]
})

const activeTab = ref<string>('overview')

const handleTabChange = (key: string) => {
  activeTab.value = key
}

const collaboratorsDetailed = ref<ICollaboratorStats[]>([])

// --- Original Function Revised ---

const loadCollaborators = async () => {
  // Use the reactive references from Pinia
  if (!getCurrentRepositoryFullName.value) return

  try {
    const encodedName = encodeURIComponent(getCurrentRepositoryFullName.value)
    const url = `/api/github/collaborators/${encodedName}/${encodeURIComponent(timeRange.value)}`

    const dto = await api.get<ICollaboratorStatsDTO>(url)
    collaboratorsDetailed.value = dto.collaborators;
  } catch (e) {
    logger.error('Error loading collaborators', {
      error: e,
      repo: getCurrentRepositoryFullName.value,
      timeRange: timeRange.value,
    })
  }
}

// Trigger the loading function whenever the state changes
watch(
  [currentRepository, timeRange],
  ([newRepoName, newTimeRange], [oldRepoName, oldTimeRange]) => {
    // Only call the function if the repository name has a value
    // and either the repository or the time range has actually changed.
    if (newRepoName && (newRepoName !== oldRepoName || newTimeRange !== oldTimeRange)) {
      loadCollaborators()
    }
  },
  { immediate: true },
)
</script>
