<template>
  <div>
      <apexchart type="bar" height="350" :options="dividendChartOption" :series="chartData"></apexchart>
  </div>
</template>


<script>

export default {
  name: "DividendMonthlyChart",
  components: {
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
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return "" + Number(val).toLocaleString('ko-KR') + " 원"
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
