import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { loadFonts } from './plugins/webfontloader'
import mitt from 'mitt';
import VueApexCharts from "vue3-apexcharts";
import vuetify from '@/plugins/vuetify'
import axios from '@/plugins/axios'

await loadFonts()


const emitter = mitt();
const app = createApp(App);
app.config.globalProperties.emitter = emitter;
app.config.globalProperties.axios = axios;
app.use(router)
app.use(store)
app.use(vuetify)
app.use(VueApexCharts)
app.mount('#app')
