<template>
  <div class="base-tabs d-flex align-center mb-6">
    <div class="d-flex pr-6" style="border-right: 1px solid #ddd;">
      <div
        v-for="tab in repositoryTabs"
        :key="tab.key"
        :class="[
          'base-tab-item px-4 py-2 mr-2',
          { 'base-tab-active': tab.key === activeTab }
        ]"
        @click="selectTab(tab.key)"
      >
        <span class="text-subtitle-1 font-weight-medium">{{ tab.title }}</span>
      </div>
    </div>

    <div class="d-flex pl-6">
      <div
        v-for="tab in collaboratorTabs"
        :key="tab.key"
        :class="['base-tab-item pa-0 mr-4']"
        @click="selectTab(tab.key)"
      >
        <v-avatar size="25">
          <v-img
            :src="tab.icon"
            :alt="tab.title"
          />
        </v-avatar>
        <v-tooltip activator="parent" location="bottom">{{ tab.title }}</v-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type ITab } from './types/ITab'

// --- Component Props ---
const props = defineProps<{
  tabs: ITab[];
  activeTab: string;
}>();

// --- Component Emits ---
const emit = defineEmits<{
  (e: 'tab-change', key: string): void;
}>();

const repositoryTabs = computed(() =>
  props.tabs.filter(t => !t.icon)
);

const collaboratorTabs = computed(() =>
  props.tabs.filter(t => !!t.icon)
);


// --- Methods ---
const selectTab = (key: string) => {
  emit('tab-change', key);
};

</script>

<style scoped>
.base-tabs {
  border-bottom: 2px solid #e0e0e0;
}

.base-tab-item {
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.base-tab-item:has(span) {
  padding-bottom: 8px !important;
}

.base-tab-active {
  color: #24292F;
}


.base-tab-active:has(span)::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #24292F;
}

.base-avatar-active {
  border: 2px solid #24292F;
  box-shadow: 0 0 0 2px white;
}
</style>
