import { createRouter, createWebHistory } from 'vue-router'
import Index from "@/views/index/Index.vue";
import SocialRedirect from "@/components/social/redirect/SocialRedirect.vue";
import PersonalSetting from "@/views/setting/PersonalSetting.vue";
import Main from "@/views/my/Main.vue";

const routes = [
  {path: '/', name: 'Index', component: Index},
  {path: '/:snsType/redirect', name: 'SocialRedirect', component: SocialRedirect},
  {path: '/settings', name: 'PersonalSetting', component: PersonalSetting},
  {path: '/my', name: 'Main', component: Main},

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
