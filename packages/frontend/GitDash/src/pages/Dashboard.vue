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
import { useUserStore } from '@/stores/user'
import BaseLayout from '@/components/BaseLayout/BaseLayout.vue'
import BaseCard from '@/components/BaseCard/BaseCard.vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import HeaderMenu from '@/components/HeaderMenu/HeaderMenu.vue'
import RepositoriesList from '@/components/RepositoriesList/RepositoriesList.vue'
import RepositoryOverviewCard from '@/components/RepositoryOverviewCard/RepositoryOverviewCard.vue'

const router = useRouter()
const userStore = useUserStore()
const { fetchUser, logout } = userStore

const activeTab = ref('overview')

const collaborators = ref([
  { login: 'alice_dev', avatar_url: '/avatars/alice.png', html_url: 'https://github.com/alice_dev' },
  { login: 'bob_coder', avatar_url: '/avatars/bob.png', html_url: 'https://github.com/bob_coder' },
  { login: 'charlie_123', avatar_url: '/avatars/charlie.png', html_url: 'https://github.com/charlie_123' }
])

const repositories = ref([
  { id: 1, name: 'awesome-project', description: 'An awesome React project', stars: 1234, forks: 234, issues: 18 },
  { id: 2, name: 'vue-dashboard', description: 'Dashboard built with Vue and Vuetify', stars: 500, forks: 89, issues: 5 }
])

const selectedRepo = ref(null)

const handleSelectRepo = (repo: any) => {
  selectedRepo.value = repo
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

onMounted(async () => {
  await fetchUser()
})

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>
