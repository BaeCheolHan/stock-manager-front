<template>
  <v-card class="mg-b-10 hover-card">
    <v-card-text>
      <div class="flex" style="justify-content: space-between; align-items: center;">
        <div>
          <div class="bold">총 평가금액</div>
          <div class="h5">{{ money(currentValue) }}</div>
          <div class="mg-t-5">
            <span>당해 TTM 배당</span>
            <span class="bold mg-l-6">{{ money(ttmDividend) }}</span>
            <span class="mg-l-6" v-if="currentValue > 0">(배당수익률 {{ dividendYieldText }})</span>
          </div>
        </div>
        <div class="t-a-r">
          <div>투자원금</div>
          <div class="bold">{{ money(invested) }}</div>
          <div class="mg-t-6">평가손익</div>
          <div :class="pnlClass" class="bold">{{ money(pnlAbs) }} ({{ pnlPctText }})</div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'PortfolioSummary',
  data() {
    return {
      invested: 0,
      currentValue: 0,
      pnlAbs: 0,
      pnlPct: 0,
      ttmDividend: 0,
    }
  },
  computed: {
    pnlClass() {
      return this.pnlAbs >= 0 ? 'red' : 'blue'
    },
    pnlPctText() {
      const v = Number(this.pnlPct || 0)
      const s = v >= 0 ? '+' : ''
      return s + v.toFixed(2) + '%'
    },
    dividendYieldText() {
      const y = this.currentValue > 0 ? (this.ttmDividend / this.currentValue * 100) : 0
      const s = y >= 0 ? '' : ''
      return s + y.toFixed(2) + '%'
    }
  },
  async created() {
    try {
      const { useAppStore } = await import('@/store')
      const app = useAppStore()
      const memberId = app?.userInfo?.memberId
      if (!memberId) return
      const [{ StocksService }, { DividendsService }] = await Promise.all([
        import('@/service/stocks'),
        import('@/service/dividends'),
      ])
      const [stocksRes, monthsRes] = await Promise.all([
        StocksService.getMemberStocks(memberId),
        DividendsService.getMonthlyChart(memberId),
      ])
      const stocks = stocksRes?.data?.stocks || []
      let invested = 0
      let current = 0
      for (const s of stocks) {
        const qty = Number(s.quantity) || 0
        const now = Number(s.nowPrice) || 0
        const avg = Number(s.avgPrice) || 0
        invested += qty * avg
        current += qty * now
      }
      this.invested = invested
      this.currentValue = current
      this.pnlAbs = current - invested
      this.pnlPct = invested > 0 ? (this.pnlAbs / invested * 100) : 0

      // 최근 12개월 배당 합계 (API 구조 호환: labels/monthly 형태 또는 per-year map)
      const data = monthsRes?.data
      let total12 = 0
      if (data && Array.isArray(data.monthly)) {
        const arr = data.monthly.slice(-12)
        total12 = arr.reduce((a, b) => a + (Number(b) || 0), 0)
      } else if (data && data.data) {
        // fallback: { data: { '2024-01': 1000, ... } }
        const entries = Object.entries(data.data).sort((a,b) => a[0].localeCompare(b[0]))
        const last12 = entries.slice(-12)
        total12 = last12.reduce((a, [,v]) => a + (Number(v) || 0), 0)
      }
      this.ttmDividend = total12
    } catch(_) {}
  },
  methods: {
    money(v) {
      try { return Number(v || 0).toLocaleString('ko-KR') + '원' } catch(_) { return String(v ?? '-') }
    }
  }
}
</script>

<style scoped>
.h5 { font-size: 18px; font-weight: 700; }
</style>


