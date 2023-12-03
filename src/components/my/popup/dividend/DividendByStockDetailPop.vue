<template>
  <div>
    <h2>{{ $parent.$parent.selectedStock.name }}({{ $parent.$parent.selectedStock.symbol }}) 배당</h2>
  </div>
  <div>
    <apexchart height="350" type="bar" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>
<script>
export default {
  name: "DividendByStockDetailPop",
  props: {},
  data() {
    return {
      userInfo: null,
      chartOptions: {
        chart: {
          id: 'basic-bar',
          toolbar: {
            show: false
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: []
        }
      },
      series: [{
        name: 'series-1',
        data: []
      }]
    }
  },
  async created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (this.userInfo) {
      this.$store.commit('setUserInfo', this.userInfo)
      this.accounts = this.userInfo.bankAccounts;
      this.bankAccountTab = 'all';

      let res = await this.axios.get('/api/dividend/by-item/'.concat(this.userInfo.memberId).concat('/').concat(this.$parent.$parent.selectedStock.symbol));

      for (let data of res.data.data) {
        this.chartOptions.xaxis.categories.push(data.year.toString().concat('-').concat(data.month.toString()))
        this.series[0].data.push(data.dividend)
      }

    } else {
      location.replace("/");
    }

  },
  methods: {}

}
</script>