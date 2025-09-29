<template>
  <div class="content">
    <h2>종목 검색</h2>
    <div class="popup-wrap">
      <div class="col-1 mg-t-10">
        <div v-if="trending.length" class="pd-10 mg-b-10" style="background:#fafafa;border:1px solid #eee;border-radius:8px;">
          <div class="bold mg-b-6">요즘 많이 찾는 종목</div>
          <div class="flex" style="flex-wrap: wrap; gap: 6px;">
            <button v-for="(s,i) in trending" :key="i" class="chip" @click="selectStock(s)">{{ s.name }} ({{ s.symbol }})</button>
          </div>
        </div>
        <div class="mg-t-10" v-if="!this.selectedStock">
          <SearchSelect :items="copyStocks" :placeholder="'종목명 또는 코드'" :label="(s)=>s.name + ' ('+s.symbol+')'" :key-field="'symbol'" :debounce="250" @select="selectStock" @input-change="onKeyword"/>
        </div>
        <div v-else class="mg-t-10">
          <div class="selected-bank-wrap" @click="cancelSelectStock">
            <li>
                <span style="vertical-align: middle;">
                  {{ selectedStock.name }} ({{ selectedStock.code }})
                </span>
            </li>
          </div>
        </div>
        <div class="mg-t-10 btnBox t-a-c">
          <button type="button" :disabled="this.processing" @click="search">조회</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { defineAsyncComponent } from 'vue'
export default {
  name: 'SearchStock',
  components: { SearchSelect: defineAsyncComponent(() => import('@/components/etc/SearchSelect.vue')) },
  data() {
    return {
      stocks: [],
      copyStocks: [],
      selectedStock: null,
      processing: false,
      searchKeyword: '',
      serverLoading: false,
      _searchToken: 0,
      trending: [],
    }
  },
  watch: {},
  async created() {
    // 초기에는 인기/대표 시장 일부만 보여주고, 입력 시 서버 검색으로 대체
    try {
      const { StocksService } = await import('@/service/stocks')
      const res = await StocksService.getStocksByCode('KOSPI')
      this.stocks = res.data.stocksList || []
      this.copyStocks = this.stocks.slice(0, 50)
    } catch (_) {
      this.stocks = []
      this.copyStocks = []
    }
    try {
      const { default: api } = await import('@/service/apiClient')
      const t = await api.get('/api/stocks/trending', { params: { limit: 12 } })
      this.trending = t?.data?.stocksList || []
    } catch(_) {}
  },
  methods: {
    adaptiveLimit(q) {
      const len = (q || '').length
      let base = len <= 1 ? 20 : 50
      try {
        const nc = navigator.connection || navigator.webkitConnection || navigator.mozConnection
        if (nc) {
          if (nc.saveData) base = Math.min(base, 20)
          const type = (nc.effectiveType || '').toString()
          if (/(2g|3g)/i.test(type)) base = Math.min(base, 20)
          const down = Number(nc.downlink)
          if (!Number.isNaN(down) && down < 1.5) base = Math.min(base, 20)
        }
      } catch(_) {}
      return base
    },
    async onKeyword(v) {
      this.searchKeyword = v
      const q = (v || '').trim()
      if (!q) {
        this.copyStocks = this.stocks.slice(0, 50)
        return
      }
      try {
        this.serverLoading = true
        const { StocksService } = await import('@/service/stocks')
        const token = ++this._searchToken
        const res = await StocksService.searchStocks(q, this.adaptiveLimit(q))
        if (token === this._searchToken) {
          this.copyStocks = res.data.stocksList || []
        }
      } catch (_) {
        // fallback: 클라이언트 필터
        const keyword = q.toLowerCase().replace(/\s+/g, '')
        this.copyStocks = this.stocks.filter(item => (
          (item.name || '').toString().toLowerCase().replace(/\s+/g, '').includes(keyword) ||
          (item.symbol || '').toString().toLowerCase().replace(/\s+/g, '').includes(keyword) ||
          (item.code || '').toString().toLowerCase().replace(/\s+/g, '').includes(keyword)
        )).slice(0, 50)
      } finally {
        this.serverLoading = false
      }
    },
    selectStock(stock) {
      this.isDropdownOpen = false;
      this.selectedStock = stock;
      // 선택 인기 카운트 증가 (비차단)
      import('@/service/stocks').then(({ StocksService }) => {
        try { StocksService.increaseSearchHit(stock.symbol) } catch(_) {}
      })
    },
    cancelSelectStock() {
      this.selectedStock = null;
    },
    search() {
      this.startProcessing();
      (async () => {
        try {
          // 1) 선택된 종목이 있으면 그대로 진행
          if (this.selectedStock) {
            this.$emit('search', this.selectedStock)
            return
          }
          // 2) 선택이 없고 키워드가 있으면 서버 검색 1건 시도
          const q = (this.searchKeyword || '').trim()
          if (q) {
            try {
              const { StocksService } = await import('@/service/stocks')
              const res = await StocksService.searchStocks(q, 1)
              const list = res?.data?.stocksList || []
              if (list.length) {
                this.selectedStock = list[0]
                this.$emit('search', this.selectedStock)
                return
              }
            } catch (_) {}
            // 3) 로컬 후보에서 매칭 1건 선택
            const kw = q.toLowerCase().replace(/\s+/g, '')
            const local = this.copyStocks.find(it => (
              String(it.name||'').toLowerCase().replace(/\s+/g,'').includes(kw) ||
              String(it.symbol||'').toLowerCase().replace(/\s+/g,'').includes(kw) ||
              String(it.code||'').toLowerCase().replace(/\s+/g,'').includes(kw)
            ))
            if (local) {
              this.selectedStock = local
              this.$emit('search', this.selectedStock)
              return
            }
          }
          // 4) 그래도 없으면 첫 항목 혹은 경고
          if (this.copyStocks.length) {
            this.selectedStock = this.copyStocks[0]
            this.$emit('search', this.selectedStock)
          } else {
            alert('검색어를 입력하거나 목록에서 종목을 선택해 주세요.')
          }
        } finally {
          this.endProcessing();
        }
      })()
    },
    startProcessing: function () {
      this.processing = true
    },
    endProcessing: function () {
      this.processing = false
    },
  }

}
</script>