<template>
  <BaseLayout
    :tabs="tabs"
    :active-tab="activeTab"
    @tab-change="handleTabChange"
  >
    <v-card flat>
      <v-card-text class="bg-grey-lighten-5">
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
          <div v-else-if="activeCollaborator">
            <PersonalStats :collaborator="activeCollaborator.login" :key="activeCollaborator.login"/>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ITab } from '@/models/ITab.ts'
import BaseLayout from '@/components/BaseLayout/BaseLayout.vue'
import Overview from '@/pages/Overview.vue'
import CollaboratorsTable from '@/components/Collaborators/Collaborators.vue'
import PersonalStats from '@/pages/PersonalStats.vue'
import { useRepositoryCollaborators } from '@/composables/useRepositoryCollaborators'

const { collaborators, isLoading } = useRepositoryCollaborators()

const baseTabs: ITab[] = [
  { key: 'overview', title: 'Repository Overview' },
  { key: 'collaborators', title: 'Collaborators' },
]

const collaboratorTabs = computed((): ITab[] => {
  return collaborators.value.map((collaborator) => ({
    key: collaborator.login,
    title: collaborator.login,
    icon: collaborator.avatarUrl,
  }))
})

const tabs = computed((): ITab[] => {
  return [...baseTabs, ...collaboratorTabs.value]
})

const activeTab = ref<string>('overview')

const activeCollaborator = computed(() => {
  return collaborators.value.find(c => c.login === activeTab.value)
})

const handleTabChange = (key: string) => {
  activeTab.value = key
}
</script>
