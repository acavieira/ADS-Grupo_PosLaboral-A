import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/Login.vue';
import RepositoryChoice from '@/pages/RepositoryChoice.vue';
import RepositoryDetails from '@/pages/RepositoryDetails.vue'

const routes = [
  { path: '/', component: Login },
  { path: '/repository-choice', component: RepositoryChoice },
  { path: '/repository-details', name: 'repository-details', component: RepositoryDetails },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
