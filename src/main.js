import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { loadFonts } from './plugins/webfontloader'
import axios from "axios";
import mitt from 'mitt';
import VueApexCharts from "vue3-apexcharts";

import UiService from "@/service/UiService";

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

await loadFonts()

const vuetify = createVuetify({
    components,
    directives,
})


const emitter = mitt();
const app = createApp(App);
app.config.globalProperties.emitter = emitter;
app.config.globalProperties.axios = axios;
app.use(router)
app.use(store)
app.use(vuetify)
app.use(VueApexCharts)
app.use(mitt)
app.mount('#app')
