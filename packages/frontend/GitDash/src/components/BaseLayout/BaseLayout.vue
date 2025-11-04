<template>
  <v-container fluid>
    <v-row dense>
      <v-col
        v-for="(child, index) in slots.default?.()"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="d-flex"
      >
        <BaseCard class="flex-grow-1 pa-4">
          <component :is="child" />
        </BaseCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import BaseCard from '@/components/BaseCard/BaseCard.vue'
const slots = defineSlots()
</script>
