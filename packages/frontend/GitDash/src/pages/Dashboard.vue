<template>
  <v-container>
    <h1>Welcome, {{ userName }}</h1>
    <v-btn color="red" @click="logout">Logout</v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const { userName, fetchUser, logout } = userStore;

onMounted(async () => {
  await fetchUser();
});
</script>
