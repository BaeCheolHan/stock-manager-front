<template>
  <div class="content" v-if="detail">
    <div class="flex" style="justify-content: left; align-items: center">
      <img
          :src="'https://financialmodelingprep.com/image-stock/'.concat(UiService().getStockLogo($parent.$parent.selectedStock)).concat('.png')"
          :style="UiService().isMobile() ? 'max-width: 40px; max-height: 30px;': 'max-width: 50px;: max-height: 40px;'"
          style="border: 1px solid white; border-radius: 5px;"
          class="mg-r-5"
          @error="UiService().replaceStockImg($event)"
      >
      <h2>{{ $parent.$parent.selectedStock.name }}
        <span>(</span>
        <span :class="UiService().setUpDownArrowClass(detail.compareToYesterdaySign)"
              :style="UiService().setColorStyle(detail.compareToYesterdaySign)">
          {{ Math.floor(((detail.compareToYesterday / detail.nowPrice) * 100) * 100) / 100 }}%
        </span>
        <span>)</span>
      </h2>
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
      <div class="price-chart" v-if="mainChartType == 'stock'">
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
            <button v-if="$parent.$parent.selectedStock.national == 'KR'"
                    :class="{'redBtn' : chartType === 'Y', 'border-radius-8' : chartType !== 'Y'}"
                    @click="changeChartType('Y')">년별
            </button>
          </div>
          <apexchart :height="UiService().isMobile() ? '200' : '350'" type="candlestick" :options="chartOptions"
                     :series="series"></apexchart>
        </div>
      </div>
      <div class="dividend-history-chart" v-if="mainChartType == 'history'">
        <apexchart :height="UiService().isMobile() ? '200' : '350'" type="bar" :options="dividendChartOptions"
                   :series="dividendSeries"></apexchart>
      </div>
      <div>

      </div>
      <div class="pd-10 border">
        <div class="flex" style="justify-content: space-between;">
          <div>
            <p class="bold">시가 : {{ detail.startPrice.toLocaleString("ko-KR") }}</p>
            <p class="bold">최고가 : {{ detail.highPrice.toLocaleString("ko-KR") }}</p>
            <p class="bold">배당금 : <span v-if="$parent.$parent.selectedStock.national !== 'KR'">$</span>{{
                detail.dividendInfo.dividendRate.toLocaleString("ko-KR")
              }}<span v-if="$parent.$parent.selectedStock.national == 'KR'">원</span></p>
            <p>PER : {{ detail.per }}</p>
            <p>EPS : {{ detail.eps }}</p>
          </div>
          <div>
            <div>
              <span class="bold" :style="UiService().setColorStyle(detail.compareToYesterdaySign)">현재가 : {{
                  detail.nowPrice.toLocaleString("ko-KR")
                }}(</span>
              <span class="bold" :style="UiService().setColorStyle(detail.compareToYesterdaySign)"
                    :class="UiService().setUpDownArrowClass(detail.compareToYesterdaySign)">{{
                  detail.compareToYesterday.toLocaleString("ko-KR")
                }})</span>
            </div>
            <p class="bold">최저가 : {{ detail.lowPrice.toLocaleString("ko-KR") }}</p>
            <p class="bold">배당율 : {{ detail.dividendInfo.annualDividend }}%</p>
            <p>PBR : {{ detail.pbr }}</p>
            <p>BPS : {{ detail.bps }}</p>
          </div>
        </div>
        <v-divider class="mg-t-10 mg-b-10"></v-divider>
        <div class="flex" style="justify-content: space-between">
          <div>
            <p class="bold" :style="setPlusMinusColor(detail.nowPrice - Math.floor(totalPrice / totalQuantity))"
               v-if="$parent.$parent.selectedStock.national == 'KR'">
              평균가 : {{ Math.floor(totalPrice / totalQuantity).toLocaleString("ko-KR") }}원
            </p>
            <p class="bold" v-else>평균가 : ${{ Math.floor(totalPrice / totalQuantity).toLocaleString("ko-KR") }}</p>
            <p class="bold">총 구매 가격 : </p>
            <p class="bold red">총 수령 배당금 : </p>
            <p class="bold" :style="setPlusMinusColor(rateOfReturn)">현재 자산 가치 : </p>
          </div>
          <div class="t-a-r">
            <p class="bold">수량 : {{ totalQuantity }} 주</p>
            <p class="bold" v-if="$parent.$parent.selectedStock.national == 'KR'">
              {{ totalPrice.toLocaleString("ko-KR") }}원
            </p>
            <p class="bold" v-else>$ {{ Math.floor(totalPrice).toLocaleString("ko-KR") }}</p>

            <p class="bold red" v-if="$parent.$parent.selectedStock.national == 'KR'">
              {{ detail.totalDividend.toLocaleString('ko-KR') }}원</p>
            <p class="bold red" v-else> ${{ detail.totalDividend.toLocaleString('ko-KR') }}</p>

            <p class="bold" v-if="$parent.$parent.selectedStock.national == 'KR'"
               :style="setPlusMinusColor(rateOfReturn)">
              {{ Math.floor((this.detail.nowPrice * this.totalQuantity)).toLocaleString('ko-KR') }}원
              ({{ rateOfReturn.toLocaleString("ko-KR") }}원)
            </p>
            <p class="bold" v-else :style="setPlusMinusColor(rateOfReturn)">
              ${{ Math.floor((this.detail.nowPrice * this.totalQuantity)).toLocaleString('ko-KR') }}
              (${{ rateOfReturn.toLocaleString("ko-KR") }})
            </p>
          </div>

        </div>
      </div>

      <v-divider class="mg-t-10 mg-b-10"></v-divider>
      <div class="mg-t-10">
        <v-card class="mg-b-5" v-for="stock in detail.stocks" :key="stock.id">
          <v-card-text style="padding: 3px 5px 5px 5px; !important;">
            <div>
              <div class="flex" style="justify-content: space-between">
                <p>구매일: {{ yyyyMMdd(stock.createdDate) }}</p>
                <i class="ti-trash" @click="removeHistory(stock.id)"></i>
              </div>
              <div class="flex" style="justify-content: space-between">
                <p v-if="$parent.$parent.selectedStock.national == 'KR'">구매가: {{ stock.price.toLocaleString("ko-KR") }}
                  원</p>
                <p v-else>구매가: $ {{ stock.price.toLocaleString("ko-KR") }}</p>
                <p>수량: {{ stock.quantity }}</p>
              </div>
            </div>

          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>

import DividendByStockBox from "@/components/my/board/dividend/DividendBoard/DividendByStockBox.vue";
import DividendHistoryBox from "@/components/my/board/dividend/DividendBoard/DividendHistoryBox.vue";
import UiService from "@/service/UiService";

export default {
  name: "MyDetailStock",
  components: {
    DividendHistoryBox, DividendByStockBox
  },
  props: {
    msg: String,
  },
  data() {
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
            formatter: function (val) {
              return val
            }
          }
        },
        yaxis: {
          labels: {
            show: true,
            formatter: function (val) {
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
    async chartType() {
      let res = await this.axios.get('/api/stock/chart/'.concat(this.chartType)
          .concat('/').concat(this.$parent.$parent.selectedStock.national)
          .concat('/').concat(this.$parent.$parent.selectedStock.symbol));
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
    UiService() {
      return UiService
    },
    async init() {
      let res = await this.axios.get("/api/stock/"
          .concat(JSON.parse(sessionStorage.getItem('userInfo')).memberId)
          .concat("/").concat(this.$parent.$parent.selectedStock.national)
          .concat("/").concat(this.$parent.$parent.selectedStock.code)
          .concat("?symbol=").concat(this.$parent.$parent.selectedStock.symbol))
      this.detail = res.data.detail;
      this.detail.stocks.forEach(item => this.totalPrice += (item.quantity * item.price))
      this.detail.stocks.forEach(item => this.totalQuantity += item.quantity)
      this.rateOfReturn = Math.floor((this.detail.nowPrice * this.totalQuantity) - this.totalPrice);
      this.series[0].name = this.$parent.$parent.selectedStock.name
      res.data.detail.chartData.forEach(item => this.series[0].data.push({
        x: item.date,
        y: [item.open, item.high, item.low, item.close]
      }))


      for (let data of res.data.detail.dividendInfo.dividendHistories) {
        this.dividendChartOptions.xaxis.categories.push(data.date);
        this.dividendSeries[0].data.push(data.dividend)
      }
    },
    yyyyMMdd(value) {
      if (value === '') return '';
      let jsDate = new Date(value);
      jsDate.setHours(jsDate.getHours() + 9);
      return jsDate.toISOString().replace('T', ' ').substring(0, 10);
    },
    async removeHistory(id) {
      if (confirm("삭제하시겠습니까?")) {
        await this.axios.delete("/api/stock/".concat(id));
        await this.init();
        await this.emitter.emit('reloadStock');
      }
    },
    setPlusMinusColor(amount) {
      return Number(amount) > 0 ? 'color: red' : 'color: blue'
    },
    changeChartType(chartType) {
      this.chartType = chartType;
    },
  }
};
</script>
