<template>
  <v-container>
    <h1>Welcome, {{ userName }}</h1>
    <BaseButton
      color="red"
      label="Logout"
      @click="handleLogout"
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BaseButton from '@/components/BaseButton/BaseButton.vue'

const userStore = useUserStore()
const router = useRouter()
const { userName, fetchUser, logout } = userStore

onMounted(async () => {
  await fetchUser()
})

const handleLogout = async () => {
  await logout()
  router.push('/')  // redireciona para página de login
}
</script>
