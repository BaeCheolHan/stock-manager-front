<template>
  <div>
    <apexchart type="treemap" :options="treemapChartDataOptions" :series="chartData"></apexchart>
  </div>
</template>


<script>

export default {
  name: "DashboardTreemapChart",
  components: {},
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
        colors: [
          '#FF0000',
          '#1E5D8C',
          '#D43F97',
          '#00FF00',
          '#EC3C65',
          '#334CFF',
          '#FF5733',
          '#33AFFF',
          '#F7B844',
          '#EF6537',
          '#3B93A5',
          '#ADD8C7',
          '#CDD7B6',
          '#C1F666',
          '#421243',
          '#7F94B0',
          '#C0ADDB',
          '#FF00FF',
          '#800080',
          '#808000',
          '#800000',
          '#008000'
        ],
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
