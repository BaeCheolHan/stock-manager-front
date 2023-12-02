<template>
  <div>
    <apexchart type="area" height="350" :options="assetChartOptions" :series="chartData"></apexchart>
  </div>
</template>


<script>

export default {
  name: "AssetChart",
  components: {},
  data() {
    return {
      assetChartOptions: {
        chart: {
          height: 350,
          type: 'area',
          toolbar: {
            show: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth'
        },
        xaxis: {
          type: 'date',
          categories: res.data.assetCharts.xaxisCategories
        },
        tooltip: {
          x: {
            format: 'yy-MM-dd '
          },
        },
      }
    }
  },
  async created() {
  },
  methods: {}
};
</script>
