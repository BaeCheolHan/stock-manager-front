import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { loadFonts } from './plugins/webfontloader'
import mitt from 'mitt';
// import VueApexCharts from "vue3-apexcharts";
import vuetify from '@/plugins/vuetify'
import axios from '@/plugins/axios'

await loadFonts()


const emitter = mitt();
const app = createApp(App);
app.config.globalProperties.emitter = emitter;
app.config.globalProperties.axios = axios;
const pinia = createPinia()
app.use(router)
app.use(pinia)
app.use(vuetify)
// app.use(VueApexCharts) // lazy-load locally where needed
app.mount('#app')
