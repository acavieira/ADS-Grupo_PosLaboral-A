<template>
  <v-container
    class="fill-height d-flex justify-center align-center"
    fluid
  >
    <v-card class="pa-8" max-width="400" elevation="10">
      <v-card-text class="text-center">
        <!-- GitHub Icon -->
        <v-avatar size="64" class="mx-auto mb-4">
          <v-img src="/github-icon.png" alt="GitHub" />
        </v-avatar>

        <!-- Title -->
        <h2 class="text-h5 mb-2">GitHub Dashboard</h2>

        <!-- Description -->
        <p class="mb-6">
          Connect your GitHub account to view repository analytics
        </p>

        <!-- Login Button -->
        <v-btn
          color="black"
          class="white--text"
          block
          @click="login"
        >
          <v-icon left>mdi-github</v-icon>
          Sign in with GitHub
        </v-btn>

        <!-- Demo text -->
        <p class="mt-4 text-caption grey--text">
          This is a demo application. Click to simulate GitHub OAuth authentication.
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { BACKEND_URL } from '@/config'

function login() {
  window.location.href = `${BACKEND_URL}/login`
}
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
