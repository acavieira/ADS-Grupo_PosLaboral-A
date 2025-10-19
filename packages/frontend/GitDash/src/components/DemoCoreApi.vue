<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createApiClient } from '@git-dash/core'


type Todo = { id: number; title: string; completed: boolean }


const api = createApiClient({
  baseUrl: 'https://jsonplaceholder.typicode.com/', // public demo API
  headers: { Accept: 'application/json' },
})


const todo = ref<Todo | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)


async function loadTodo() {
  loading.value = true
  error.value = null
  try {
    todo.value = await api.get<Todo>('todos/1')
  } catch (e: any) {
    error.value = e?.message ?? 'Request failed'
  } finally {
    loading.value = false
  }
}


onMounted(loadTodo)
</script>


<template>
  <div class="pa-4">
    <div class="d-flex align-center" style="gap: 12px">
      <v-btn color="secondary" :loading="loading" @click="loadTodo">Load Todo</v-btn>
      <span v-if="loading">Loading…</span>
      <span v-if="error" class="text-error">Error: {{ error }}</span>
    </div>


    <div v-if="todo" class="mt-4">
      <div><strong>ID:</strong> {{ todo.id }}</div>
      <div><strong>Title:</strong> {{ todo.title }}</div>
      <div><strong>Completed:</strong> {{ todo.completed ? 'Yes' : 'No' }}</div>
    </div>
  </div>
</template>
