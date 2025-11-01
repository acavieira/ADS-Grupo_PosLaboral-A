<template>
  <v-container class="fill-height d-flex justify-center align-center" fluid>
    <v-card class="pa-8" max-width="400" elevation="10">
      <v-card-text class="text-center">
        <v-avatar size="64" class="mx-auto mb-4">
          <v-img src="/github-icon.png" alt="GitHub" />
        </v-avatar>

        <h2 class="text-h5 mb-2">GitHub Dashboard</h2>
        <p class="mb-6">
          Connect your GitHub account to view repository analytics
        </p>

        <v-btn color="black" class="white--text" block @click="login">
          <v-icon left>mdi-github</v-icon>
          Sign in with GitHub
        </v-btn>

        <p v-if="error" class="mt-4 text-caption red--text">{{ error }}</p>
        <p v-if="loading" class="mt-4 text-caption grey--text">Loading...</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { BACKEND_URL } from '@/config';
import { ref } from 'vue';

const loading = ref(false);
const error = ref('');

function login() {
  loading.value = true;
  error.value = '';
  window.location.href = `${BACKEND_URL}/login`;
}
</script>
