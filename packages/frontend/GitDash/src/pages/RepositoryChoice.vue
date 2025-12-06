<template>
  <v-app>
    <v-main>
      <v-container class="bg-grey-lighten-5">

        <v-row class="align-center">
          <v-col cols="12" md="8">
            <h1 class="text-h4 font-weight-medium mb-2">Select Repository</h1>
            <p class="text-body-2 text-medium-emphasis">
              Choose a repository to view detailed analytics and collaborator dashboards
            </p>
          </v-col>
          <v-col cols="12" md="4" class="d-flex justify-end mt-4 mt-md-0">
            <BaseButton
              color="red"
              label="Logout"
              class="logout-button"
              @click="handleLogout"
            />
          </v-col>
        </v-row>

        <v-row class="mt-6" align="stretch">
          <v-col cols="12" md="6">
            <RepoUrlInputCard @load-url="handleLoadByUrl" />
          </v-col>

          <v-col cols="12" md="6">
            <UserRepositoriesCard
              :repositories="allRepositories"
              :onSelect="handleSelectRepo"
            />
          </v-col>
        </v-row>

        <v-row class="mt-8">
          <v-col cols="12">
            <h2 class="text-subtitle-1 font-weight-medium mb-4">
              Recent Repositories
            </h2>

            <div v-if="isLoading" class="d-flex justify-center pa-4">
              <v-progress-circular indeterminate color="primary" />
            </div>

            <v-row v-else dense>
              <v-col
                v-for="repo in recentRepositories"
                :key="repo.fullName"
                cols="12"
              >
                <RepositoryCard
                  :repo="repo"
                  :onSelect="handleSelectRepo"
                />
              </v-col>

              <v-col v-if="recentRepositories.length === 0" cols="12">
                <p class="text-caption text-center text-grey">No recent repositories found.</p>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import RepositoryCard from '@/components/RepositoryCard/RepositoryCard.vue'
import RepoUrlInputCard from '@/components/RepoUrlInputCard/RepoUrlInputCard.vue'
import UserRepositoriesCard from '@/components/UserRepositoriesCard/UserRepositoriesCard.vue'

import { ApiClientKey } from '@/plugins/api'
import { LoggerKey } from '@/plugins/logger'
import { useRepositoryStore } from '@/stores/repository'
import type { IRepository } from '@/models/IRepository'
import { useRepositories } from '@/composables/useRepositories'

const api = inject(ApiClientKey)
const logger = inject(LoggerKey)
const router = useRouter()
const repoStore = useRepositoryStore()

const {
  allRepositories,
  recentRepositories,
  isLoading,
  init: initRepositories
} = useRepositories()

const handleSelectRepo = (repo: IRepository) => {
  repoStore.setCurrentRepository(repo)
  router.push({ name: 'repository-details' })
}

const handleLoadByUrl = (url: string) => {
  logger?.info('Load repository by URL clicked', { url })
  // Implement actual loading logic here
}

const handleLogout = async () => {
  if (api) await api.post('/logout')
  router.push('/')
}

onMounted(async () => {
  await initRepositories()
})
</script>

<style scoped>
.logout-button {
  min-width: 120px;
}
</style>
