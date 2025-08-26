<template>
  <div>
    <StockTreemapChart v-if="treemapChartData" :chartData="treemapChartData"/>
    <div>
      <v-tabs v-model="bankAccountTab" color="#e00000" align-tabs="end">
        <v-tab :key="'all'" :value="'all'">
          <img class="bank-icon mg-r-5" :src="'./bank-icons/default-bank.png'" alt="bank-icon">
          전체
        </v-tab>
        <v-tab v-for="account in accounts" :key="account.id" :value="account.id">
          <img class="bank-icon mg-r-5" :src="'./bank-icons/'.concat(account.bankInfo.bankCode).concat('.jpg')"
               @error="replaceBankDefaultImg" alt="bank-icon">
          {{ account.alias }}
        </v-tab>
        <div class="flex mg-r-20" style="align-items: center;">
          <i class="ti-plus" @click="openRegAccountPop()"></i>
        </div>
      </v-tabs>
    </div>
  </div>
  <div v-show="checkSpin" class="t-a-c mg-t-30">
    <v-progress-circular color="primary" indeterminate :size="128"></v-progress-circular>
  </div>
  <div class="pd-5" v-show="!checkSpin">
    <!-- 주식 종목 item 영역 -->
    <StockBox :stocks="stocks"/>
  </div>
  <div class="pd-5" v-show="checkSpin">
    <v-skeleton-loader type="image, list-item-two-line, list-item-two-line, list-item-two-line" class="mg-b-10"/>
    <v-skeleton-loader type="image, list-item-two-line, list-item-two-line, list-item-two-line"/>
  </div>

  <Modal v-if="isShowRegAccountPop" @close-modal="isShowRegAccountPop = false">
    <SaveBankAccount msg=""/>
  </Modal>
</template>
<script>
import StockTreemapChart from "@/components/my/chart/StockTreemapChart.vue";
import Modal from "@/components/modal/Modal.vue";
import SaveBankAccount from "@/components/my/popup/stock/SaveBankAccount.vue";
import StockBox from "@/components/my/board/stock/StockBox.vue";
import { useAppStore } from '@/store'
import { StocksService } from '@/service/stocks'

export default {
  name: "StockBoard",
  components: {
    StockTreemapChart,
    Modal,
    SaveBankAccount,
    StockBox
  },
  data() {
    return {
      bankAccountTab: null,
      accounts: [],
      checkSpin: false,
      isShowRegAccountPop: false,
      treemapChartData: [
        {
          data: [],
        },
      ],
      stocks: [],
      userInfo: null,

    }
  },
  created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (this.userInfo) {
      const appStore = useAppStore()
      appStore.setUserInfo(this.userInfo)
      this.accounts = this.userInfo.bankAccounts;
      this.bankAccountTab = 'all'
    } else {
      this.$router.replace("/");
    }

  },
  mounted() {},
  watch: {
    'bankAccountTab': async function () {
      let memberId = this.userInfo.memberId
      this.checkSpin = true
      let res = this.bankAccountTab !== 'all'
          ? await StocksService.getMemberStocksByAccount(memberId, this.bankAccountTab)
          : await StocksService.getMemberStocks(memberId)
      if (res.data.stocks) {
        this.stocks = res.data.stocks;
        this.treemapChartData[0].data = []
        await this.stocks.forEach(item => {
          this.treemapChartData[0].data.push({x: item.name, y: item.priceImportance})
        });
      } else {
        this.stocks = [];
      }
      this.checkSpin = false;
    },
  },
  methods: {
    async reloadStock() {
      let memberId = this.userInfo.memberId
      let res = this.bankAccountTab !== 'all'
          ? await StocksService.getMemberStocksByAccount(memberId, this.bankAccountTab)
          : await StocksService.getMemberStocks(memberId)
      if (res.data.stocks) this.stocks = res.data.stocks;
      else this.stocks = [];
    },
    openRegAccountPop() {
      this.isShowRegAccountPop = true;
    },
    replaceBankDefaultImg(e) {
      e.target.src = './bank-icons/default-bank.png';
    },
  }
}
</script>