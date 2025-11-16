<template>
  <BaseCard class="pa-4">
    <h3 class="text-h6 mb-3">Your Repositories</h3>
    <v-select
      :items="repositories"
      item-title="fullName"
      item-value="fullName"
      label="Select Repository"
      variant="outlined"
      @update:modelValue="selectRepository"
    />
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from '@/components/BaseCard/BaseCard.vue'
import type { IRepository } from '@/models/IRepository.ts'

const props = defineProps<{
  repositories: Array<IRepository>
  onSelect: (repo: any) => void
}>()

const selectRepository = (name: string) => {
  const repo = props.repositories.find(r => r.fullName === name)
  if (repo) props.onSelect(repo)
}
</script>
