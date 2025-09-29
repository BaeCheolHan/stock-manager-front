<template>
  <div class="content">
    <div class="filters">
      <v-select v-model="market" :items="markets" label="시장" density="compact" hide-details></v-select>
      <v-text-field v-model.number="minYield" label="최소 배당수익률(%)" density="compact" hide-details type="number"></v-text-field>
      <v-text-field v-model.number="maxVolatility" label="최대 변동성(%)" density="compact" hide-details type="number"></v-text-field>
      <v-text-field v-model.number="minVolume" label="최소 거래량" density="compact" hide-details type="number"></v-text-field>
      <v-text-field v-model.number="minMarketCap" label="최소 시총(억)" density="compact" hide-details type="number"></v-text-field>
      <v-select v-model="sortBy" :items="sortItems" label="정렬" density="compact" hide-details></v-select>
      <v-btn color="primary" size="small" @click="reload">검색</v-btn>
    </div>

    <div v-if="loading" class="pd-10">로딩중...</div>
    <div v-else-if="!items.length" class="pd-10">조건에 해당하는 종목이 없습니다.</div>
    <div v-else>
      <div v-for="(it, idx) in items" :key="idx" class="card" @click="open(it)">
        <div class="flex" style="justify-content: space-between; align-items: center;">
          <div class="bold">{{ it.symbol }} <span class="small mg-l-6">{{ it.name }}</span></div>
          <div class="right">
            <span class="price">{{ money(it.price) }}</span>
            <span :class="['dp', Number(it.dp)>=0?'up':'down']">{{ pct(it.dp) }}</span>
          </div>
        </div>
        <div class="meta small mg-t-4">
          <span>배당 {{ pct(it.dividendYield) }}</span>
          <span class="mg-l-8">거래량 {{ num(it.volume) }}</span>
          <span class="mg-l-8">시총 {{ money(it.marketCap) }}</span>
        </div>
      </div>
      <div class="t-a-c mg-t-10">
        <v-btn size="small" variant="outlined" @click="loadMore" :disabled="loadingMore">더 보기</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Screener',
  data() {
    return {
      market: 'US',
      markets: ['US','KR'],
      minYield: null,
      maxVolatility: null,
      minVolume: 500000,
      minMarketCap: 10000,
      sortBy: 'change',
      sortItems: ['change','volume'],
      page: 0,
      size: 30,
      items: [],
      loading: false,
      loadingMore: false,
    }
  },
  async created() { await this.reload() },
  methods: {
    async reload() {
      this.page = 0
      this.items = []
      await this.fetch()
    },
    async loadMore() {
      this.page += 1
      await this.fetch(true)
    },
    async fetch(append=false) {
      const params = {
        market: this.market,
        minYield: this.minYield,
        maxVolatility: this.maxVolatility,
        minVolume: this.minVolume,
        minMarketCap: this.minMarketCap ? this.minMarketCap * 100000000 : null,
        sortBy: this.sortBy,
        page: this.page, size: this.size
      }
      Object.keys(params).forEach(k => (params[k]===null||params[k]===undefined) && delete params[k])
      try {
        if (!append) this.loading = true; else this.loadingMore = true
        const { default: api } = await import('@/service/apiClient')
        const res = await api.get('/yfin/screener/filter', { params })
        const list = res?.data?.items || res?.data?.rows || []
        this.items = append ? this.items.concat(list) : list
      } catch(_) {} finally { this.loading = false; this.loadingMore = false }
    },
    money(v) { try { return Number(v||0).toLocaleString('ko-KR') } catch(_) { return String(v ?? '-') } },
    num(v) { try { return Number(v||0).toLocaleString('ko-KR') } catch(_) { return String(v ?? '-') } },
    pct(v) { if (v==null) return '-'; const n = Number(v); const p = n>1?n:n*100; const s = p>=0?'+':''; return s + p.toFixed(2) + '%' },
    open(it) {
      // 추후 상세 이동 연결 가능
    }
  }
}
</script>

<style scoped>
.filters { display: grid; grid-template-columns: repeat(6, 1fr) auto; gap: 8px; padding: 8px 10px; border-bottom: 1px solid #eee; }
@media (max-width: 900px) { .filters { grid-template-columns: 1fr 1fr; } }
.card { border-bottom: 1px solid #eee; padding: 10px; cursor: pointer; }
.right { display: inline-flex; gap: 8px; align-items: baseline; }
.price { font-weight: 700; }
.dp.up { color: #e00000; }
.dp.down { color: #1976d2; }
.small { font-size: 12px; color: #666; }
</style>


