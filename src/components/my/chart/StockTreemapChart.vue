<template>
  <div>
    <Suspense>
      <template #default>
        <LazyApex type="treemap" :options="treemapChartDataOptions" :series="chartData"/>
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
  name: "StockTreemapChart",
  components: { LazyApex: defineAsyncComponent(() => import('vue3-apexcharts')) },
  props: {
    chartData: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      treemapChartDataOptions: {
        legend: {
          show: false
        },
        chart: {
          height: 350,
          type: 'treemap',
          toolbar: {
            show: false
          }
        },
        title: {
          text: '종목별 투자 비중',
          align: 'center',
        },
        dataLabels: {
          enable: true,
          style: {
            fontSize: '12px',
          },
          formatter: function (text, op) {
            return [text, op.value + '%']
          },
          offsetY: -4
        },
        plotOptions: {
          treemap: {
            distributed: true,
            enableShades: false
          }
        },
      }
    }
  },
  created() {
  },
  methods: {}
};
</script>
