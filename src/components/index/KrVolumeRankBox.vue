<template>
  <div style=" max-width: 90%; margin: 0 auto;">
    <h3>국내 거래량 순위</h3>
    <v-skeleton-loader v-if="!data" type="list-item-two-line, list-item-two-line, list-item-two-line" class="mg-t-10"/>
    <v-card v-else class="mg-b-5 mg-t-10" v-for="stock in data" :key="stock.data_rank" @click="showStockDetail(stock)">
      <v-card-text>
        <div>
          <div class="flex text-xs-mobile">
            <div>
              <div class="flex" style="justify-content: left;">
                <span class="bold">{{ stock.data_rank }}. </span>
                <span class="bold">{{ stock.hts_kor_isnm }}</span>
                <div :class="[rtSignClass(stock)]">
                  <span class="mg-l-5">
                    (<span :class="rtArrowClass(stock)"></span>{{
                      rtPercentText(stock)
                    }})
                  </span>
                </div>
              </div>
              <div class="flex">
                <div>
                  <span class="bold">현재가 : </span>
                  <span :class="[rtSignClass(stock)]">{{ currentPriceText(stock) }} 원</span>
                </div>
                <div>
                  <span class="mg-l-20 bold">전일 대비 : </span>
                  <span :class="[rtSignClass(stock)]">
                    <span :class="rtArrowClass(stock)"></span>
                    <template v-if="hasRt(stock)">
                      {{ absChangeText(stock) }} 원 ({{ rtChangePercentText(stock) }})
                    </template>
                    <template v-else>
                      {{ Number(stock.prdy_vrss).toLocaleString('ko-KR') }} 원 ({{ Number(stock.prdy_ctrt).toLocaleString('ko-KR') }}%)
                    </template>
                  </span>
                </div>
              </div>
              <div>
                <span class="bold">거래량 : {{ Number(stock.acml_vol).toLocaleString('ko-KR') }}</span>
                <span class="mg-l-5">({{ stock.vol_inrt }} %)</span>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
  <Modal v-if="isShowStockDetailPop" @close-modal="isShowStockDetailPop = false">
    <DetailStock :stock="selectedStock" msg=""/>
  </Modal>
</template>

<script>

import DetailStock from "@/components/index/popup/DetailStock";
import Modal from "@/components/modal/Modal.vue";
import UiService from "@/service/UiService";

export default {
  name: "KrVolumeRankBox",
  components: {
    Modal,
    DetailStock
  },
  data() {
    return {
      data: null,
      selectedStock: null,
      isShowStockDetailPop: false,
      rtMap: new Map(),
      ws: null,
    }
  },
  async created() {
    const { StocksService } = await import('@/service/stocks')
    let res = await StocksService.getKrVolumeRank()
    this.data = res.data.data;

    // 실시간 WebSocket 구독 (상위 50개 제한)
    try {
      const { createQuoteWS } = await import('@/services/quoteWsClient')
      const tickers = (this.data || []).slice(0, 50).map(s => this.extractCode(s)).filter(Boolean)
      if (tickers.length > 0) {
        this.ws = createQuoteWS(tickers, { intervalSec: 1 })
          .onMessage((list) => {
            for (const q of list) {
              if (!q) continue
              const sym = q.symbol || ''
              const price = q.regularMarketPrice ?? q.price
              const dp = q.regularMarketChangePercent ?? q.dp
              const base = sym ? String(sym).split('.')[0] : null
              if (sym) this.rtMap.set(sym, { price, dp })
              if (base) this.rtMap.set(base, { price, dp })
            }
          })
        this.ws.connect()
      }
    } catch (_) {}
  },
  beforeUnmount() {
    try { this.ws && this.ws.close() } catch(_) {}
  },
  methods: {
    UiService() {
      return UiService
    },
    extractCode(stock) {
      return stock.mksc_shrn_iscd || stock.stck_shrn_iscd || stock.symbol
    },
    getKeysForStock(stock) {
      const code = this.extractCode(stock)
      if (!code) return []
      return [String(code), `${code}.KS`]
    },
    hasRt(stock) {
      const keys = this.getKeysForStock(stock)
      return keys.some(k => this.rtMap.has(k))
    },
    getRt(stock) {
      const keys = this.getKeysForStock(stock)
      for (const k of keys) {
        const v = this.rtMap.get(k)
        if (v) return v
      }
      return null
    },
    getRtDp(stock) {
      const v = this.getRt(stock)
      return v ? Number(v.dp) : null
    },
    rtSignClass(stock) {
      const dp = this.getRtDp(stock)
      if (dp == null) return UiService.setColorClass(stock.prdy_vrss_sign)
      return dp >= 0 ? 'red' : 'blue'
    },
    rtArrowClass(stock) {
      const dp = this.getRtDp(stock)
      if (dp == null) return UiService.setUpDownArrowClass(stock.prdy_vrss_sign)
      return dp >= 0 ? 'icon-up' : 'icon-down'
    },
    currentPriceText(stock) {
      const v = this.getRt(stock)
      const price = v && v.price != null ? v.price : stock.stck_prpr
      try { return Number(price).toLocaleString('ko-KR') } catch(_) { return String(price ?? '-') }
    },
    rtPercentText(stock) {
      const dp = this.getRtDp(stock)
      if (dp == null) {
        try { return Number(stock.prdy_ctrt).toLocaleString('ko-KR') + '%' } catch(_) { return String(stock.prdy_ctrt) + '%' }
      }
      return `${dp >= 0 ? '+' : ''}${(Number(dp) * 100).toFixed(2)}%`
    },
    rtChangePercentText(stock) {
      const dp = this.getRtDp(stock)
      if (dp == null) return ''
      return `${dp >= 0 ? '+' : ''}${(Number(dp) * 100).toFixed(2)}%`
    },
    absChangeText(stock) {
      const v = this.getRt(stock)
      if (!v) {
        try { return Number(stock.prdy_vrss).toLocaleString('ko-KR') } catch(_) { return String(stock.prdy_vrss ?? '-') }
      }
      const price = Number(v.price)
      const dp = Number(v.dp)
      if (!Number.isFinite(price) || !Number.isFinite(dp)) return '-'
      // prev ≈ price / (1 + dp), abs change ≈ price - prev = price * (dp / (1 + dp))
      const denom = 1 + dp
      if (Math.abs(denom) < 1e-6) return '0'
      const abs = Math.abs(price * (dp / denom))
      try { return abs.toLocaleString('ko-KR') } catch(_) { return String(abs) }
    },
    showStockDetail(stock) {
      this.selectedStock = stock;
      this.isShowStockDetailPop = true
    }
  }
};
</script>
