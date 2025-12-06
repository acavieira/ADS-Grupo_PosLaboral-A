<template>
  <BaseCard class="pa-6">
    <v-card-title class="d-flex justify-space-between align-center pt-4 pl-4 pr-4">
      <span class="text-h6 font-weight-regular">Weekly Commit Activity</span>
    </v-card-title>

    <v-card-text>
      <apexchart
        type="area"
        height="300"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </v-card-text>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ApexOptions } from 'apexcharts';
import BaseCard from '@/components/BaseCard/BaseCard.vue'

export interface CommitData {
  label: string;
  value: number;
}

const props = defineProps<{
  items: CommitData[];
}>();

const series = computed(() => [
  {
    name: 'Commits',
    data: props.items.map(item => ({
      x: item.label,
      y: item.value
    }))
  }
]);

// --- 3. Configuration ---
const chartOptions = ref<ApexOptions>({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Roboto, sans-serif'
  },
  stroke: { curve: 'smooth', width: 2, colors: ['#5C95FF'] },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] }
  },
  grid: {
    borderColor: '#e0e0e0',
    strokeDashArray: 4,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: true } },
    padding: { top: 0, right: 20, bottom: 0, left: 10 }
  },
  xaxis: {
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#666', fontSize: '14px' } },
    tooltip: { enabled: false }
  },
  yaxis: {
    min: 0,
    tickAmount: 4,
    labels: {
      style: { colors: '#666', fontSize: '14px' },
      formatter: (val: number) => val.toFixed(0)
    }
  },
  colors: ['#5C95FF'],
  dataLabels: { enabled: false },
  tooltip: { theme: 'light' }
});
</script>
