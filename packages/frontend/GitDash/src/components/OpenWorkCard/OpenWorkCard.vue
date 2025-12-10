<template>
  <BaseCard class="pa-5 h-100">
    <div class="text-h6 mb-4">Open Work Status</div>

    <div class="d-flex justify-space-between align-center mb-4">
      <span class="text-body-1 text-medium-emphasis">Open Pull Requests</span>
      <v-chip
        :color="openPrs > 0 ? 'blue-darken-4' : 'grey-lighten-1'"
        variant="flat"
        class="font-weight-bold px-4"
        label
      >
        <v-icon start size="16" v-if="openPrs > 0">mdi-source-pull</v-icon>{{ openPrs }}
      </v-chip>
    </div>

    <div class="d-flex justify-space-between align-center">
      <span class="text-body-1 text-medium-emphasis">Open Issues</span>
      <v-chip
        :color="openIssues > 0 ? 'red-darken-4' : 'grey-lighten-1'"
        variant="flat"
        class="font-weight-bold px-4"
        label
      >
        <v-icon start size="16" v-if="openIssues > 5">mdi-alert-circle-outline</v-icon>{{ openIssues }}
      </v-chip>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { BaseCard } from '@git-dash/ui'

defineProps<{
  openPrs: number
  openIssues: number
}>()
</script>
