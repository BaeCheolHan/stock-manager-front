<template>
  <div class="live-quotes">
    <div class="controls">
      <label>
        Interval(s):
        <input type="number" min="1" :value="intervalSecLocal" @change="onIntervalChange($event)" />
      </label>
    </div>
    <div class="status">
      <span v-if="connected">연결됨</span>
      <span v-else>연결 대기/재연결 중...</span>
    </div>

    <table class="quotes-table">
      <thead>
        <tr>
          <th>종목</th>
          <th>가격</th>
          <th>변동</th>
          <th>변동%</th>
          <th>시간</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="q in quotes" :key="q.symbol">
          <td>{{ q.symbol }}</td>
          <td>{{ formatNumber(q.regularMarketPrice) }}</td>
          <td :class="{ up: q.regularMarketChange >= 0, down: q.regularMarketChange < 0 }">
            {{ formatSigned(q.regularMarketChange) }}
          </td>
          <td :class="{ up: q.regularMarketChangePercent >= 0, down: q.regularMarketChangePercent < 0 }">
            {{ formatPercent(q.regularMarketChangePercent) }}
          </td>
          <td>{{ formatTime(q.regularMarketTime) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  
</template>

<script setup>
import { onMounted, onBeforeUnmount, reactive, computed, watch, ref } from 'vue'
import { createQuoteWS } from '@/services/quoteWsClient'

const props = defineProps({
  tickers: { type: [Array, String], required: true },
  intervalSec: { type: Number, default: 1 }
})

const state = reactive({
  quotesMap: new Map(),
  connected: false
})

const intervalSecLocal = ref(props.intervalSec)
let client = null

const quotes = computed(() => Array.from(state.quotesMap.values()))
const connected = computed(() => state.connected)

function start(tickers, interval) {
  if (client) {
    try { client.close() } catch (_) {}
  }
  client = createQuoteWS(tickers, { intervalSec: interval })
  client
    .onOpen(() => { state.connected = true })
    .onClose(() => { state.connected = false })
    .onError(() => { state.connected = false })
    .onMessage((list) => {
      // list is Array<QuoteDto>
      for (const q of list) {
        if (!q || !q.symbol) continue
        state.quotesMap.set(q.symbol, q)
      }
    })
  client.connect()
}

function resubscribe() {
  if (!client) return
  client.resubscribe(props.tickers, { intervalSec: intervalSecLocal.value })
}

function onIntervalChange(e) {
  const v = Number(e.target.value || 1)
  intervalSecLocal.value = Math.max(1, v)
  resubscribe()
}

watch(() => props.tickers, () => {
  resubscribe()
})

onMounted(() => {
  start(props.tickers, intervalSecLocal.value)
})

onBeforeUnmount(() => {
  if (client) {
    try { client.close() } catch (_) {}
  }
})

function formatNumber(v) {
  if (v == null) return '-'
  try {
    return Number(v).toLocaleString(undefined, { maximumFractionDigits: 4 })
  } catch (_) { return String(v) }
}
function formatSigned(v) {
  if (v == null) return '-'
  const n = Number(v)
  const sign = n > 0 ? '+' : ''
  return sign + formatNumber(n)
}
function formatPercent(v) {
  if (v == null) return '-'
  const n = Number(v) * 100
  const sign = n > 0 ? '+' : ''
  return sign + n.toFixed(2) + '%'
}
function formatTime(epochSeconds) {
  if (!epochSeconds) return '-'
  try {
    const d = new Date(epochSeconds * 1000)
    return d.toLocaleString()
  } catch (_) { return '-' }
}
</script>

<style scoped>
.live-quotes {
  padding: 12px;
}
.controls {
  margin-bottom: 8px;
}
.status {
  margin-bottom: 8px;
}
.quotes-table {
  width: 100%;
  border-collapse: collapse;
}
.quotes-table th, .quotes-table td {
  border: 1px solid #e0e0e0;
  padding: 6px 8px;
  text-align: right;
}
.quotes-table th:first-child,
.quotes-table td:first-child {
  text-align: left;
}
.up { color: #0a7d26; }
.down { color: #c62828; }
</style>


