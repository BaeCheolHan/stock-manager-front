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
      ws: null,
      symbolToIndex: new Map(),

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
  beforeUnmount() { try { this.ws && this.ws.close() } catch(_) {} },
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
        // 실시간 구독 갱신
        this.rebuildIndex()
        this.startWs()
      } else {
        this.stocks = [];
        this.stopWs()
      }
      this.checkSpin = false;
    },
  },
  methods: {
    async startWs() {
      try {
        this.stopWs()
        const tickers = this.stocks.map(s => this.toTicker(s)).filter(Boolean)
        if (!tickers.length) return
        const { createQuoteWS } = await import('@/services/quoteWsClient')
        this.ws = createQuoteWS(tickers, { intervalSec: 1 })
          .onMessage((list) => {
            for (const q of list) this.applyRt(q)
          })
        this.ws.connect()
      } catch(_) {}
    },
    stopWs() {
      try { this.ws && this.ws.close() } catch(_) {}
      this.ws = null
    },
    rebuildIndex() {
      this.symbolToIndex = new Map()
      for (let i = 0; i < this.stocks.length; i++) {
        const s = this.stocks[i]
        const sym = String(s.symbol || '').toUpperCase()
        if (!sym) continue
        this.symbolToIndex.set(sym, i)
        if (s.national === 'KR') {
          this.symbolToIndex.set(sym + '.KS', i)
          this.symbolToIndex.set(sym + '.KQ', i)
        }
      }
    },
    toTicker(stock) {
      const sym = String(stock.symbol || '').trim().toUpperCase()
      if (!sym) return null
      // 6자리 한국 코드는 원코드로 전송하면 서버에서 .KS/.KQ 정규화됨
      return sym
    },
    applyRt(q) {
      if (!q) return
      const sym = String(q.symbol || '').toUpperCase()
      const idx = this.symbolToIndex.get(sym) || this.symbolToIndex.get(sym.split('.')[0])
      if (idx == null) return
      const price = q.regularMarketPrice ?? q.price
      const dpRaw = q.regularMarketChangePercent ?? q.dp
      if (price == null || dpRaw == null) return
      const dpPct = Number(dpRaw) > 1 ? Number(dpRaw) : Number(dpRaw) * 100
      const p = Number(price)
      if (!Number.isFinite(p)) return
      // prev ≈ price / (1 + dpPct/100), abs change ≈ price * ((dpPct/100) / (1 + dpPct/100))
      const frac = dpPct / 100
      const denom = 1 + frac
      const abs = Math.abs(denom === 0 ? 0 : p * (frac / denom))
      const s = this.stocks[idx]
      if (!s) return
      // 업데이트
      const updated = {
        ...s,
        nowPrice: p,
        compareToYesterday: abs,
        compareToYesterdaySign: dpPct >= 0 ? 1 : 4,
        rateOfReturnPer: (Number(s.avgPrice) ? ((p - Number(s.avgPrice)) / Number(s.avgPrice)) * 100 : 0),
      }
      this.stocks.splice(idx, 1, updated)
    },
    async reloadStock() {
      let memberId = this.userInfo.memberId
      let res = this.bankAccountTab !== 'all'
          ? await StocksService.getMemberStocksByAccount(memberId, this.bankAccountTab)
          : await StocksService.getMemberStocks(memberId)
      if (res.data.stocks) {
        this.stocks = res.data.stocks;
        this.rebuildIndex();
        this.startWs();
      } else {
        this.stocks = [];
        this.stopWs();
      }
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