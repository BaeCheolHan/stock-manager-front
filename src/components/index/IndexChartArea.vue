<template>
  <div class="flex mg-t-5 text-xs-mobile" style="justify-content: right;">
    <span>* 각 지수는 3분 주기로 갱신합니다.</span>
  </div>
  <div class="flex mg-t-5" style="justify-content: right;">
    <RangeToggle :model-value="chartType" @update:modelValue="changeChartType"/>
  </div>
  <div class="mg-t-10">
    <div class="flex" style="flex-wrap: wrap; max-width: 90%; margin: 0 auto; justify-content: space-around">
      <div style="min-width: 165px; width: 40%" v-if="kospi">
        <div class="flex text-xs-mobile" style="justify-content: flex-start; align-items: center">
          <h4 class="t-a-c mg-r-15">KOSPI</h4>
          <div :class="[UiService().setColorClass(kospi.output1.prdy_vrss_sign)]"
               :style="UiService().isMobileFont()">
            <span>{{ kospi.output1.bstp_nmix_prpr }}</span>
            <span>
              (<span :class="UiService().setUpDownArrowClass(kospi.output1.prdy_vrss_sign)"></span>
            </span>
            <span>{{ kospi.output1.bstp_nmix_prdy_vrss }})</span>
          </div>
        </div>
        <Suspense>
          <template #default>
            <LazyApex type="candlestick" :options="chartOptions" :series="kospiSeries"/>
          </template>
          <template #fallback>
            <v-skeleton-loader type="image"/>
          </template>
        </Suspense>
      </div>
      <div style="min-width: 165px; width: 40%" v-if="kosdaq">
        <div class="flex text-xs-mobile" style="justify-content: flex-start; align-items: center">
          <h4 class="t-a-c mg-r-15">KOSDAQ</h4>
          <div :class="[UiService().setColorClass(kosdaq.output1.prdy_vrss_sign)]"
               :style="UiService().isMobileFont()">
            <span>{{ kosdaq.output1.bstp_nmix_prpr }}</span>
            <span>
              (<span :class="UiService().setUpDownArrowClass(kosdaq.output1.prdy_vrss_sign)"></span>
            </span>
            <span>{{ kosdaq.output1.bstp_nmix_prdy_vrss }})</span>
          </div>
        </div>
        <Suspense>
          <template #default>
            <LazyApex type="candlestick" :options="chartOptions" :series="kosdaqSeries"/>
          </template>
          <template #fallback>
            <v-skeleton-loader type="image"/>
          </template>
        </Suspense>
      </div>
    </div>

    <div class="flex" style="flex-wrap: wrap; max-width: 90%; margin: 0 auto; justify-content: space-around">
      <div style="min-width: 165px; width: 40%" v-if="snp">
        <div class="flex text-xs-mobile" style="justify-content: flex-start; align-items: center">
          <h4 class="t-a-c mg-r-15">S&P500</h4>
          <div :class="[UiService().setColorClass(snp.output1.prdy_vrss_sign)]" :style="UiService().isMobileFont()">
            <span>{{ snp.output1.ovrs_nmix_prpr }}</span>
            <span>
              (<span :class="UiService().setUpDownArrowClass(snp.output1.prdy_vrss_sign)"></span>
            </span>
            <span>{{ snp.output1.ovrs_nmix_prdy_vrss }})</span>
          </div>
        </div>
        <Suspense>
          <template #default>
            <LazyApex type="candlestick" :options="chartOptions" :series="snpSeries"/>
          </template>
          <template #fallback>
            <v-skeleton-loader type="image"/>
          </template>
        </Suspense>
      </div>
      <div style="min-width: 165px; width: 40%" v-if="nasdaq">
        <div class="flex text-xs-mobile" style="justify-content: flex-start; align-items: center">
          <h4 class="t-a-c mg-r-15">NASDAQ</h4>
          <div :class="[UiService().setColorClass(nasdaq.output1.prdy_vrss_sign)]"
               :style="UiService().isMobileFont()">
            <span>{{ nasdaq.output1.ovrs_nmix_prpr }}</span>
            <span>
              (<span :class="UiService().setUpDownArrowClass(nasdaq.output1.prdy_vrss_sign)"></span>
            </span>
            <span>{{ nasdaq.output1.ovrs_nmix_prdy_vrss }})</span>
          </div>
        </div>
        <Suspense>
          <template #default>
            <LazyApex type="candlestick" :options="chartOptions" :series="nasdaqSeries"/>
          </template>
          <template #fallback>
            <v-skeleton-loader type="image"/>
          </template>
        </Suspense>
      </div>
    </div>

    <div class="flex" style="flex-wrap: wrap; max-width: 90%; margin: 0 auto; justify-content: space-around">
      <div style="min-width: 165px; width: 40%" v-if="daw">
        <div class="flex text-xs-mobile" style="justify-content: flex-start; align-items: center">
          <h4 class="t-a-c mg-r-15">다우존스</h4>
          <div :class="[UiService().setColorClass(daw.output1.prdy_vrss_sign)]" :style="UiService().isMobileFont()">
            <span>{{ daw.output1.ovrs_nmix_prpr }}</span>
            <span>
              (<span :class="UiService().setUpDownArrowClass(daw.output1.prdy_vrss_sign)"></span>
            </span>
            <span>{{ daw.output1.ovrs_nmix_prdy_vrss }})</span>
          </div>
        </div>
        <Suspense>
          <template #default>
            <LazyApex type="candlestick" :options="chartOptions" :series="dawSeries"/>
          </template>
          <template #fallback>
            <v-skeleton-loader type="image"/>
          </template>
        </Suspense>
      </div>
      <div style="min-width: 165px; width: 40%" v-if="philadelphia">
        <div class="flex" style="justify-content: flex-start; align-items: center">
          <h4 class="t-a-c mg-r-15">필라델피아 <br/>반도체 지수</h4>
          <div :class="[UiService().setColorClass(philadelphia.output1.prdy_vrss_sign)]"
               :style="UiService().isMobileFont()">
            <span>{{ philadelphia.output1.ovrs_nmix_prpr }}</span>
            <span>
              (<span :class="UiService().setUpDownArrowClass(philadelphia.output1.prdy_vrss_sign)"></span>
            </span>
            <span>{{ philadelphia.output1.ovrs_nmix_prdy_vrss }})</span>
          </div>
        </div>
        <Suspense>
          <template #default>
            <LazyApex type="candlestick" :options="chartOptions" :series="philadelphiaSeries"/>
          </template>
          <template #fallback>
            <v-skeleton-loader type="image"/>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>



<script>
import UiService from "@/service/UiService";
import { defineAsyncComponent } from 'vue'
import RangeToggle from '@/components/etc/RangeToggle.vue'

export default {
  name: "IndexChartArea",
  components: {
    LazyApex: defineAsyncComponent(() => import('vue3-apexcharts')),
    RangeToggle,
  },
  data: function () {
    return {
      kospi: null,
      kosdaq: null,
      snp: null,
      nasdaq: null,
      chartType: 'D',
      kospiSeries: [{
        data: []
      }],
      kosdaqSeries: [
        {
          data: []
        }
      ],
      snpSeries: [
        {
          data: []
        }
      ],
      nasdaqSeries: [
        {
          data: []
        }
      ],
      dawSeries: [
        {
          data: []
        }
      ],
      philadelphiaSeries: [
        {
          data: []
        }
      ],

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
          y: {
            formatter: (val) => {
              if (val == null) return ''
              const n = Number(val)
              if (!Number.isFinite(n)) return ''
              if (n >= 1e8) return (n/1e8).toFixed(2) + '억'
              if (n >= 1e4) return (n/1e4).toFixed(2) + '만'
              return n.toLocaleString('ko-KR')
            }
          }
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
          labels: {
            formatter: function (val) {
              const n = Number(val)
              if (!Number.isFinite(n)) return ''
              if (n >= 1e8) return (n/1e8).toFixed(1) + '억'
              if (n >= 1e4) return (n/1e4).toFixed(1) + '만'
              return n.toLocaleString('ko-KR')
            }
          },
          tooltip: {
            enabled: false
          }
        }
      },
    }
  },
  watch: {
    'chartType': async function () {
      await this.getIndexChartData()
    }
  },
  created: async function () {
    try {
      const saved = localStorage.getItem('idx_chart_type')
      if (saved === 'D' || saved === 'W' || saved === 'M' || saved === 'Y') this.chartType = saved
    } catch (_) {}
    await this.getIndexChartData();
  },
  methods: {
    UiService() {
      return UiService
    },
    async getIndexChartData() {
      const { StocksService } = await import('@/service/stocks')
      let res = await StocksService.getDashboardIndexChart(this.chartType)
      this.kospi = res.data.kospi;
      this.kosdaq = res.data.kosdaq;
      this.snp = res.data.snp;
      this.nasdaq = res.data.nasdaq;
      this.daw = res.data.daw;
      this.philadelphia = res.data.philadelphia;
      this.kospiSeries[0].data = [];
      this.kosdaqSeries[0].data = [];
      this.snpSeries[0].data = [];
      this.nasdaqSeries[0].data = [];
      this.dawSeries[0].data = [];
      this.philadelphiaSeries[0].data = [];
      this.kospi.output2.forEach(item => this.kospiSeries[0].data.push({
        x: item.stck_bsop_date,
        y: [item.bstp_nmix_oprc, item.bstp_nmix_hgpr, item.bstp_nmix_lwpr, item.bstp_nmix_prpr]
      }))
      this.kosdaq.output2.forEach(item => this.kosdaqSeries[0].data.push({
        x: item.stck_bsop_date,
        y: [item.bstp_nmix_oprc, item.bstp_nmix_hgpr, item.bstp_nmix_lwpr, item.bstp_nmix_prpr]
      }))
      this.snp.output2.forEach(item => this.snpSeries[0].data.push({
        x: item.stck_bsop_date,
        y: [item.ovrs_nmix_oprc, item.ovrs_nmix_hgpr, item.ovrs_nmix_lwpr, item.ovrs_nmix_prpr]
      }))
      this.nasdaq.output2.forEach(item => this.nasdaqSeries[0].data.push({
        x: item.stck_bsop_date,
        y: [item.ovrs_nmix_oprc, item.ovrs_nmix_hgpr, item.ovrs_nmix_lwpr, item.ovrs_nmix_prpr]
      }))

      this.daw.output2.forEach(item => this.dawSeries[0].data.push({
        x: item.stck_bsop_date,
        y: [item.ovrs_nmix_oprc, item.ovrs_nmix_hgpr, item.ovrs_nmix_lwpr, item.ovrs_nmix_prpr]
      }))
      this.philadelphia.output2.forEach(item => this.philadelphiaSeries[0].data.push({
        x: item.stck_bsop_date,
        y: [item.ovrs_nmix_oprc, item.ovrs_nmix_hgpr, item.ovrs_nmix_lwpr, item.ovrs_nmix_prpr]
      }))


    },
    changeChartType(val) {
      this.chartType = val;
      try { localStorage.setItem('idx_chart_type', val) } catch(_) {}
    },
  }
};
</script>
