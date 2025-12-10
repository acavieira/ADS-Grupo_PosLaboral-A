<template>
  <v-app>
    <v-main class="bg-grey-lighten-5">
      <v-container class="mx-auto px-6 pt-6" style="max-width: 1100px;">

        <v-row class="align-center">
          <v-col cols="12" md="8">
            <h1 class="text-h5 font-weight-bold mb-2">Select Repository</h1>
            <p class="text-h6 text-medium-emphasis">
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

        <v-row v-if="urlError" class="mt-4">
          <v-col cols="12">
            <v-alert
              type="error"
              title="Unable to load repository"
              closable
              variant="tonal"
              @click:close="urlError = ''"
            >
<!--              {{ urlError }}-->
              You don't have enough permissions to access statistics of this repository
            </v-alert>
          </v-col>
        </v-row>

        <v-row class="mt-6" align="stretch">
          <v-col cols="12" md="6">
            <UrlInputCard
              :loading="isUrlLoading"
              @load-url="handleLoadByUrl"
            />
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
            <h2 class="text-h6 font-weight-bold mb-2">
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
                  clickable
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
import { onMounted, inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import RepositoryCard from '@/components/RepositoryCard/RepositoryCard.vue'
import { UrlInputCard, BaseButton } from '@git-dash/ui'
import UserRepositoriesCard from '@/components/UserRepositoriesCard/UserRepositoriesCard.vue'

import { ApiClientKey } from '@/plugins/api'
import { useRepositoryStore } from '@/stores/repository'
import type { IRepository } from '@/models/IRepository'
import { useRepositories } from '@/composables/useRepositories'

const api = inject(ApiClientKey)
const router = useRouter()
const repoStore = useRepositoryStore()

const {
  allRepositories,
  recentRepositories,
  isLoading,
  isUrlLoading, // New loading state
  init: initRepositories,
  loadRepositoryByUrl // New function
} = useRepositories()

const urlError = ref('')

const handleSelectRepo = (repo: IRepository) => {
  repoStore.setCurrentRepository(repo)
  router.push({ name: 'repository-details' })
}

const handleLoadByUrl = async (url: string) => {
  urlError.value = '' // Clear previous errors

  try {
    // 1. Fetch from backend
    const repo = await loadRepositoryByUrl(url)

    // 2. Set to store and redirect
    if (repo) {
      repoStore.setCurrentRepository(repo)
      router.push({ name: 'repository-details' })
    }
  } catch (e: any) {
    // 3. Handle 404 / Access Denied
    if (e.response && e.response.status === 404) {
      urlError.value = "You do not have access to this repository, or it does not exist."
    } else {
      urlError.value = "An unexpected error occurred while loading the repository."
    }
  }
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
