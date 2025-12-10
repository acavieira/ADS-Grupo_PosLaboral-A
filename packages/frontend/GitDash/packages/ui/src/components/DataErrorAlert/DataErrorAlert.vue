<template>
  <v-alert
    type="warning"
    variant="tonal"
    border="start"
    class="mb-4"
    :title="title"
  >
    <div class="text-body-2">
      <slot>
        We could not retrieve statistics for
        <strong v-if="resourceName">{{ resourceName }}</strong>
        <span v-else>this resource</span>.
        This usually happens because you lack permissions to read detailed analytics for this repository.
      </slot>
    </div>

    <template #append>
      <v-btn
        color="warning"
        variant="text"
        size="small"
        @click="$emit('retry')"
      >
        Retry
      </v-btn>
    </template>
  </v-alert>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  resourceName?: string
}>(), {
  title: 'Access Restricted or Data Unavailable',
  resourceName: ''
})

defineEmits<{
  (e: 'retry'): void
}>()
</script>
