<script setup lang="ts">
import { useToggle } from '@git-dash/core'


const { value: on, toggle } = useToggle(false)
</script>


<template>
  <div class="pa-4">
    <v-btn color="primary" @click="toggle()">Toggle</v-btn>
    <div class="mt-3">
      State: <strong>{{ on ? 'ON' : 'OFF' }}</strong>
    </div>
    <div class="mt-1">
      <v-btn variant="outlined" @click="toggle(true)">Set ON</v-btn>
      <v-btn class="ml-2" variant="outlined" @click="toggle(false)">Set OFF</v-btn>
    </div>
  </div>
</template>



