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
      <div v-if="UiService().isMobile()">
        <button class="search-btn" @click="searchStockPop">검색</button>
      </div>
    </div>
  </div>

  <div class="overlay-lnb" @click="closeNav" v-show="isSidenavOpen"></div>

  <div id="sidenav-lnb" class="sidenav" :style="{ width: isSidenavOpen ? '250px' : '0px' }">
    <div v-if="userInfo">
      <div>
        <div class="flex">
          <div class="profile-wrap" @click="goDashboard">
            <img class="profile-thumbnail" :src="userInfo.profileImgUrl">
            <div class="profile-nickname">
              <span>{{ userInfo.nickname }}</span>
            </div>
          </div>
          <div>
            <button class="closer mg-r-10" @click="closeNav" style="color: #818181;">&times;</button>
          </div>
        </div>
        <div>
          <v-divider class="mg-b-10"></v-divider>
        </div>
      </div>
      <div class="side-menus" style="height: 100%">
        <ul>
          <li @click="goDashboard">홈</li>
          <li @click="goMyStockManage">내 주식 관리</li>
          <li @click="goSettings">설정</li>
          <li @click="logout">로그아웃</li>
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
    }
  },
  mounted() {},
  async created() {
    if (sessionStorage.getItem('userInfo')) {
      this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    }
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
    async snsLoginBtn(snsType) {
      let res = await this.axios.get('/login/'.concat(snsType))
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