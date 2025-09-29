<template>
  <div>
    <Suspense>
      <template #default>
        <div class="grid">
          <div class="chart-block">
            <div class="chart-title-sm">연도별 & 월별 세후 배당금 합계</div>
            <LazyApex type="bar" height="350" :options="dividendChartOption" :series="chartData"/>
          </div>
        </div>
      </template>
      <template #fallback>
        <v-skeleton-loader type="image"/>
      </template>
    </Suspense>
  </div>
</template>


<script>

import { defineAsyncComponent } from 'vue'

export default {
  name: "DividendMonthlyChart",
  components: {
    LazyApex: defineAsyncComponent(() => import('vue3-apexcharts')),
  },
  props: {
    chartData: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      dividendChartOption: {
        chart: {
          type: 'bar',
          height: 350,
          toolbar: {
            show: false
          }
        },
        // fill: {
        //   type: 'gradient',
        //   gradient: {
        //     shadeIntensity: 1,
        //     type: "vertical",
        //     opacityFrom: 0.7,
        //     opacityTo: 0.9,
        //     colorStops: [
        //       {offset: 0, color: "#fbc2eb", opacity: 1},
        //       {offset: 100, color: "#a18cd1", opacity: 1}
        //     ]
        //   }
        // },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '100%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        },
        yaxis: {
          show: true,
          labels: {
            formatter: function(val) {
              if(val === 0) {
                return val.toLocaleString('ko-KR')
              }

              if(val > 1000) {
                return  (val / 10000).toLocaleString('ko-KR') + ('만원')
              }

              return val.toLocaleString('ko-KR')
            },
          }
        },
        fill: {
          opacity: 0.9
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return Number(val).toLocaleString('ko-KR') + ' 원'
            }
          }
        }
      },
    }
  },
  async created() {
  },
  methods: {
  }
};
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
