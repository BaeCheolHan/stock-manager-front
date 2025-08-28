import { createRouter, createWebHistory } from 'vue-router'
const Index = () => import(/* webpackChunkName: "view-index", webpackPreload: true */ '@/views/index/Index.vue')
const SocialRedirect = () => import(/* webpackChunkName: "view-redirect" */ '@/components/social/redirect/SocialRedirect.vue')
const PersonalSetting = () => import(/* webpackChunkName: "view-settings", webpackPrefetch: true */ '@/views/setting/PersonalSetting.vue')
const Main = () => import(/* webpackChunkName: "view-my", webpackPrefetch: true */ '@/views/my/Main.vue')

const routes = [
  { path: '/', name: 'Index', component: Index, meta: { showSearchFab: true } },
  { path: '/:snsType/redirect', name: 'SocialRedirect', component: SocialRedirect },
  { path: '/settings', name: 'PersonalSetting', component: PersonalSetting, meta: { requiresAuth: true, showSearchFab: false } },
  { path: '/my', name: 'Main', component: Main, meta: { requiresAuth: true, showSearchFab: false } },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { left: 0, top: 0, behavior: 'instant' }
  }
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
