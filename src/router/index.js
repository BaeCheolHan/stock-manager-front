import { createRouter, createWebHistory } from 'vue-router'
const Index = () => import('@/views/index/Index.vue')
const SocialRedirect = () => import('@/components/social/redirect/SocialRedirect.vue')
const PersonalSetting = () => import('@/views/setting/PersonalSetting.vue')
const Main = () => import('@/views/my/Main.vue')

const routes = [
  { path: '/', name: 'Index', component: Index },
  { path: '/:snsType/redirect', name: 'SocialRedirect', component: SocialRedirect },
  { path: '/settings', name: 'PersonalSetting', component: PersonalSetting, meta: { requiresAuth: true } },
  { path: '/my', name: 'Main', component: Main, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.requiresAuth) {
    try {
      const userRaw = sessionStorage.getItem('userInfo')
      if (!userRaw) return next('/')
    } catch (_) {
      return next('/')
    }
  }
  next()
})

export default router
