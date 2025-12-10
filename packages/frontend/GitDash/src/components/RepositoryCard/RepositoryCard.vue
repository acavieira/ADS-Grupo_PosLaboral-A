<template>
  <BaseCard
    class="pa-4 d-flex align-center card-transition"
    :class="[
      isInteractive ? 'interactive' : 'static-card'
    ]"
    :elevation="isInteractive ? undefined : 0"
    :ripple="isInteractive"
    v-on="isInteractive ? { click: handleClick } : {}"
  >
    <v-avatar size="40" class="mr-4 rounded">
      <v-img src="/github-icon.png" alt="Repository" cover />
    </v-avatar>

    <div class="flex-grow-1">
      <div class="d-flex align-center mb-1">
        <span class="text-body-1 font-weight-bold mr-3">
          {{ repo.fullName }}
        </span>

        <v-chip
          size="x-small"
          :color="repo.isPrivate ? 'black' : 'blue-darken-2'"
          variant="flat"
          class="font-weight-bold text-uppercase"
          label
        >
          <v-icon start size="10">
            {{ repo.isPrivate ? 'mdi-lock' : 'mdi-earth' }}
          </v-icon>
          {{ repo.isPrivate ? 'Private' : 'Public' }}
        </v-chip>
      </div>

      <p class="text-body-2 text-medium-emphasis mb-3 text-truncate" style="max-width: 600px;">
        {{ repo.description || 'No description available.' }}
      </p>

      <div class="d-flex align-center flex-wrap ga-3">
        <div class="d-flex align-center text-caption text-medium-emphasis">
          <v-icon size="16" class="mr-1" color="amber-darken-2">mdi-star</v-icon>
          <span class="font-weight-medium">{{ repo.starred }}</span>
        </div>

        <div class="d-flex align-center text-caption text-medium-emphasis mr-2">
          <v-icon size="16" class="mr-1" color="grey-darken-1">mdi-source-fork</v-icon>
          <span class="font-weight-medium">{{ repo.forked }}</span>
        </div>

        <v-chip
          v-for="lang in repo.languages"
          :key="lang"
          size="x-small"
          color="black"
          variant="outlined"
          class="font-weight-medium"
        >
          {{ lang }}
        </v-chip>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseCard } from '@git-dash/ui'
import type { IRepository } from '@/models/IRepository.ts'

interface Props {
  repo: IRepository
  onSelect?: (repo: IRepository) => void
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clickable: undefined
})

const isInteractive = computed(() => {
  if (props.clickable !== undefined) return props.clickable
  return !!props.onSelect
})

function handleClick() {
  if (isInteractive.value && props.onSelect) {
    props.onSelect(props.repo)
  }
}
</script>

<style scoped>
.card-transition {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* --- INTERACTIVE STATE --- */
.interactive {
  cursor: pointer;
}

.interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

/* --- STATIC STATE (The Nuclear Option) --- */
/* We use !important to override any default BaseCard or Vuetify hover styles */
.static-card {
  cursor: default !important;
}

.static-card:hover {
  transform: none !important;
  box-shadow: none !important;
  background-color: transparent !important; /* Prevents background darken on hover */
}

/* Optional: If BaseCard adds a 'v-card--link' class automatically,
   this kills the pseudo-element overlay */
:deep(.static-card)::before {
  opacity: 0 !important;
}
</style>
