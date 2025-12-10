<template>
  <!-- já não há BaseCard aqui -->
  <v-select
    :items="repositories"
    item-title="fullName"
    item-value="fullName"
    label="Select Repository"
    variant="outlined"
    density="comfortable"
    @update:modelValue="selectRepository"
  />
</template>

<script setup lang="ts">
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
