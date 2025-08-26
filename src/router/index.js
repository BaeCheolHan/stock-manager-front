import { createRouter, createWebHistory } from 'vue-router'
const Index = () => import('@/views/index/Index.vue')
const SocialRedirect = () => import('@/components/social/redirect/SocialRedirect.vue')
const PersonalSetting = () => import('@/views/setting/PersonalSetting.vue')
const Main = () => import('@/views/my/Main.vue')

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
