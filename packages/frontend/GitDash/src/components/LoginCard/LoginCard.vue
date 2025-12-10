<template>
  <v-container class="fill-height d-flex justify-center align-center" fluid>
    <BaseCard class="pa-8" :max-width="400" :max-height="300" :elevation="10">
      <v-card-text class="text-center">
        <!-- Avatar / GitHub Icon -->
        <v-avatar size="64" class="mx-auto mb-4">
          <v-img src="/github-icon.png" alt="GitHub" />
        </v-avatar>

        <!-- Title -->
        <h2 class="text-h5 mb-2">GitDash</h2>

        <!-- Description -->
        <p class="mb-6">
          Connect your GitHub account to view repository analytics
        </p>

        <!-- Login Button -->
        <BaseButton
          color="black"
          block
          :loading="loading"
          :disabled="loading"
          @click="login"
        >
          <template #default>
            <v-icon start>mdi-github</v-icon>
            Sign in with GitHub
          </template>
        </BaseButton>

        <!-- Error message -->
        <p v-if="error" class="mt-4 text-caption red--text">{{ error }}</p>
        <!-- Loading message -->
        <p v-if="loading" class="mt-2 text-caption grey--text">Redirecting to GitHub...</p>
      </v-card-text>
    </BaseCard>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseCard } from '@git-dash/ui'

const loading = ref(false)
const error = ref('')

function login() {
  loading.value = true
  error.value = ''
  try {
    //window.location.href = `${BACKEND_URL}/login`
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/login`
  } catch (e) {
    error.value = 'Failed to start login. Please try again.'
    loading.value = false
  }
}
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
