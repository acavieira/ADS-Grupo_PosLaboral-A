<template>
  <BaseLayout>
    <template #default>
      <HeaderMenu
        v-model="activeTab"
        :collaborators="collaborators"
        @tabChange="handleTabChange"
      />

      <RepositoriesList
        v-if="activeTab === 'overview'"
        :repositories="repositories"
        :onSelect="handleSelectRepo"
      />

      <RepositoryOverviewCard
        v-if="activeTab === 'overview' && selectedRepo"
        :repo="selectedRepo"
      />

      <BaseCard v-if="activeTab === 'collaborators'" class="pa-4">
        <h3 class="text-h6">Collaborators</h3>
        <ul>
          <li v-for="c in collaborators" :key="c.login">
            <a :href="c.html_url" target="_blank">{{ c.login }}</a>
          </li>
        </ul>
      </BaseCard>

      <BaseCard class="pa-4 text-center">
        <BaseButton color="red" label="Logout" @click="handleLogout" />
      </BaseCard>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import { useUserStore } from '@/stores/user'
import BaseLayout from '@/components/BaseLayout/BaseLayout.vue'
import BaseCard from '@/components/BaseCard/BaseCard.vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import HeaderMenu from '@/components/HeaderMenu/HeaderMenu.vue'
import RepositoriesList from '@/components/RepositoriesList/RepositoriesList.vue'
import RepositoryOverviewCard from '@/components/RepositoryOverviewCard/RepositoryOverviewCard.vue'
import type { IRepository } from '@/models/IRepository.ts'

const router = useRouter()
const userStore = useUserStore()
const { fetchUser, logout } = userStore

const activeTab = ref('overview')


const repositories = ref<IRepository[]>([])
const selectedRepo = ref<IRepository | null>(null)


const backendBaseUrl = 'https://localhost:7014'

const api = axios.create({
  baseURL: backendBaseUrl,
  withCredentials: true,
})


const loadRepositories = async () => {
  try {
    const res = await api.get('/api/github/repositories')
    repositories.value = res.data.repositories
  } catch (e) {
    console.error('Error loading repositories', e)
  }
}


const collaborators = ref([
{ login: 'alice_dev', avatar_url: '/avatars/alice.png', html_url: 'https://github.com/alice_dev' },
{ login: 'bob_coder', avatar_url: '/avatars/bob.png', html_url: 'https://github.com/bob_coder' },
{ login: 'charlie_123', avatar_url: '/avatars/charlie.png', html_url: 'https://github.com/charlie_123' }
])

const handleSelectRepo = (repo: IRepository) => {
  selectedRepo.value = repo
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
}


const handleLogout = async () => {
  await logout()
  router.push('/')
}


onMounted(async () => {
  await fetchUser()
  await loadRepositories()
})
</script>




