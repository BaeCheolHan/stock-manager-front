<template>
  <div>
    <apexchart type="treemap" :options="treemapChartDataOptions" :series="chartData"></apexchart>
  </div>
</template>


<script>

export default {
  name: "StockTreemapChart",
  components: {},
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
  async created() {
  },
  methods: {}
};
</script>
