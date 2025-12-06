<template>
  <v-app>
    <v-main>
      <v-container
        class="bg-grey-lighten-5">
    <!-- Título + descrição + logout no topo -->
        <v-row class="align-center">
          <v-col cols="12" md="8">
            <h1 class="text-h4 font-weight-medium mb-2">
              Select Repository
            </h1>
            <p class="text-body-2 text-medium-emphasis">
              Choose a repository to view detailed analytics and collaborator dashboards
            </p>
          </v-col>

          <v-col
            cols="12"
            md="4"
            class="d-flex justify-end mt-4 mt-md-0"
          >
            <BaseButton
              color="red"
              label="Logout"
              class="logout-button"
              @click="handleLogout"
            />
          </v-col>
        </v-row>

        <!-- Linha de cima: Enter URL + Your Repositories lado a lado -->
        <v-row class="mt-6" align="stretch">
          <!-- Enter Repository URL -->
          <v-col cols="12" md="6">
            <BaseCard class="pa-6">
              <h2 class="text-subtitle-1 font-weight-medium mb-1">
                Enter Repository URL
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Paste the GitHub repository URL directly
              </p>

              <v-text-field
                v-model="repositoryUrl"
                placeholder="https://github.com/owner/repository"
                variant="outlined"
                density="comfortable"
                hide-details
                class="mb-4"
              />

              <BaseButton
                color="black"
                block
                @click="handleLoadRepository"
              >
                <template #default>
                  <v-icon start>mdi-magnify</v-icon>
                  Load Repository
                </template>
              </BaseButton>
            </BaseCard>
          </v-col>

          <!-- Your Repositories (dropdown) -->
          <v-col cols="12" md="6">
            <BaseCard class="pa-6">
              <h2 class="text-subtitle-1 font-weight-medium mb-1">
                Your Repositories
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Select from your accessible repositories
              </p>

              <RepositoriesList
                :repositories="repositories"
                :onSelect="handleSelectRepo"
              />
            </BaseCard>
          </v-col>
        </v-row>

        <!-- Recent Repositories a ocupar a largura toda -->
        <v-row class="mt-8">
          <v-col cols="12">
            <h2 class="text-subtitle-1 font-weight-medium mb-4">
              Recent Repositories
            </h2>

            <v-row dense>
              <v-col
                v-for="repo in repositories"
                :key="repo.fullName"
                cols="12"
              >
                <RepositoryCard  :repo="repo"
                                 :onSelect="handleSelectRepo"/>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'

import BaseCard from '@/components/BaseCard/BaseCard.vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import RepositoriesList from '@/components/RepositoriesList/RepositoriesList.vue'
import type { IRepository } from '@/models/IRepository.ts'
import { ApiClientKey } from '@/plugins/api.ts'
import type { IRepositoryDTO } from '@/models/IRepositoryDTO.ts'
import { LoggerKey } from '@/plugins/logger.ts'
import RepositoryCard from '@/components/RepositoryCard/RepositoryCard.vue'
import { useRepositoryStore } from '@/stores/repository'

const api = inject(ApiClientKey)
if (!api) {
  throw new Error('ApiClient not provided')
}

const logger = inject(LoggerKey)
if (!logger) {
  throw new Error('logger not provided')
}

const router = useRouter()

const repoStore = useRepositoryStore()

const repositories = ref<IRepository[]>([])
const repositoryUrl = ref('')

const loadRepositories = async () => {
  try {
    const res = await api.get<IRepositoryDTO>('/api/github/repositories')
    repositories.value = res.repositories
  } catch (e) {
    logger.error('Error loading repositories', { error: e })
  }
}

const handleSelectRepo = (repo: IRepository) => {
  repoStore.setCurrentRepository(repo)
  router.push({
    name: 'stats'
  })
}


const handleLogout = async () => {
  await api.post('/logout')
  router.push('/')
}

// por agora só faz log; depois podes ligar isto ao backend
const handleLoadRepository = () => {
  if (!repositoryUrl.value) return
  logger.info('Load repository by URL clicked', { url: repositoryUrl.value })
}

onMounted(async () => {
  await loadRepositories()
})

</script>

<style scoped>
.repo-card {
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}
.repo-card:hover {
  transform: translateY(-1px);
}
.logout-button {
  min-width: 120px;
}
</style>
