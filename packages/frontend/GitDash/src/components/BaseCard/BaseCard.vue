<template>
  <v-card
    :class="className"
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
    elevation: 2,
    maxWidth: 400,
    outlined: false,
    className: ''
  }
)
</script>
