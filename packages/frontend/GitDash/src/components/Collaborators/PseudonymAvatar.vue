<template>
  <v-avatar size="32" class="border">
    <v-img :src="PSEUDONYM_AVATAR_SRC" alt="Pseudonymized collaborator" cover />
  </v-avatar>
</template>

<script setup lang="ts">
import { PSEUDONYM_AVATAR_SRC } from './pseudonymAvatar'
</script>
