<template>
  <BaseCard>
    <div class="text-h6 mb-4">
      {{ title }}
    </div>
    <div class="text-h4 mb-1">
      {{ value }}
    </div>
    <div class="text-caption text-medium-emphasis">
      {{ caption }}
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from '@/components/BaseCard/BaseCard.vue'

defineProps<{
  title: string
  value: number | string
  caption: string
}>()
</script>
