<template>
  <BaseCard class="pa-4">
    <h3 class="text-h6 mb-3">Your Repositories</h3>
    <v-select
      :items="repositories"
      item-title="name"
      item-value="id"
      label="Select Repository"
      variant="outlined"
      @update:modelValue="selectRepository"
    />
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from '@/components/BaseCard/BaseCard.vue'

const props = defineProps<{
  repositories: Array<{ id: number; name: string; description?: string }>
  onSelect: (repo: any) => void
}>()

const selectRepository = (id: number) => {
  const repo = props.repositories.find(r => r.id === id)
  if (repo) props.onSelect(repo)
}
</script>
