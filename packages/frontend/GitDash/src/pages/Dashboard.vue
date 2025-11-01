<template>
  <div>
    <h1>Dashboard</h1>
    <p>Usuário: {{ userName }}</p>
    <!--<p>Token (para dev apenas! não guardar em produção): {{ token }}</p>--><
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userName = ref('');
const token = ref('');

onMounted(() => {
  userName.value = route.query.user as string || '';
  token.value = route.query.token as string || '';

  // Aqui podes chamar APIs do backend usando token
});
</script>
