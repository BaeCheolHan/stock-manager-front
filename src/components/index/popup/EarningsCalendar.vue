<template>
  <div class="content">
    <div class="pd-10">
      <div class="bold mg-b-6">실적/기업행위 캘린더</div>
      <div class="small mg-b-10">다음 실적 발표 예정 및 최근 배당락/지급일</div>
    </div>
    <div class="grid">
      <div class="card">
        <div class="bold mg-b-6">실적 발표</div>
        <div v-if="!earnings.length" class="small">데이터 없음</div>
        <ul v-else>
          <li v-for="(e,i) in earnings" :key="i">{{ fmtDate(e.date) }} — {{ e.type || 'Earnings' }}</li>
        </ul>
      </div>
      <div class="card">
        <div class="bold mg-b-6">기업행위</div>
        <div v-if="!actions.length" class="small">데이터 없음</div>
        <ul v-else>
          <li v-for="(c,i) in actions" :key="i">{{ fmtDate(c.date) }} — {{ c.event || c.type }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EarningsCalendar',
  props: { symbol: { type: String, required: true } },
  data() { return { earnings: [], actions: [] } },
  async created() {
    try {
      const { default: api } = await import('@/service/apiClient')
      const [e, a] = await Promise.all([
        api.get('/yfin/earnings/dates', { params: { ticker: this.symbol } }).catch(() => null),
        api.get('/yfin/corp-actions', { params: { ticker: this.symbol } }).catch(() => null),
      ])
      this.earnings = (e?.data?.rows || e?.data?.dates || []).slice(0, 10)
      this.actions = (a?.data?.rows || a?.data?.events || []).slice(0, 10)
    } catch(_) {}
  },
  methods: {
    fmtDate(val) {
      if (!val) return ''
      try { return new Date(val).toLocaleDateString('ko-KR') } catch(_) { return String(val) }
    }
  }
}
</script>

<style scoped>
.grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
@media (min-width: 720px) { .grid { grid-template-columns: 1fr 1fr; } }
.card { border: 1px solid #eee; border-radius: 8px; padding: 10px; }
.small { font-size: 12px; color: #666; }
</style>


