<template>
  <BaseCard class="pa-5 h-100">
    <div class="text-h6 mb-4">Peak Activity</div>

    <div class="d-flex justify-space-between align-center mb-4">
      <span class="text-body-1 text-medium-emphasis">Most Active Day</span>

      <v-chip
        :color="isWeekend ? 'red-darken-4' : 'black'"
        class="font-weight-bold text-capitalize"
        variant="flat"
        label
      >
        <v-icon start size="16">mdi-calendar-range</v-icon>
        {{ peakDay }}
      </v-chip>
    </div>

    <div class="d-flex justify-space-between align-center mb-4">
      <span class="text-body-1 text-medium-emphasis">Peak Hour (UTC)</span>
      <v-chip
        color="black"
        class="font-weight-bold"
        variant="flat"
        label
      >
        <v-icon start size="16">mdi-clock-time-four-outline</v-icon>
        {{ peakHour }}
      </v-chip>
    </div>

    <div class="d-flex justify-space-between align-center">
      <span class="text-body-1 text-medium-emphasis">Team Size</span>
      <v-chip
        :color="teamSize > 1 ? 'blue-darken-4' : 'grey-lighten-1'"
        class="font-weight-bold"
        variant="flat"
        label
      >
        <v-icon start size="16">mdi-account-multiple</v-icon>
        {{ teamSize }} collaborators
      </v-chip>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/BaseCard/BaseCard.vue'

const props = defineProps<{
  peakDay: string
  peakHour: string
  teamSize: number
}>()

// Simple check for Saturday or Sunday (case-insensitive)
const isWeekend = computed(() => {
  const day = props.peakDay.toLowerCase().trim()
  return day === 'saturday' || day === 'sunday'
})
</script>
