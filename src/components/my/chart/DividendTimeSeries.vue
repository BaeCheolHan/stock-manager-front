<template>
  <div class="time-series-charts">
    <Suspense>
      <template #default>
        <div class="grid">
          <div class="chart-block">
            <div class="chart-title-sm">월별 세후 배당금 합계</div>
            <LazyApex
              type="bar"
              height="300"
              :options="monthlyOptions"
              :series="[{ name: '월별 세후 배당금 합계', data: monthly }]"
            />
          </div>
          <div class="chart-block">
            <div class="chart-title-sm">누적 배당금</div>
            <LazyApex
              type="area"
              height="300"
              :options="cumulativeOptions"
              :series="[{ name: '누적 배당금', data: cumulative }]"
            />
          </div>
        </div>
      </template>
      <template #fallback>
        <v-skeleton-loader type="image, image"/>
      </template>
    </Suspense>
  </div>
  
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
  name: 'DividendTimeSeries',
  components: {
    LazyApex: defineAsyncComponent(() => import('vue3-apexcharts')),
  },
  props: {
    labels: { type: Array, required: true },
    monthly: { type: Array, required: true },
    cumulative: { type: Array, required: true },
  },
  data() {
    const currencyFormatter = (val) => {
      if (val === null || val === undefined) return ''
      return Number(val).toLocaleString('ko-KR')
    }
    return {
      monthlyOptions: {
        chart: { toolbar: { show: false } },
        xaxis: { categories: this.labels, labels: { rotate: -35 } },
        plotOptions: { bar: { columnWidth: '65%' } },
        dataLabels: { enabled: false },
        yaxis: {
          labels: {
            formatter: (v) => currencyFormatter(v)
          }
        },
        tooltip: {
          y: { formatter: (v) => `${currencyFormatter(v)} 원` }
        },
        legend: { show: false }
      },
      cumulativeOptions: {
        chart: { toolbar: { show: false } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 } },
        xaxis: { categories: this.labels, labels: { rotate: -35 } },
        yaxis: {
          labels: {
            formatter: (v) => currencyFormatter(v)
          }
        },
        tooltip: {
          y: { formatter: (v) => `${currencyFormatter(v)} 원` }
        }
      }
    }
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 900px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}
.chart-title-sm { font-weight: 700; font-size: 14px; margin: 6px 6px 4px; }
.chart-block { background: #fff; }
</style>


