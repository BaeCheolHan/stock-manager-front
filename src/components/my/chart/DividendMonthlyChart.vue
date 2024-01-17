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
