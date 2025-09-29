import { createRouter, createWebHistory } from 'vue-router'
const Index = () => import(/* webpackChunkName: "view-index", webpackPreload: true */ '@/views/index/Index.vue')
const Screener = () => import(/* webpackChunkName: "view-screener" */ '@/views/index/Screener.vue')
const SocialRedirect = () => import(/* webpackChunkName: "view-redirect" */ '@/components/social/redirect/SocialRedirect.vue')
const PersonalSetting = () => import(/* webpackChunkName: "view-settings", webpackPrefetch: true */ '@/views/setting/PersonalSetting.vue')
const Main = () => import(/* webpackChunkName: "view-my", webpackPrefetch: true */ '@/views/my/Main.vue')

const routes = [
  { path: '/', name: 'Index', component: Index, meta: { showSearchFab: true } },
  { path: '/screener', name: 'Screener', component: Screener, meta: { showSearchFab: false } },
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

router.afterEach(() => {
  try { document.body.classList.remove('keyboard-open') } catch(_) {}
})

export default router
