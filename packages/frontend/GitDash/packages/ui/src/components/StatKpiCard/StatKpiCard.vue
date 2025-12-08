<template>
  <BaseCard class="pa-5 h-100 d-flex flex-column justify-space-between">
    <div class="d-flex justify-space-between align-start mb-2">
      <div class="text-subtitle-1 font-weight-medium text-medium-emphasis">
        {{ title }}
      </div>
      <v-icon v-if="icon" size="20" class="text-medium-emphasis">
        {{ icon }}
      </v-icon>
    </div>

    <div>
      <div class="text-h5 font-weight-bold text-black mb-1">
        {{ value }}
      </div>

      <div class="text-body-2 text-grey-darken-1">
        {{ caption }}
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from '@/components/BaseCard/BaseCard.vue'

defineProps<{
  title: string
  value: number | string
  caption: string
  icon?: string // <--- New optional prop
}>()
</script>
