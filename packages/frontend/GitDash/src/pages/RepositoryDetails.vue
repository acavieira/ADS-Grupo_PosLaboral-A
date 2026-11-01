<template>
  <BaseLayout
    :tabs="tabs"
    :active-tab="activeTab"
    :repository-name="repositoryName"
    @tab-change="handleTabChange"
  >
    <v-card flat>
      <v-card-text class="bg-grey-lighten-5">
        <div v-if="isLoading" class="d-flex justify-center pa-4">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else>
          <div v-if="activeTab === 'overview'">
            <Overview :repository-name="repositoryName" />
          </div>
          <div v-else-if="activeTab === 'collaborators'">
            <v-col cols="12">
              <DataErrorAlert
                v-if="error"
                :resource-name="repositoryName"
                @retry="fetchCollaborators"
              >
                We could not retrieve the list of collaborators. This usually happens because you
                lack permissions to view members of this repository.
              </DataErrorAlert>

              <CollaboratorsTable v-else v-model:pseudonymize="pseudonymize" :collaborators="collaborators" />
            </v-col>
          </div>
          <div v-else-if="activeCollaborator">
            <PersonalStats
              :collaborator="activeCollaborator.reference ?? activeCollaborator.login"
              :key="activeCollaborator.login"
            />
          </div>
        </template>
      </v-card-text>
    </v-card>
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseLayout from '@/components/BaseLayout/BaseLayout.vue'
import Overview from '@/pages/Overview.vue'
import CollaboratorsTable from '@/components/Collaborators/Collaborators.vue'
import PersonalStats from '@/pages/PersonalStats.vue'
import { PSEUDONYM_AVATAR_SRC } from '@/components/Collaborators/pseudonymAvatar'
import { useRepositoryCollaborators } from '@/composables/useRepositoryCollaborators'
import { useRepositoryStore } from '@/stores/repository.ts'
import { storeToRefs } from 'pinia'
import { DataErrorAlert, type ITab } from '@git-dash/ui'

const { collaborators, isLoading, error, fetchCollaborators, pseudonymize, repositoryLabel } =
  useRepositoryCollaborators()

const repoStore = useRepositoryStore()
const { currentRepository } = storeToRefs(repoStore)

// O dono faz parte do nome do repositório: num repositório pessoal é o admin, ou seja, o "Colaborador 1".
// Com pseudónimos usa-se a etiqueta da API ("Colaborador 1/repo"); enquanto não há resposta (ou se a lista
// falhar) esconde-se o dono, para o nome real nunca aparecer.
const repositoryName = computed((): string => {
  const fullName = currentRepository.value?.fullName ?? ''
  if (!pseudonymize.value) return fullName

  return repositoryLabel.value ?? `•••/${fullName.split('/').slice(1).join('/')}`
})

const baseTabs: ITab[] = [
  { key: 'overview', title: 'Repository Overview' },
  { key: 'collaborators', title: 'Collaborators' },
]

// Com pseudónimos as bolinhas mantêm-se, mas com o avatar genérico e o pseudónimo como título.
const collaboratorTabs = computed((): ITab[] =>
  collaborators.value.map((collaborator) => ({
    key: collaborator.login,
    title: collaborator.login,
    icon: pseudonymize.value ? PSEUDONYM_AVATAR_SRC : collaborator.avatarUrl,
  })),
)

const tabs = computed((): ITab[] => {
  return [...baseTabs, ...collaboratorTabs.value]
})

const activeTab = ref<string>('overview')

const activeCollaborator = computed(() => {
  return collaborators.value.find((c) => c.login === activeTab.value)
})

const handleTabChange = (key: string) => {
  activeTab.value = key
}

// Os pseudónimos são refeitos a cada pedido: depois de a lista mudar, "Colaborador 3" pode já ser
// outra pessoa, por isso uma vista individual aberta volta à tabela em vez de mostrar dados trocados.
watch(collaborators, () => {
  if (pseudonymize.value && !baseTabs.some((tab) => tab.key === activeTab.value)) {
    activeTab.value = 'collaborators'
  }
})
</script>