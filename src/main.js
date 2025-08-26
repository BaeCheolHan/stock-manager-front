import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAppStore } from '@/store'
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
// Hydrate user from sessionStorage and persist on changes
const appStore = useAppStore(pinia)
try {
  const rawUser = sessionStorage.getItem('userInfo')
  if (rawUser) appStore.setUserInfo(JSON.parse(rawUser))
} catch (_) {}
appStore.$subscribe((_mutation, state) => {
  try {
    sessionStorage.setItem('userInfo', JSON.stringify(state.userInfo))
  } catch (_) {}
})
app.use(vuetify)
// app.use(VueApexCharts) // lazy-load locally where needed
app.mount('#app')
