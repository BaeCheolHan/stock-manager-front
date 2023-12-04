<template>
  <AssetChart class="pd-r-20" :chartData="assetChartSeries" :chartOptions="assetChartOptions" v-if="assetChartSeries"/>
</template>

<script>
import AssetChart from "@/components/my/chart/AssetChart.vue";

export default {
  name: "AssetBoard",
  components: {
    AssetChart
  },
  mounted() {
  },
  async created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (this.userInfo) {
      this.$store.commit('setUserInfo', this.userInfo)
      this.accounts = this.userInfo.bankAccounts;
      this.bankAccountTab = 'all'
    } else {
      location.replace("/");
    }

    await this.getAssetChartData();
  },
  data() {
    return {
      userInfo: null,
      assetChartSeries: [],
      assetChartOptions: {},
    }
  },
  methods: {
    getAssetChartData: async function () {
      let res = await this.axios.get("/api/asset/member/".concat(this.userInfo.memberId).concat("/chart"));
      if (res.data.assetCharts) {
        this.assetChartSeries = [
          {
            name: "투자 금액",
            data: res.data.assetCharts.investmentAmountList
          },
          {
            name: "평가 금액",
            data: res.data.assetCharts.evaluationAmountList
          }
        ];

        this.assetChartOptions = {
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
          yaxis: {
            show: true,
            labels: {
              formatter: function(val) {
                if(val === 0) {
                  return val.toLocaleString('ko-KR')
                }

                if(val > 1000) {
                  return  (val / 10000).toLocaleString('ko-KR') + '만원'
                }

                return val.toLocaleString('ko-KR')
              },
            }
          },
          tooltip: {
            x: {
              format: 'yy-MM-dd '
            },
            y: {
              formatter: function (val) {
                return "" + Number(val).toLocaleString('ko-KR') + " 원"
              }
            }
          },
        }
      }

    },
  }
}
</script>