<template>
<BaseCard class="pa-4 d-flex align-center" @click="handleClick">
<v-avatar size="40" class="mr-4">
  <v-img src="/github-icon.png" alt="Repository" />
</v-avatar>

<div class="flex-grow-1">
  <div class="d-flex align-center mb-1">
                  <span class="text-body-2 font-weight-medium mr-2">
                    {{ repo.fullName }}
                  </span>
    <v-chip
      size="x-small"
      color="grey-lighten-3"
      class="text-caption"
    >
      Public
    </v-chip>
  </div>

  <p class="text-caption text-medium-emphasis mb-2">
    {{ repo.description || 'No description available.' }}
  </p>

  <div class="d-flex align-center text-caption text-medium-emphasis ga-4">
                  <span>
                    <v-icon size="14" class="mr-1">mdi-star-outline</v-icon>
                    {{ repo.starred }}
                  </span>
    <span>
                    <v-icon size="14" class="mr-1">mdi-source-fork</v-icon>
                    {{ repo.forked }}
                  </span>
  </div>
</div>
</BaseCard>
</template>
<script setup lang="ts">
import BaseCard from '@/components/BaseCard/BaseCard.vue'
import type { IRepository } from '@/models/IRepository.ts'

interface Props {
  repo: IRepository
  onSelect: (repo: IRepository) => void
}

const props = defineProps<Props>()

function handleClick() {
  props.onSelect(props.repo)
}
</script>
