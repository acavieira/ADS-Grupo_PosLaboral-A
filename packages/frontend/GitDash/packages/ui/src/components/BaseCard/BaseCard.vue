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

defineProps<{
  elevation?: number
  maxWidth?: string | number
  outlined?: boolean
  className?: string
}>()

// valores padrão
const props = defineProps({
  elevation: { type: Number, default: 2 },
  maxWidth: { type: [String, Number], default: 400 },
  outlined: { type: Boolean, default: false },
  className: { type: String, default: '' }
})
</script>
