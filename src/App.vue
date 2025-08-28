<template>
  <a href="#main-content" class="skip-link">본문 바로가기</a>
  <TheHeader/>
  <v-app>
    <v-main id="main-content" tabindex="-1" role="main">
      <router-view/>
    </v-main>
  </v-app>
  <GlobalSnackbar/>
  <MobileBottomNav v-if="isMobile && isLoggedIn" :icon-size="22" active-color="primary"/>
  <TheFooter/>
</template>

<script>

import TheHeader from "@/components/header/TheHeader.vue";
import TheFooter from "@/components/footer/TheFooter.vue";
import GlobalSnackbar from '@/components/GlobalSnackbar.vue'
import MobileBottomNav from '@/components/navigation/MobileBottomNav.vue'
import UiService from '@/service/UiService'
import { useAppStore } from '@/store'

export default {
  name: 'App',
  components: {
    TheHeader,
    TheFooter,
    GlobalSnackbar,
    MobileBottomNav,
  },
  data() {
    return { isMobile: false, isLoggedIn: false }
  },
  created() {
    const appStore = useAppStore()
    this.isLoggedIn = !!(appStore.userInfo && appStore.userInfo.memberId)
    appStore.$subscribe((_mutation, state) => {
      this.isLoggedIn = !!(state.userInfo && state.userInfo.memberId)
    })
  },
  mounted() {
    this.isMobile = UiService.isMobile()
  }
}
</script>
<style>
@import url(assets/css/common.css);
@import url(assets/css/themify-icons.css);
</style>