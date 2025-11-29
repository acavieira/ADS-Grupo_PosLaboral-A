<template>
  <BaseLayout>
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
            <BaseCard class="pa-4 d-flex align-center" @click="handleSelectRepo(repo)">
              <v-avatar size="40" class="mr-4">
                <v-img src="/github-icon.png" alt="Repository" />
              </v-avatar>

              <div class="flex-grow-1">
                <div class="d-flex align-center mb-1">
                  <span class="text-body-2 font-weight-medium mr-2">
                    {{ repo.fullName }}
                  </span>
                  <v-chip
                    size="x-small"
                    color="grey-lighten-3"
                    class="text-caption"
                  >
                    Public
                  </v-chip>
                </div>

                <p class="text-caption text-medium-emphasis mb-2">
                  {{ repo.description || 'No description available.' }}
                </p>

                <div class="d-flex align-center text-caption text-medium-emphasis ga-4">
                  <span>
                    <v-icon size="14" class="mr-1">mdi-star-outline</v-icon>
                    {{ repo.starred }}
                  </span>
                  <span>
                    <v-icon size="14" class="mr-1">mdi-source-fork</v-icon>
                    {{ repo.forked }}
                  </span>
                </div>
              </div>
            </BaseCard>
          </v-col>
        </v-row>
      </v-col>
    </v-row>


  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores/user'
import BaseLayout from '@/components/BaseLayout/BaseLayout.vue'
import BaseCard from '@/components/BaseCard/BaseCard.vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import RepositoriesList from '@/components/RepositoriesList/RepositoriesList.vue'
import type { IRepository } from '@/models/IRepository.ts'
import { ApiClientKey } from '@/plugins/api.ts'
import type { IRepositoryDTO } from '@/models/IRepositoryDTO.ts'
import { LoggerKey } from '@/plugins/logger.ts'

const api = inject(ApiClientKey)
if (!api) {
  throw new Error('ApiClient not provided')
}

const logger = inject(LoggerKey)
if (!logger) {
  throw new Error('logger not provided')
}

const router = useRouter()
const userStore = useUserStore()
const { fetchUser, logout } = userStore

const repositories = ref<IRepository[]>([])
const selectedRepo = ref<IRepository | null>(null)
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
  selectedRepo.value = repo
  router.push({
    name: 'stats',
    query: { repo: repo.fullName },   // ex.: ?repo=owner/proj
  })
}


const handleLogout = async () => {
  await logout()
  router.push('/')
}

// por agora só faz log; depois podes ligar isto ao backend
const handleLoadRepository = () => {
  if (!repositoryUrl.value) return
  logger.info('Load repository by URL clicked', { url: repositoryUrl.value })
}

onMounted(async () => {
  await fetchUser()
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
