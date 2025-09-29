<template>
  <div class="tickerbar" v-if="items.length">
    <div class="tickerbar__track" :style="trackStyle">
      <div class="tickerbar__item" v-for="(q, idx) in renderList" :key="idx">
        <span class="tickerbar__label">{{ q.label || q.symbol }}</span>
        <span :class="['tickerbar__price', q.dp >= 0 ? 'up' : 'down']">{{ fmtPrice(q.price) }}</span>
        <span :class="['tickerbar__dp', q.dp >= 0 ? 'up' : 'down']">{{ fmtDp(q.dp) }}</span>
      </div>
    </div>
  </div>
  <div v-else class="tickerbar tickerbar--empty" aria-hidden="true"></div>
</template>

<script>
export default {
  name: 'TickerBar',
  data() {
    return {
      items: [],
      rt: new Map(),
      ws: null,
      animX: 0,
      width: 0,
      timer: null,
      symbolMeta: new Map(), // baseSymbol -> { name, national }
    }
  },
  computed: {
    renderList() {
      const list = []
      for (const q of this.items) list.push(q)
      // 무한 롤링을 위한 복제
      for (const q of this.items) list.push(q)
      return list
    },
    trackStyle() {
      return { transform: `translateX(${-this.animX}px)` }
    }
  },
  async created() {
    try {
      const { useAppStore } = await import('@/store')
      const app = useAppStore()
      const memberId = app?.userInfo?.memberId
      if (!memberId) return
      const { StocksService } = await import('@/service/stocks')
      const res = await StocksService.getMemberStocks(memberId)
      const stocks = res?.data?.stocks || []
      // 심볼 메타(국내는 이름, 해외는 심볼 표기)에 사용
      for (const s of stocks) {
        const sym = String(s.symbol || '').toUpperCase()
        const base = sym.split('.')[0]
        this.symbolMeta.set(base, { name: s.name, national: s.national, symbol: sym })
      }
      const symbols = stocks.map(s => String(s.symbol || '').toUpperCase()).filter(Boolean)
      // 고유 + 상위 20개 제한
      const uniq = Array.from(new Set(symbols)).slice(0, 20)
      if (!uniq.length) return
      await this.startWs(uniq)
      // 초기 사이즈 측정 및 애니메이션 시작
      this.$nextTick(() => {
        try {
          const el = this.$el
          this.width = el ? el.clientWidth : 0
          this.startAnim()
        } catch(_) {}
      })
    } catch(_) {}
  },
  beforeUnmount() {
    this.stopWs()
    this.stopAnim()
  },
  methods: {
    async startWs(symbols) {
      try {
        const { createQuoteWS } = await import('@/services/quoteWsClient')
        this.ws = createQuoteWS(symbols, { intervalSec: 1 })
          .onMessage((list) => {
            for (const q of list) this.onQuote(q)
          })
        this.ws.connect()
      } catch(_) {}
    },
    stopWs() {
      try { this.ws && this.ws.close() } catch(_) {}
      this.ws = null
      this.rt = new Map()
    },
    onQuote(q) {
      const sym = String(q?.symbol || '').toUpperCase()
      const price = q?.regularMarketPrice ?? q?.price
      let dp = q?.regularMarketChangePercent ?? q?.dp
      if (dp != null && Math.abs(dp) <= 1) dp = dp * 100
      if (!sym || price == null || dp == null) return
      const base = sym.split('.')[0]
      const meta = this.symbolMeta.get(base)
      const label = meta ? (meta.national === 'KR' ? meta.name : base) : base
      this.rt.set(sym, { symbol: sym, label, price: Number(price), dp: Number(dp) })
      this.items = Array.from(this.rt.values())
    },
    startAnim() {
      this.stopAnim()
      const step = () => {
        this.animX += 0.6
        // 트랙 길이 추정(아이템 폭 140px 가정)
        const total = Math.max(this.items.length * 140, this.width)
        if (this.animX > total) this.animX = 0
        this.timer = requestAnimationFrame(step)
      }
      this.timer = requestAnimationFrame(step)
    },
    stopAnim() {
      try { cancelAnimationFrame(this.timer) } catch(_) {}
      this.timer = null
    },
    fmtPrice(v) {
      try { return Number(v).toLocaleString('ko-KR') } catch(_) { return String(v ?? '-') }
    },
    fmtDp(v) {
      const s = Number(v) >= 0 ? '+' : ''
      return s + Number(v).toFixed(2) + '%'
    }
  }
}
</script>

<style scoped>
.tickerbar { position: relative; overflow: hidden; border-top: 1px solid #eee; border-bottom: 1px solid #eee; background: #fff; }
.tickerbar--empty { min-height: 8px; }
.tickerbar__track { display: flex; will-change: transform; }
.tickerbar__item { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; min-width: 160px; box-sizing: border-box; white-space: nowrap; }
.tickerbar__label { font-weight: 700; color: #333; max-width: 120px; overflow: hidden; text-overflow: ellipsis; display: inline-block; }
.tickerbar__price { font-weight: 600; color: #111; }
.tickerbar__dp.up { color: #e00000; }
.tickerbar__dp.down { color: #1976d2; }
.tickerbar__price.up { color: #e00000; }
.tickerbar__price.down { color: #1976d2; }
@media (max-width: 480px) { .tickerbar__item { padding: 6px 10px; min-width: 140px; } .tickerbar__label { max-width: 90px; } }
</style>


