<template>
  <BaseCard class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <h3 class="text-h6 font-weight-regular">Code Changes</h3>

      <v-chip
        color="black"
        variant="flat"
        class="font-weight-bold px-4"
        size="small"
      >
        {{ netChangeLabel }} lines
      </v-chip>
    </div>

    <div class="mb-4">
      <div class="d-flex justify-space-between align-center mb-1">
        <div class="d-flex align-center">
          <span class="text-success text-h6 mr-2 font-weight-bold">+</span>
          <span class="text-body-1 text-medium-emphasis">Additions</span>
        </div>
        <span class="text-body-1 font-weight-medium">
          {{ formatNumber(props.additions) }}
        </span>
      </div>
      <v-progress-linear
        :model-value="addPercentage"
        color="success"
        height="10"
        rounded
        bg-color="grey-lighten-2"
        bg-opacity="0.5"
      ></v-progress-linear>
    </div>

    <div class="mb-6">
      <div class="d-flex justify-space-between align-center mb-1">
        <div class="d-flex align-center">
          <span class="text-error text-h6 mr-2 font-weight-bold">−</span>
          <span class="text-body-1 text-medium-emphasis">Deletions</span>
        </div>
        <span class="text-body-1 font-weight-medium">
          {{ formatNumber(props.deletions) }}
        </span>
      </div>
      <v-progress-linear
        :model-value="delPercentage"
        color="error"
        height="10"
        rounded
        bg-color="grey-lighten-2"
        bg-opacity="0.5"
      ></v-progress-linear>
    </div>

    <v-divider class="mb-5"></v-divider>

    <v-row no-gutters>
      <v-col cols="6">
        <div class="d-flex flex-column">
          <span class="text-body-2 text-medium-emphasis mb-1">Total Changes</span>
          <span class="text-h6 font-weight-regular">
            {{ formatNumber(totalChanges) }}
          </span>
        </div>
      </v-col>

      <v-col cols="6">
        <div class="d-flex flex-column">
          <span class="text-body-2 text-medium-emphasis mb-1">Add/Del Ratio</span>
          <span class="text-h6 font-weight-regular">
            {{ ratio }}
          </span>
        </div>
      </v-col>
    </v-row>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseCard from '../BaseCard/BaseCard.vue';

// Interface Definition
export interface CodeChangeStats {
  additions: number;
  deletions: number;
}

// Props
const props = defineProps<CodeChangeStats>();

const totalChanges = computed(() => props.additions + props.deletions);

const netChange = computed(() => props.additions - props.deletions);

// Formats net change label (e.g., "+8,222")
const netChangeLabel = computed(() => {
  const sign = netChange.value > 0 ? '+' : '';
  return `${sign}${formatNumber(netChange.value)}`;
});

const ratio = computed(() => {
  if (props.deletions === 0) return props.additions.toFixed(2);
  return (props.additions / props.deletions).toFixed(2);
});

// Calculate percentages relative to Total Activity for the bars
const addPercentage = computed(() => {
  if (totalChanges.value === 0) return 0;
  return (props.additions / totalChanges.value) * 100;
});

const delPercentage = computed(() => {
  if (totalChanges.value === 0) return 0;
  return (props.deletions / totalChanges.value) * 100;
});

// --- Helpers ---

const formatNumber = (num: number) => {
  return num.toLocaleString('en-US');
};
</script>
