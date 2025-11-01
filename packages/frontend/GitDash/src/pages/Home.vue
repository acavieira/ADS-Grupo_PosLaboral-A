<template>
  <div>
    <h1>Bem-vindo ao GitDash</h1>
    <p>Veja as estatísticas do seu GitHub.</p>
    <button @click="login">Login com GitHub</button>
  </div>
</template>

<script setup lang="ts">
import { BACKEND_URL } from '@/config'

function login() {
  window.location.href = `${BACKEND_URL}/login`
}
</script>
