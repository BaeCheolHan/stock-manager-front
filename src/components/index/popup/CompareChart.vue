<template>
  <div class="content">
    <div class="flex mg-b-10" style="gap: 8px; align-items: center;">
      <input v-model="inputText" class="form-control" placeholder="심볼을 쉼표로 입력 (예: AAPL, MSFT, 005930)" @keyup.enter="applySymbols" />
      <v-btn color="primary" size="small" @click="applySymbols">적용</v-btn>
    </div>
    <ApexChart type="line" :height="UiService().isMobile() ? '220' : '360'" :options="chartOptions" :series="series"/>
  </div>
  
</template>

<script>
import { defineAsyncComponent } from 'vue'
import UiService from '@/service/UiService'

export default {
  name: 'CompareChart',
  components: { ApexChart: defineAsyncComponent(() => import('vue3-apexcharts')) },
  props: {
    initialSymbols: { type: Array, default: () => [] },
  },
  data() {
    return {
      inputText: '',
      series: [],
      chartOptions: {
        chart: { type: 'line', toolbar: { show: false } },
        stroke: { width: 2, curve: 'smooth' },
        dataLabels: { enabled: false },
        xaxis: { type: 'category', labels: { show: !this.UiService().isMobile() } },
        yaxis: { labels: { formatter: (v) => Number(v).toFixed(0) } },
        tooltip: { y: { formatter: (v) => Number(v).toFixed(2) } },
        legend: { position: 'top' },
      }
    }
  },
  async created() {
    const list = (this.initialSymbols || []).filter(Boolean)
    this.inputText = list.join(', ')
    if (list.length) await this.fetchAll(list)
  },
  methods: {
    UiService() { return UiService },
    parseSymbols() {
      return String(this.inputText || '')
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 6)
    },
    async applySymbols() {
      const syms = this.parseSymbols()
      if (!syms.length) return
      await this.fetchAll(syms)
    },
    async fetchAll(symbols) {
      try {
        const { default: api } = await import('@/service/apiClient')
        const range = '6mo', interval = '1d'
        const calls = symbols.map(sym => api.get('/yfin/history', { params: { ticker: sym, range, interval, autoAdjust: true } }).then(r => ({ sym, body: r?.data })).catch(() => ({ sym, body: null })))
        const results = await Promise.all(calls)
        const mapped = []
        for (const { sym, body } of results) {
          const rows = Array.isArray(body?.rows) ? body.rows : []
          if (!rows.length) continue
          const base = Number(rows[0]?.close)
          if (!Number.isFinite(base) || base <= 0) continue
          const data = rows.map(r => ({ x: r.time, y: (Number(r.close) / base) * 100 }))
          mapped.push({ name: sym, data })
        }
        this.series = mapped
      } catch (_) {}
    },
  }
}
</script>

<style scoped>
.form-control { flex: 1; padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; }
</style>


