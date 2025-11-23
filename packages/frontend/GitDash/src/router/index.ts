import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/Login.vue';
import Dashboard from '@/pages/Dashboard.vue';
import Stats from '@/pages/Stats.vue';

const routes = [
  { path: '/', component: Login },       // agora o login é a página inicial
  { path: '/dashboard', component: Dashboard },
  { path: '/stats', name: 'stats', component: Stats },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
