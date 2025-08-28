<template>
  <div class="content" v-if="detail">
    <div class="flex" style="align-items: center">
      <img
          :src="'https://financialmodelingprep.com/image-stock/'.concat(UiService().getStockLogo(stock)).concat('.png')"
          :style="UiService().isMobile() ? 'max-width: 40px; max-height: 30px;': 'max-width: 50px;: max-height: 40px;'"
          style="border: 1px solid white; border-radius: 5px;"
          class="mg-r-5"
          @error="UiService().replaceStockImg($event)"
      >
      <h2>{{ stock.hts_kor_isnm ? stock.hts_kor_isnm : stock.name}}
        ({{ symbol }})</h2>
    </div>

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
            <RangeToggle :model-value="chartType" :show-year="stock.national === 'KR'" @update:modelValue="changeChartType"/>
          </div>
          <ApexChart :key="'price-' + chartType" :height="UiService().isMobile() ? '200' : '350'" type="candlestick" :options="chartOptions" :series="series" />
        </div>
      </div>
      <div class="dividend-history-chart" v-if="mainChartType === 'history'">
        <ApexChart :key="'dividend-' + mainChartType" :height="UiService().isMobile() ? '200' : '350'" type="bar" :options="dividendChartOptions" :series="dividendSeries" />
      </div>
      <div class="pd-10 border">
        <div class="flex" style="justify-content: space-between;">
          <div>
            <p class="bold">시가 : {{ detail.startPrice.toLocaleString("ko-KR") }}</p>
            <p class="bold">최고가 : {{ detail.highPrice.toLocaleString("ko-KR") }}</p>
            <p class="bold">배당금 : <span v-if="stock.national !== 'KR'">$</span>{{ detail.dividendInfo.annualDividend }}<span v-if="stock.national == 'KR'">원</span></p>
            <p>PER : {{ detail.per }}</p>
            <p>EPS : {{ detail.eps }}</p>
          </div>
          <div>
            <div>
              <span class="bold" :class="[UiService().setColorClass(detail.compareToYesterdaySign)]">현재가 : {{ detail.nowPrice.toLocaleString("ko-KR") }}(</span>
              <span class="bold" :class="[UiService().setColorClass(detail.compareToYesterdaySign), UiService().setUpDownArrowClass(detail.compareToYesterdaySign)]">{{ detail.compareToYesterday.toLocaleString("ko-KR") }})</span>
            </div>
            <p class="bold">최저가 : {{ detail.lowPrice.toLocaleString("ko-KR") }}</p>
            <p class="bold">배당율 : {{ detail.dividendInfo.dividendRate.toLocaleString("ko-KR") }}%</p>
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
import RangeToggle from '@/components/etc/RangeToggle.vue'
import { defineAsyncComponent } from 'vue'

export default {
  name: "DetailStock",
  components: { RangeToggle, ApexChart: defineAsyncComponent(() => import('vue3-apexcharts')) },
  props: {
    msg: String,
    stock: {
      type: Object,
      required: true,
    }
  },
  data: function () {
    return {
      symbol: null,
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
            show: !this.UiService().isMobile(),
            formatter: function (val) {
              return val
            }
          }
        },
        yaxis: {
          show: !this.UiService().isMobile(),
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
            show: !this.UiService().isMobile(),
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
      if(this.stock.symbol) {
        symbol = this.stock.symbol;
      }
      if(this.stock.mksc_shrn_iscd) {
        symbol = this.stock.mksc_shrn_iscd;
      }

      let national = 'KR';
      if(this.stock.national && this.stock.national !== 'KR') {
        national = this.stock.national;
      }


      const { StocksService } = await import('@/service/stocks')
      let res = await StocksService.getStockChart(this.chartType, national, symbol)

      const nextData = res.data.chartData.map(item => ({
        x: item.date,
        y: [item.open, item.high, item.low, item.close]
      }))
      this.series = [{ name: this.series[0]?.name || this.stock.name, data: nextData }]
    }
  },
  async created() {
    await this.init();
  },
  methods: {
    UiService() {
      return UiService
    },
    async init() {
      this.symbol = this.stock.mksc_shrn_iscd ? this.stock.mksc_shrn_iscd : this.stock.symbol;
      const { StocksService } = await import('@/service/stocks')
      let res = await StocksService.getStockBySymbol(this.symbol)
      this.detail = res.data.detail;
      const initData = res.data.chartData.map(item => ({
        x: item.date,
        y: [item.open, item.high, item.low, item.close]
      }))
      this.series = [{ name: this.stock.name, data: initData }]

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
