// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home.vue';
import Dashboard from '@/pages/Dashboard.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/dashboard', component: Dashboard },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
