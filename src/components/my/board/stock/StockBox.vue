<template>
  <div class="content text-xs-mobile">
    <StockIcon class="mg-b-10" @click="showRegStockPop"/>
    <div v-if="stocks && stocks.length">
      <v-lazy v-for="stock in stocks" :key="stock.id" :options="{ rootMargin: '200px 0px', threshold: 0.1 }" min-height="80">
        <template #default>
        <v-card class="mg-b-5 hover-card" @click="showStockDetail(stock)">
          <v-card-text>
          <div>
            <div class="flex bold mg-b-10" style="justify-content: left; align-items: center;">
              <img
                  :src="'https://financialmodelingprep.com/image-stock/'.concat(stock.national === 'KR' ? stock.symbol.concat('.KS') : stock.symbol).concat('.png')"
                  :style="UiService().isMobile() ? 'max-width: 40px; max-height: 30px;': 'max-width: 50px;: max-height: 40px;'"
                  style="border: 1px solid white; border-radius: 5px;"
                  class="mg-r-5"
                  loading="lazy" decoding="async"
                  width="50" height="40"
                  @error="UiService().replaceStockImg($event)"
              >
              <p style="overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 38%;
                        word-break: break-all;">{{ stock.name }}</p>
              <p style="white-space: nowrap;">({{ stock.symbol }} <span :class="[UiService().setUpDownArrowClass(stock.compareToYesterdaySign), UiService().setColorClass(stock.compareToYesterdaySign)]">
               {{ '(' + rtChangePercentText(stock) }}%</span>)</p>
            </div>
            <div class="flex" style="justify-content: space-between; font-size: 12px;">
              <div class="w-50">
                <div>
                  <span>{{ stock.quantity.toLocaleString('ko-KR') }}주</span>
                  <span class="mg-l-5" :style="setPriceColor(stock)">(평단 {{ stock.national != 'KR' ? '$' : '' }}</span>
                  <span v-if="stock.national == 'KR'"
                        :style="setPriceColor(stock)">{{
                      Math.floor(Number(stock.avgPrice)).toLocaleString('ko-KR')
                    }}</span>
                  <span v-else
                        :style="setPriceColor(stock)">{{
                      (Math.floor(Number(stock.avgPrice) * 100) / 100).toLocaleString('ko-KR')
                    }}</span>
                  <span :style="setPriceColor(stock)">{{ stock.national == 'KR' ? '원' : '' }})</span>
                </div>
                <p>투자비중</p>
                <p class="bold">수익률</p>
                <p>총 수령 배당금</p>
                <p class="bold">단순 수익 계산</p>
              </div>
              <div class="t-a-r w-55">
                <div class="flex" style="justify-content: right">
                  <span>현재가 : </span>
                  <span :class="[signClass(stock)]"></span>
                  <span :class="[signClass(stock)]">{{ currentPriceText(stock) }}</span>
                  <div>
                    <span :class="[signClass(stock)]">(</span>
                    <span :class="[signClass(stock), arrowClass(stock)]">{{ absChangeText(stock) }}</span>
                    <span :class="[signClass(stock)]">)</span>
                  </div>
                </div>
                <p>
                  {{ stock.priceImportance }}%
                </p>
                <p :style="setRateOfReturnPerColor(stock)" class="bold">
                  {{
                    (Number(stock.quantity) * Number(stock.nowPrice) - (Number(stock.quantity) * Number(stock.avgPrice)))
                        .toLocaleString('ko-KR')
                  }} ({{ Number(stock.rateOfReturnPer).toFixed(2).toLocaleString('ko-KR') }}%)
                </p>
                <p class="red" v-if="stock.national === 'KR'">{{ stock.totalDividend.toLocaleString('ko-KR') }}원</p>
                <p v-else class="red">${{ stock.totalDividend.toLocaleString('ko-KR') }}</p>
                <p v-if="stock.national === 'KR'" :style="setTotalPriceColor(stock)" class="bold">
                  {{
                    (Number(stock.totalDividend) + (Number(stock.quantity) * Number(stock.nowPrice) - (Number(stock.quantity) * Number(stock.avgPrice)))).toLocaleString('ko-KR')
                  }}원
                </p>
                <p v-else :style="setTotalPriceColor(stock)" class="bold">
                  ${{
                    (Number(stock.totalDividend) + (Number(stock.quantity) * Number(stock.nowPrice) - (Number(stock.quantity) * Number(stock.avgPrice)))).toLocaleString('ko-KR')
                  }}
                </p>
              </div>
            </div>
          </div>
          </v-card-text>
        </v-card>
        </template>
      </v-lazy>
    </div>
    <v-card v-else class="t-a-c mg-t-20">
      <v-card-text>
        <div class="mg-b-10">아직 등록된 보유 주식이 없습니다.</div>
        <v-btn color="primary" variant="elevated" @click="showRegStockPop">지금 등록</v-btn>
      </v-card-text>
    </v-card>
  </div>
  <Modal v-if="isShowRegStockPop" @close-modal="isShowRegStockPop = false">
    <SaveStock msg="" @saved="onSaved"/>
  </Modal>
  <Modal v-if="isShowStockDetailPop" @close-modal="isShowStockDetailPop = false">
    <MyDetailStock msg="" :stock="selectedStock" @deleted="onDeleted"/>
  </Modal>
</template>


<script>

import Modal from "@/components/modal/Modal.vue";
import SaveStock from "@/components/my/popup/stock/SaveStock.vue";
import MyDetailStock from "@/components/my/popup/stock/MyDetailStock.vue";
import StockIcon from "@/components/etc/button/StockIcon.vue";
import UiService from "@/service/UiService";


export default {
  name: "StockBox",
  components: {
    Modal,
    SaveStock,
    MyDetailStock,
    StockIcon
  },
  props: {
    stocks: Array,
  },
  data() {
    return {
      isShowRegStockPop: false,
      isShowStockDetailPop: false,
      stockName: '',
      selectedStock: null,
      ws: null,
      rtMap: new Map(),
    }
  },
  mounted() {
    this.startWs()
  },
  beforeUnmount() {
    this.stopWs()
  },
  watch: {
    stocks: {
      immediate: false,
      handler() {
        this.startWs()
      }
    }
  },
  methods: {
    UiService() {
      return UiService;
    },
    async startWs() {
      try {
        this.stopWs()
        const tickers = (this.stocks || []).map(s => this.toTicker(s)).filter(Boolean)
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
      this.rtMap = new Map()
    },
    toTicker(stock) {
      const sym = String(stock?.symbol || '').trim().toUpperCase()
      if (!sym) return null
      return sym
    },
    applyRt(q) {
      if (!q) return
      const sym = String(q.symbol || '').toUpperCase()
      const price = q.regularMarketPrice ?? q.price
      const dp = q.regularMarketChangePercent ?? q.dp
      if (price == null || dp == null) return
      this.rtMap.set(sym, { price, dp })
      const base = sym.split('.')[0]
      if (base) this.rtMap.set(base, { price, dp })
    },
    getRt(stock) {
      const sym = this.toTicker(stock)
      if (!sym) return null
      return this.rtMap.get(sym) || this.rtMap.get(sym + '.KS') || this.rtMap.get(sym + '.KQ') || this.rtMap.get(sym.split('.')[0]) || null
    },
    getRtDp(stock) {
      const v = this.getRt(stock)
      return v ? Number(v.dp) : null
    },
    signClass(stock) {
      const dp = this.getRtDp(stock)
      if (dp == null) return this.UiService().setColorClass(stock.compareToYesterdaySign)
      return dp >= 0 ? 'red' : 'blue'
    },
    arrowClass(stock) {
      const dp = this.getRtDp(stock)
      if (dp == null) return this.UiService().setUpDownArrowClass(stock.compareToYesterdaySign)
      return dp >= 0 ? 'icon-up' : 'icon-down'
    },
    currentPriceText(stock) {
      const v = this.getRt(stock)
      const price = v && v.price != null ? v.price : stock.nowPrice
      try { return Number(price).toLocaleString('ko-KR') } catch(_) { return String(price ?? '-') }
    },
    rtChangePercentText(stock) {
      const v = this.getRt(stock)
      const dp = v && v.dp != null ? Number(v.dp) : null
      if (dp == null) {
        const base = Number(stock.nowPrice) && Number(stock.compareToYesterday) ? (Number(stock.compareToYesterday) / Number(stock.nowPrice - stock.compareToYesterday)) * 100 : 0
        const s = base >= 0 ? '+' : ''
        return s + base.toFixed(2) + '%'
      }
      const pct = dp > 1 ? dp : dp * 100
      const s = pct >= 0 ? '+' : ''
      return s + pct.toFixed(2) + '%'
    },
    absChangeText(stock) {
      const v = this.getRt(stock)
      if (!v) {
        try { return Number(stock.compareToYesterday).toLocaleString('ko-KR') } catch(_) { return String(stock.compareToYesterday ?? '-') }
      }
      const price = Number(v.price)
      const dp = Number(v.dp)
      if (!Number.isFinite(price) || !Number.isFinite(dp)) return '-'
      const frac = dp > 1 ? dp / 100 : dp
      const denom = 1 + frac
      if (Math.abs(denom) < 1e-6) return '0'
      const abs = Math.abs(price * (frac / denom))
      try { return abs.toLocaleString('ko-KR') } catch(_) { return String(abs) }
    },
    showRegStockPop() {
      this.isShowRegStockPop = true;
    },
    async onSaved() {
      this.isShowRegStockPop = false;
      if (this.$parent && typeof this.$parent.reloadStock === 'function') {
        await this.$parent.reloadStock();
      }
    },
    setPriceColor(stock) {
      return Number(stock.avgPrice) > Number(stock.nowPrice) ? 'color: blue' : 'color: red'
    },
    setTotalPriceColor(stock) {
      return (Number(stock.totalDividend) + (Number(stock.quantity) * Number(stock.nowPrice) - (Number(stock.quantity) * Number(stock.avgPrice)))) > 0 ? 'color: red' : 'color: blue'
    },
    setRateOfReturnPerColor(stock) {
      return Number(stock.rateOfReturnPer) > 0 ? 'color: red' : 'color: blue'
    },
    showStockDetail(stock) {
      this.selectedStock = stock
      this.isShowStockDetailPop = true
    },
    async onDeleted() {
      this.isShowStockDetailPop = false
      if (this.$parent && typeof this.$parent.reloadStock === 'function') {
        await this.$parent.reloadStock();
      }
    },
  }
};
</script>
