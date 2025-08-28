<template>
  <header>

  </header>
  <div class="flex header">
    <div class="profile-wrap" style="font-size: 15px;" v-if="userInfo">
      <button class="ti-angle-double-right mg-l-10 mg-r-15" @click="openNav" style="cursor:pointer" aria-label="메뉴 열기"></button>
    </div>
    <div class="profile-wrap" v-if="!userInfo">
      <button class="kakao-login-small mg-l-15" v-on:click="snsLoginBtn('kakao')" aria-label="카카오 로그인"></button>
      <button class="google-login-small mg-l-15" v-on:click="snsLoginBtn('google')" aria-label="구글 로그인"></button>
    </div>
    <div class="flex">
      <div v-if="!UiService().isMobile()">
        <button class="search-btn" @click="searchStockPop">검색</button>
      </div>
      <ExchangeRate/>
    </div>
  </div>

  <button
    v-if="UiService().isMobile() && $route.meta && $route.meta.showSearchFab"
    :class="['search-fab', { 'is-hidden': !showFab, 'show-label': showFabLabel, 'tutorial': showFabTutorial, 'longpress': showFabLongpress }]"
    aria-label="종목 검색" title="종목 검색"
    @click="onFabClick"
    @touchstart.passive="onFabPressStart" @touchend.passive="onFabPressEnd"
    @mousedown="onFabPressStart" @mouseup="onFabPressEnd"
  >
    <img src="/icons/ic_search.png" alt="" class="search-fab__icon"/>
    <span class="visually-hidden">종목 검색</span>
  </button>

  <div class="overlay-lnb" @click="closeNav" v-show="isSidenavOpen"></div>

  <div id="sidenav-lnb" class="sidenav" :style="{ width: isSidenavOpen ? '250px' : '0px' }" role="navigation" aria-label="사이드 메뉴" :aria-hidden="isSidenavOpen ? 'false' : 'true'">
    <div v-if="userInfo">
      <div>
        <div class="flex">
          <div class="profile-wrap" @click="goDashboard" tabindex="0">
            <img class="profile-thumbnail" :src="userInfo.profileImgUrl" alt="프로필 이미지">
            <div class="profile-nickname">
              <span>{{ userInfo.nickname }}</span>
            </div>
          </div>
          <div>
            <button class="closer mg-r-10" @click="closeNav" style="color: #818181;" aria-label="사이드 메뉴 닫기">&times;</button>
          </div>
        </div>
        <div>
          <v-divider class="mg-b-10"></v-divider>
        </div>
      </div>
      <div class="side-menus" style="height: 100%">
        <ul>
          <li role="button" tabindex="0" @click="goDashboard">홈</li>
          <li role="button" tabindex="0" @click="goMyStockManage">내 주식 관리</li>
          <li role="button" tabindex="0" @click="goSettings">설정</li>
          <li role="button" tabindex="0" @click="logout">로그아웃</li>
        </ul>
      </div>
    </div>
    <refferencesArea/>
  </div>

  <Modal v-if="searchPop" @close-modal="closeSearchPop">
    <SearchStock v-if="!isSearch" @search="onSearch"/>
    <DetailStock v-if="isSearch" :stock="selectedStock"/>
  </Modal>

</template>

<script>
import refferencesArea from "@/components/etc/refferencesArea.vue";
import ExchangeRate from "@/components/header/ExchangeRate.vue";
import Modal from "@/components/modal/Modal.vue";
import SearchStock from "@/components/header/popup/SearchStock.vue";
import DetailStock from "@/components/index/popup/DetailStock.vue";
import UiService from "@/service/UiService";
import { useAppStore } from '@/store'

export default {
  components: {
    DetailStock,
    SearchStock,
    Modal,
    refferencesArea,
    ExchangeRate,
  },
  data() {
    return {
      userInfo: null,
      exchangeRate: null,
      searchPop: false,
      isSearch: false,
      selectedStock: null,
      isSidenavOpen: false,
      // FAB state
      showFab: true,
      showFabLabel: true,
      showFabTutorial: false,
      showFabLongpress: false,
      _fabPressTimer: null,
      _lastScrollY: 0,
    }
  },
  mounted() {
    if (this.UiService().isMobile()) {
      this._lastScrollY = window.scrollY || 0
      window.addEventListener('scroll', this.onScroll, { passive: true })
      // One-time tutorial badge
      try {
        const seen = localStorage.getItem('fab_tutorial_seen') === '1'
        if (!seen) {
          this.showFabTutorial = true
          setTimeout(() => {
            this.showFabTutorial = false
            localStorage.setItem('fab_tutorial_seen', '1')
          }, 4000)
        }
      } catch(_) {}
    }
  },
  beforeUnmount() {
    try { window.removeEventListener('scroll', this.onScroll) } catch(_) {}
    clearTimeout(this._fabPressTimer)
  },
  async created() {
    const appStore = useAppStore()
    // 초기 동기화 (세션에 있을 경우 유지)
    if (sessionStorage.getItem('userInfo')) {
      this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
      appStore.setUserInfo(this.userInfo)
    } else {
      this.userInfo = appStore.userInfo
    }
    // 스토어 변경 구독: 로그인/로그아웃 시 버튼 즉시 반영
    appStore.$subscribe((_mutation, state) => {
      this.userInfo = state.userInfo
    })
    this.exchangeRate = sessionStorage.getItem('exchangeRate');
  },
  methods: {
    UiService() {
      return UiService
    },
    closeSearchPop() {
      this.searchPop = false;
      this.isSearch = false;
      this.selectedStock = null;
    },
    openNav() {
      this.isSidenavOpen = true;
    },
    closeNav() {
      this.isSidenavOpen = false;
    },
    goSettings() {
      this.$router.replace('/settings')
    },
    goDashboard() {
      this.$router.replace('/')
    },
    goMyStockManage() {
      this.$router.replace('/my')
    },
    onSearch(stock) {
      this.selectedStock = stock;
      this.isSearch = true;
    },
    searchStockPop() {
      this.searchPop = true;
    },
    onScroll() {
      const y = window.scrollY || 0
      const delta = y - this._lastScrollY
      // Hide on scroll down, show on scroll up
      if (Math.abs(delta) > 4) {
        this.showFab = delta < 0
        this.showFabLabel = delta < 0
      }
      this._lastScrollY = y
    },
    onFabClick() {
      try { this.showFabTutorial = false; localStorage.setItem('fab_tutorial_seen', '1') } catch(_) {}
      this.UiService().vibrate(15)
      this.searchStockPop()
    },
    onFabPressStart() {
      clearTimeout(this._fabPressTimer)
      this._fabPressTimer = setTimeout(() => {
        this.showFabLongpress = true
        this.UiService().vibrate(20)
        setTimeout(() => { this.showFabLongpress = false }, 1200)
      }, 500)
    },
    onFabPressEnd() {
      clearTimeout(this._fabPressTimer)
    },
    async snsLoginBtn(snsType) {
      const { PublicService } = await import('@/service/apiClient')
      let res = await PublicService.getSnsLoginUrl(snsType)
      location.href = res.data.loginUri
    },
    logout() {
      sessionStorage.removeItem('userInfo')
      const appStore = useAppStore()
      appStore.removeUserInfo()
      this.$router.replace('/')
    }
  }

}
</script>