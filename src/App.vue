<template>
  <a href="#main-content" class="skip-link">본문 바로가기</a>
  <TheHeader/>
  <v-app>
    <v-main id="main-content" tabindex="-1" role="main">
      <router-view/>
    </v-main>
  </v-app>
  <GlobalSnackbar/>
  <TheFooter/>
</template>

<script>

import TheHeader from "@/components/header/TheHeader.vue";
import TheFooter from "@/components/footer/TheFooter.vue";
import GlobalSnackbar from '@/components/GlobalSnackbar.vue'

export default {
  name: 'App',
  components: {
    TheHeader,
    TheFooter,
    GlobalSnackbar,
  },
}
</script>
<style>
@import url(assets/css/common.css);
@import url(assets/css/themify-icons.css);
</style>