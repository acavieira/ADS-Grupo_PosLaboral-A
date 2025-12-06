<template>
  <BaseLayout
    :tabs="tabs"
    :active-tab="activeTab"
    @tab-change="handleTabChange"
  >
    <v-card flat>
      <v-card-text>
        <div v-if="isLoading" class="d-flex justify-center pa-4">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else>
          <div v-if="activeTab === 'overview'">
            <Overview />
          </div>
          <div v-else-if="activeTab === 'collaborators'">
            <v-col cols="12">
              <CollaboratorsTable :collaborators="collaborators" />
            </v-col>
          </div>
          <div v-else-if="collaboratorTabs.some(tab => tab.key === activeTab)">
            <PersonalStats />
          </div>
        </template>
      </v-card-text>
    </v-card>
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Tab } from '@/models/Tab.ts'
import BaseLayout from '@/components/BaseLayout/BaseLayout.vue'
import Overview from '@/pages/Overview.vue'
import CollaboratorsTable from '@/components/Collaborators/Collaborators.vue'
import PersonalStats from '@/pages/PersonalStats.vue'
import { useRepositoryCollaborators } from '@/composables/useRepositoryCollaborators'

const { collaborators, isLoading } = useRepositoryCollaborators()

const baseTabs: Tab[] = [
  { key: 'overview', title: 'Repository Overview' },
  { key: 'collaborators', title: 'Collaborators' },
]

const collaboratorTabs = computed((): Tab[] => {
  return collaborators.value.map((collaborator) => ({
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
</script>
