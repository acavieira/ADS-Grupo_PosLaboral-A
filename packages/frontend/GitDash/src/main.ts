import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import vuetify from './plugins/vuetify';
import { apiClient, ApiClientKey } from "./plugins/api";
import { appLogger, LoggerKey } from './plugins/logger.ts'
import VueApexCharts from "vue3-apexcharts";

const app = createApp(App);
app.use(VueApexCharts);
app.use(createPinia());
app.use(router);
app.use(vuetify);
app.provide(LoggerKey, appLogger);
app.provide(ApiClientKey, apiClient);
app.mount('#app');
