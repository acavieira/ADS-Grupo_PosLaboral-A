<template>
  <v-app>
    <v-main>
      <v-container class="bg-grey-lighten-5">
        <v-row class="align-center mb-4">
          <v-col cols="12" md="8" class="d-flex align-center ga-4">
            <BaseButton color="grey" class="text-none" @click="goBack">
              <template #default>
                <v-icon start>mdi-arrow-left</v-icon>
                Change Repository
              </template>
            </BaseButton>

            <span class="text-subtitle-1 font-weight-medium">
              {{ getCurrentRepositoryFullName }}
            </span>
          </v-col>

          <v-col cols="12" md="4" class="d-flex justify-end">
            <v-select
              v-model="timeRangeModel" :items="timeRanges"
              item-title="title"
              item-value="value"
              density="comfortable"
              variant="outlined"
              hide-details
              style="max-width: 180px"
            />
          </v-col>
        </v-row>

        <Tabs :tabs="tabs" :active-tab="activeTab" @tab-change="handleTabChange" />

        <div class="mt-8">
          <slot></slot>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import type { Tab } from '@/models/Tab.ts'
import Tabs from '@/components/Tabs/Tabs.vue'
import { BaseButton } from '@/components/BaseButton'
import { useRouter } from 'vue-router'
import { useRepositoryStore } from '@/stores/repository.ts'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { type TimeRange, useTimeRangeStore } from '@/stores/timeRange.ts'

const router = useRouter()

const repoStore = useRepositoryStore()
const timeStore = useTimeRangeStore()

const { currentRepository, getCurrentRepositoryFullName } = storeToRefs(repoStore)

// The 'value' must match the TimeRange union type strings ('7 days', '1 month', '3 months')
const timeRanges = [
  { title: 'Last Week', value: '1 week' },
  { title: 'Last Month', value: '1 month' },
  { title: '3 Months', value: '3 months' },
]

const timeRangeModel = computed({
  get(): TimeRange {
    return timeStore.timeRange
  },
  set(newRange: TimeRange) {
    timeStore.setTimeRange(newRange)
  },
})


const props = defineProps<{
  tabs: Tab[]
  activeTab: string
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', key: string): void
  (e: 'tab-change', key: string): void
}>()

const handleTabChange = (key: string) => {
  emit('update:activeTab', key)
  emit('tab-change', key)
}

const goBack = () => {
  router.push('/repository-choice')
}
</script>
