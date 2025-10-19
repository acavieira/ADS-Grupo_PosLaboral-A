<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '@git-dash/ui'


const count = ref(0)


function handleClick() {
  count.value++
}
</script>


<template>
  <div class="d-flex flex-column align-center mt-6">
    <BaseButton color="primary" label="Click me" @click="handleClick" />
    <p class="mt-3">Clicked {{ count }} times</p>
  </div>
</template>


<style scoped>
.d-flex {
  display: flex;
}
.flex-column {
  flex-direction: column;
}
.align-center {
  align-items: center;
}
.mt-3 {
  margin-top: 12px;
}
.mt-6 {
  margin-top: 24px;
}
</style>


