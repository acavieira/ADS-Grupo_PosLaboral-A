<template>
  <BaseCard class="pa-6">
    <h2 class="text-h6 mb-2">Enter repository URL</h2>
    <p class="text-body-1 text-medium-emphasis mb-4">
      Paste the GitHub repository URL directly
    </p>

    <v-text-field
      v-model="url"
      placeholder="https://github.com/owner/repository"
      variant="outlined"
      density="comfortable"
      hide-details
      class="mb-4"
    />

    <BaseButton
      color="black"
      block
      :disabled="!url"
      @click="handleSubmit"
    >
      <template #default>
        <v-icon start>mdi-magnify</v-icon>
        Load Repository
      </template>
    </BaseButton>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '../BaseButton'
import { BaseCard } from '../BaseCard'

const emit = defineEmits<{
  (e: 'load-url', url: string): void
}>()

const url = ref('')

const handleSubmit = () => {
  if (url.value) {
    emit('load-url', url.value)
  }
}
</script>
