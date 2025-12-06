<template>
  <BaseCard class="pa-6">
    <h2 class="text-h6 mb-2">Your Repositories</h2>
    <p class="text-body-1 text-medium-emphasis mb-4">
      Select from your accessible repositories
    </p>

    <RepositoriesList
      :repositories="repositories"
      :onSelect="onSelect"
    />
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from '@/components/BaseCard/BaseCard.vue'
import RepositoriesList from '@/components/RepositoriesList/RepositoriesList.vue'
import type { IRepository } from '@/models/IRepository.ts'

defineProps<{
  repositories: IRepository[]
  onSelect: (repo: IRepository) => void
}>()
</script>
