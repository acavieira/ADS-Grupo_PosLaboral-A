<template>
  <BaseCard class="pa-4">
    <h3 class="text-h6 mb-4">{{ repo.fullName }}</h3>
    <p class="mb-2">{{ repo.description || 'No description available.' }}</p>
    <v-divider class="mb-4" />
    <v-row>
      <v-col cols="4">
        <strong>{{ repo.starred }}</strong>
        <div class="text-caption">Stars</div>
      </v-col>
      <v-col cols="4">
        <strong>{{ repo.forked }}</strong>
        <div class="text-caption">Forks</div>
      </v-col>
      <v-col cols="4">
        <strong>{{ repo.languages }}</strong>
        <div class="text-caption">Issues</div>
      </v-col>
    </v-row>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from '@/components/BaseCard/BaseCard.vue'
import type { IRepository } from '@/models/IRepository.ts'

defineProps<{
  repo: IRepository
}>()
</script>
