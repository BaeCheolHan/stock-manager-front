<template>
  <v-window>
    <v-container>
      <div v-if="userInfo && userInfo.bankAccounts && userInfo.bankAccounts.length > 0" class="account-wrap">
        <UpperMenu @select="selectTabMenu"/>
        <StockBoard v-if="tabMenu === 'stock'"/>
        <DividendBoard v-if="tabMenu === 'dividend'"/>
        <AssetBoard v-if="tabMenu === 'asset'"/>
      </div>
      <div v-if="!accounts || accounts.length=== 0" class="account-wrap">
        <div class="empty-account" @click="openRegAccountPop()">
          <p>+ 계좌를 등록해주세요.</p>
        </div>
      </div>
    </v-container>
  </v-window>
</template>
<script>
import UpperMenu from "@/components/my/tabs/UpperMenu.vue";
import StockBoard from "@/components/my/board/stock/StockBoard.vue";
import DividendBoard from "@/components/my/board/dividend/DividendBoard/DividendBoard.vue";
import AssetBoard from "@/components/my/board/asset/AssetBoard.vue";

export default {
  name: 'Main',
  components: {
    AssetBoard,
    StockBoard,
    UpperMenu,
    DividendBoard,
  },
  data() {
    return {
      userInfo: null,
      accounts: null,
      isShowRegAccountPop: false,
      tabMenu: 'stock',
    }
  },
  computed: {},
  watch: {},
  mounted() {},
  created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (this.userInfo) {
      this.$store.commit('setUserInfo', this.userInfo)
      this.accounts = this.userInfo.bankAccounts;
    } else {
      this.$router.replace("/");
    }
  },
  methods: {
    openRegAccountPop: function () {
      this.isShowRegAccountPop = true;
    },
    selectTabMenu(tabMenu) {
      this.tabMenu = tabMenu;
    }
  }
}
</script>
