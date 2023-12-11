<template>
  <div class="content" v-if="detail">
    <h2>{{ $parent.$parent.selectedStock.hts_kor_isnm ? $parent.$parent.selectedStock.hts_kor_isnm : $parent.$parent.selectedStock.name}}({{ $parent.$parent.selectedStock.mksc_shrn_iscd ? $parent.$parent.selectedStock.mksc_shrn_iscd : $parent.$parent.selectedStock.symbol }})</h2>
    <div class="popup-wrap" style="padding: 10px 0 0;!important;">

      <div class="mg-b-20">
        <v-tabs v-model="mainChartType" color="#e00000" align-tabs="end">
          <v-tab :key="'stock'" :value="'stock'">
            주가 차트
          </v-tab>
          <v-tab :key="'history'" :value="'history'">
            배당 차트
          </v-tab>
        </v-tabs>
      </div>

      <div class="price-chart" v-if="mainChartType === 'stock'">
        <div v-if="series" id="chart">
          <div class="flex mg-l-5">
            <button class="mg-r-10" :class="{'redBtn' : chartType === 'D', 'border-radius-8' : chartType !== 'D'}"
                    @click="changeChartType('D')">일별
            </button>
            <button class="mg-r-10" :class="{'redBtn' : chartType === 'W', 'border-radius-8' : chartType !== 'W'}"
                    @click="changeChartType('W')">주별
            </button>
            <button class="mg-r-10" :class="{'redBtn' : chartType === 'M', 'border-radius-8' : chartType !== 'M'}"
                    @click="changeChartType('M')">월별
            </button>
            <button v-if="$parent.$parent.selectedStock.national === 'KR'"
                    :class="{'redBtn' : chartType === 'Y', 'border-radius-8' : chartType !== 'Y'}"
                    @click="changeChartType('Y')">년별
            </button>
          </div>
          <apexchart :height="UiService.isMobile() ? '200' : '350'" type="candlestick" :options="chartOptions" :series="series"></apexchart>
        </div>
      </div>
      <div class="dividend-history-chart" v-if="mainChartType === 'history'">
        <apexchart :height="UiService.isMobile() ? '200' : '350'" type="bar" :options="dividendChartOptions" :series="dividendSeries"></apexchart>
      </div>
      <div class="pd-10 border">
        <div class="flex" style="justify-content: space-between;">
          <div>
            <p class="bold">시가 : {{ detail.startPrice.toLocaleString("ko-KR") }}</p>
            <p class="bold">최고가 : {{ detail.highPrice.toLocaleString("ko-KR") }}</p>
            <p class="bold">배당금 : <span v-if="$parent.$parent.selectedStock.national !== 'KR'">$</span>{{ detail.dividendInfo.dividendRate.toLocaleString("ko-KR") }}<span v-if="$parent.$parent.selectedStock.national == 'KR'">원</span></p>
            <p>PER : {{ detail.per }}</p>
            <p>EPS : {{ detail.eps }}</p>
          </div>
          <div>
            <div>
              <span class="bold" :style="UiService.setColorStyle(detail.compareToYesterdaySign)">현재가 : {{ detail.nowPrice.toLocaleString("ko-KR") }}(</span>
              <span class="bold" :style="UiService.setColorStyle(detail.compareToYesterdaySign)" :class="UiService.setUpDownArrowClass(detail.compareToYesterdaySign)">{{ detail.compareToYesterday.toLocaleString("ko-KR") }})</span>
            </div>
            <p class="bold">최저가 : {{ detail.lowPrice.toLocaleString("ko-KR") }}</p>
            <p class="bold">배당율 : {{ detail.dividendInfo.annualDividend }}%</p>
            <p>PBR : {{ detail.pbr }}</p>
            <p>BPS : {{ detail.bps }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import UiService from "@/service/UiService";

export default {
  name: "DetailStock",
  components: {},
  props: {
    msg: String,
  },
  data: function () {
    return {
      mainChartType: 'stock',
      detail: null,
      totalPrice: 0,
      totalQuantity: 0,
      rateOfReturn: 0,
      chartType: 'D',
      series: [{
        data: []
      }],
      chartOptions: {
        chart: {
          height: 350,
          type: 'candlestick',
          toolbar: {
            show: false
          }
        },
        title: {
          text: '',
          align: 'left'
        },
        plotOptions: {
          candlestick: {
            colors: {
              upward: '#fa0202',
              downward: '#0213fa'
            }
          }
        },
        tooltip: {
          enabled: true,
        },
        xaxis: {
          type: 'category',
          labels: {
            show: !UiService.isMobile(),
            formatter: function (val) {
              return val
            }
          }
        },
        yaxis: {
          show: !UiService.isMobile(),
          tooltip: {
            enabled: true
          }
        }
      },
      dividendChartOptions: {
        chart: {
          height: 350,
          id: 'basic-bar',
          toolbar: {
            show: false
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: [],
          labels: {
            show: !this.UiService.isMobile(),
            formatter: function(val) {
              return val
            }
          }
        },
        yaxis: {
          labels: {
            show: true,
            formatter: function(val) {
              return val.toLocaleString('ko-KR')
            }
          },
          tooltip: {
            enabled: true
          }
        }
      },
      dividendSeries: [{
        name: '',
        data: []
      }]


    }
  },
  watch: {
    chartType: async function () {
      let symbol;
      if(this.$parent.$parent.selectedStock.symbol) {
        symbol = this.$parent.$parent.selectedStock.symbol;
      }

      if(this.$parent.$parent.selectedStock.mksc_shrn_iscd) {
        symbol = this.$parent.$parent.selectedStock.mksc_shrn_iscd;
      }

      console.log(this.$parent.$parent.selectedStock)

      let national = 'KR';
      if(this.$parent.$parent.selectedStock.national && this.$parent.$parent.selectedStock.national !== 'KR') {
        national = this.$parent.$parent.selectedStock.national;
      }


      let res = await this.axios.get('/api/stock/chart/'.concat(this.chartType)
          .concat('/')
          .concat(national)
          .concat('/').concat(symbol));

      this.series[0].data = [];

      res.data.chartData.forEach(item => this.series[0].data.push({
        x: item.date,
        y: [item.open, item.high, item.low, item.close]
      }))
    }
  },
  async created() {
    await this.init();
  },
  methods: {
    async init() {
      let symbol;
      if(this.$parent.$parent.selectedStock.symbol) {
        symbol = this.$parent.$parent.selectedStock.symbol;
      }

      if(this.$parent.$parent.selectedStock.mksc_shrn_iscd) {
        symbol = this.$parent.$parent.selectedStock.mksc_shrn_iscd;
      }
      let res = await this.axios.get("/api/stock"
          .concat("?symbol=").concat(symbol))
      this.detail = res.data.detail;
      this.series[0].name = this.$parent.$parent.selectedStock.name
      res.data.chartData.forEach(item => this.series[0].data.push({
        x: item.date,
        y: [item.open, item.high, item.low, item.close]
      }))

      for (let data of res.data.detail.dividendInfo.dividendHistories) {
        this.dividendChartOptions.xaxis.categories.push(data.date);
        this.dividendSeries[0].data.push(data.dividend)
      }
    },
    changeChartType(chartType) {
      this.chartType = chartType;
    },
  }
};
</script>
