<template>
  <v-sheet
    color="white"
    elevation="2"
    class="pa-2 d-flex flex-column flex-md-row align-center justify-space-between"
  >
    <!-- Tabs section -->
    <v-tabs
      v-model="activeTab"
      density="comfortable"
      color="primary"
      grow
      class="flex-grow-1"
    >
      <v-tab
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="text-body-2 font-weight-medium"
      >
        {{ tab.label }}
      </v-tab>
    </v-tabs>

    <!-- Collaborators avatars -->
    <div class="d-flex align-center ga-2 mt-2 mt-md-0">
      <v-avatar
        v-for="collaborator in collaborators"
        :key="collaborator.login"
        size="36"
        class="elevation-1"
      >
        <v-img
          :src="collaborator.avatar_url"
          :alt="collaborator.login"
          class="cursor-pointer"
          @click="openProfile(collaborator.html_url)"
        />
      </v-avatar>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  collaborators: Array<{
    login: string
    avatar_url: string
    html_url: string
  }>
  modelValue?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'tabChange', value: string): void
}>()

const tabs = [
  { label: 'Repository Overview', value: 'overview' },
  { label: 'Collaborators', value: 'collaborators' }
]

const activeTab = ref(props.modelValue || 'overview')

watch(activeTab, (val) => {
  emit('update:modelValue', val)
  emit('tabChange', val)
})

function openProfile(url: string) {
  window.open(url, '_blank')
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
