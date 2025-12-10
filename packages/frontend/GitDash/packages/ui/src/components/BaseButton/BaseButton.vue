<script setup lang="ts">
import { VBtn } from 'vuetify/components'


const emit = defineEmits<{
  (event: 'click', e: MouseEvent): void
}>()


const onClick = (e: MouseEvent) => emit('click', e)


defineProps<{
  label?: string
  color?: string
  variant?: 'flat' | 'elevated' | 'tonal' | 'outlined' | 'text' | 'plain'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
}>()
</script>


<template>
  <VBtn
    :color="color || 'primary'"
    :variant="variant || 'flat'"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :size="size || 'default'"
    @click="onClick"
  >
    <slot>{{ label ?? 'Click' }}</slot>
  </VBtn>
</template>
