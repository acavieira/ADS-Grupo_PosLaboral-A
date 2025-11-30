<template>
  <v-card
    :class="['custom-styled-card', className]"
    :elevation="elevation"
    :max-width="maxWidth"
    :outlined="outlined"
  >
    <slot />
  </v-card>
</template>

<script setup lang="ts">
import { VCard } from 'vuetify/components'

const props = withDefaults(
  defineProps<{
    elevation?: number
    maxWidth?: string | number
    outlined?: boolean
    className?: string
  }>(),
  {
    elevation: 0,
    maxWidth: '100%',
    outlined: false,
    className: ''
  }
)
</script>

<style scoped>
.custom-styled-card {
  border-radius: 12px !important;
  border: 1px solid #E0E0E0 !important;
  background-color: white !important;
  padding: 24px;
  height: 100%;
}
</style>
