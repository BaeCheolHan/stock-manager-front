<template>
  <DividendMonthlyChart :chart-data="dividendChartSeries" v-if="dividendChartSeries"/>

  <DividendTimeSeries
      v-if="timeSeries.labels && timeSeries.labels.length"
      :labels="timeSeries.labels"
      :monthly="timeSeries.monthly"
      :cumulative="timeSeries.cumulative"
  />

  <v-card>
    <v-window>
      <v-window-item>
        <v-container :fluid="true">
          <!-- 배당금 추가 버튼 -->
          <button @click="openDividendPop" aria-label="배당 등록">
            <DividendIcon />
          </button>
          <v-data-table-virtual :headers="headers" :items="desserts" class="elevation-1 mg-t-10 dividend-year-table" item-value="name" v-if="desserts" style="font-size: 12px;"/>
          <div v-else class="mg-t-10">
            <v-skeleton-loader type="table"/>
          </div>

          <v-divider class="mg-t-30 mg-b-30"></v-divider>

          <h2 class="mg-t-20  mg-l-10">배당 현황</h2>

          <div class="mg-b-20">
            <v-tabs v-model="dividendBoxType" color="#e00000" align-tabs="end">
              <v-tab :key="'by-item'" :value="'by-item'">
                종목별 수령 배당금
              </v-tab>
              <v-tab :key="'history'" :value="'history'">
                배당 수령 기록
              </v-tab>
            </v-tabs>
          </div>
          <template v-if="dividendBoxType === 'history'">
            <DividendHistoryBox :dividends="dividends" v-if="dividends && dividends.length" @reload="reloadDividend"/>
            <div v-else class="mg-t-10 t-a-c">
              <div class="mg-b-10">아직 배당 내역이 없습니다.</div>
              <v-btn color="primary" variant="elevated" @click="openDividendPop">지금 등록</v-btn>
            </div>
          </template>
          <template v-else>
            <DividendByStockBox :dividends="dividendByItem" v-if="dividendByItem && dividendByItem.length"/>
            <div v-else class="mg-t-10 t-a-c">
              <div class="mg-b-10">등록된 배당 종목이 없습니다.</div>
              <v-btn color="primary" variant="elevated" @click="openDividendPop">지금 등록</v-btn>
            </div>
          </template>
        </v-container>
      </v-window-item>
    </v-window>
  </v-card>

  <Modal v-if="isSnowDividendRegPop" @close-modal="isSnowDividendRegPop = false">
    <SaveDividend msg="" @saved="reloadDividend"/>
  </Modal>
</template>


<script>
import DividendMonthlyChart from "@/components/my/chart/DividendMonthlyChart.vue";
import DividendTimeSeries from "@/components/my/chart/DividendTimeSeries.vue";
import DividendIcon from "@/components/etc/button/DividendIcon.vue";
import DividendHistoryBox from "@/components/my/board/dividend/DividendBoard/DividendHistoryBox.vue";
import SaveDividend from "@/components/my/popup/dividend/SaveDividend.vue";
import Modal from "@/components/modal/Modal.vue";
import DividendByStockBox from "@/components/my/board/dividend/DividendBoard/DividendByStockBox.vue";
import { useAppStore } from '@/store'
import { DividendsService } from '@/service/dividends'

export default {
  name: "DividendBoard",
  components: {
    Modal,
    DividendHistoryBox,
    DividendByStockBox,
    DividendIcon,
    DividendMonthlyChart,
    SaveDividend,
    DividendTimeSeries,
  },
  mounted() {},
  watch: {
    'dividendBoxType': async function() {
      this.dividends = null;
      this.dividendByItem = null;
      if(this.dividendBoxType === 'history') {
        await this.getDividends();
      } else {
        await this.getDividendsByItems();
      }
    }
  },
  created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (this.userInfo) {
      const appStore = useAppStore()
      appStore.setUserInfo(this.userInfo)
      this.accounts = this.userInfo.bankAccounts;
      this.bankAccountTab = 'all'
    } else {
      location.replace("/");
    }
    this.getDividendChartData();
    this.dividendBoxType = 'by-item';
  },
  data() {
    return {
      userInfo: null,
      dividendChartSeries: null,
      timeSeries: { labels: [], monthly: [], cumulative: [] },
      isSnowDividendRegPop: false,
      headers: [
        {title: '년도', align: 'start', key: 'name', sortable: false, width: "100px"},
        {title: '합계', align: 'end', key: 'total', sortable: false, width: "220px"},
        {title: '월평균', align: 'end', key: 'avg', sortable: false, width: "220px"},
        {title: '증감률', align: 'end', key: 'changeRate', sortable: false, width: "100px"},
        {title: '1월', align: 'end', key: 'Jan', sortable: false, width: "200px"},
        {title: '2월', align: 'end', key: 'Feb', sortable: false, width: "200px"},
        {title: '3월', align: 'end', key: 'Mar', sortable: false, width: "200px"},
        {title: '4월', align: 'end', key: 'Apr', sortable: false, width: "200px"},
        {title: '5월', align: 'end', key: 'May', sortable: false, width: "200px"},
        {title: '6월', align: 'end', key: 'Jun', sortable: false, width: "200px"},
        {title: '7월', align: 'end', key: 'Jul', sortable: false, width: "200px"},
        {title: '8월', align: 'end', key: 'Aug', sortable: false, width: "200px"},
        {title: '9월', align: 'end', key: 'Sept', sortable: false, width: "200px"},
        {title: '10월', align: 'end', key: 'Oct', sortable: false, width: "200px"},
        {title: '11월', align: 'end', key: 'Nov', sortable: false, width: "200px"},
        {title: '12월', align: 'end', key: 'Dec', sortable: false, width: "200px"},
      ],
      desserts: [],
      dividends: null,
      dividendBoxType: '',
      dividendByItem: null,
    }
  },
  methods: {
    toMonthKey(v) {
      if (!v) return ''
      const s = v.toString()
      // Expect formats like YYYY-MM-DD or YYYY.MM.DD
      const m = s.match(/\d{4}[-/.]?\d{2}/)
      return m ? m[0].replace(/[/.]/g, '-').slice(0, 7) : s.slice(0, 7)
    },
    toNumberSafe(v) {
      if (v === null || v === undefined) return 0
      if (typeof v === 'number') return Number.isFinite(v) ? v : 0
      const n = parseFloat(v.toString().replace(/[^0-9.-]/g, ''))
      return Number.isFinite(n) ? n : 0
    },
    async getDividendChartData() {
      this.desserts = [];
      let res = await DividendsService.getMonthlyChart(this.userInfo.memberId)
      this.dividendChartSeries = res.data.series;
      // Build time-series dataset (labels: yyyy.MM, monthly: amount, cumulative: running sum)
      const tryFromSeries = () => {
        const series = res?.data?.series
        if (!Array.isArray(series) || series.length === 0) return false
        const labels = []
        const monthly = []
        const cumulative = []
        let run = 0
        for (const s of series) {
          const year = (s?.name ?? s?.year ?? '').toString().match(/\d{4}/)?.[0]
          const data = Array.isArray(s?.data) ? s.data : []
          if (!year || data.length === 0) continue
          for (let i = 0; i < data.length; i++) {
            const val = this.toNumberSafe(data[i])
            const mm = String(i + 1).padStart(2, '0')
            const label = `${year}.${mm}`
            labels.push(label)
            monthly.push(val)
            run += val
            cumulative.push(run)
          }
        }
        if (labels.length === 0) return false
        this.timeSeries = { labels, monthly, cumulative }
        return true
      }
      const tryFromResponse = () => {
        const pairs = res.data.monthly || res.data.timeline
        if (!pairs || !Array.isArray(pairs) || pairs.length === 0) return false
        const labels = []
        const monthly = []
        const cumulative = []
        let run = 0
        for (const p of pairs) {
          const label = (p.date || p.label || '').toString().slice(0, 7).replace('-', '.')
          const amt = Number(p.amount ?? p.value ?? 0)
          labels.push(label)
          monthly.push(amt)
          run += amt
          cumulative.push(run)
        }
        this.timeSeries = { labels, monthly, cumulative }
        return true
      }

      if (!tryFromResponse() && !tryFromSeries()) {
        try {
          const r = await DividendsService.getMemberDividends(this.userInfo.memberId)
          const list = Array.isArray(r.data.data) ? r.data.data : []
          const map = new Map()
          for (const d of list) {
            const key = this.toMonthKey(d.date || d.payDate)
            const val = this.toNumberSafe(d.dividend ?? d.afterTaxDividend ?? d.amount)
            map.set(key, (map.get(key) || 0) + val)
          }
          const labels = Array.from(map.keys()).filter(Boolean).sort()
          const monthly = labels.map(l => map.get(l))
          const cumulative = []
          let run = 0
          for (const v of monthly) { run += v; cumulative.push(run) }
          this.timeSeries = { labels: labels.map(l => l.replace('-', '.')), monthly, cumulative }
        } catch (_) {
          this.timeSeries = { labels: [], monthly: [], cumulative: [] }
        }
      }
      for (let i = 0; i < res.data.series.length; i++) {
        let data = {
          name: res.data.series[i].name,
          total: res.data.series[i].total.toLocaleString('ko-KR').concat('원'),
          avg: res.data.series[i].avg.toLocaleString('ko-KR').concat('원'),
          changeRate: res.data.series[i].changeRate == null ? '-' : res.data.series[i].changeRate.toString().concat('%'),
          Jan: Math.ceil(res.data.series[i].data[0]).toLocaleString('ko-KR').concat('원'),
          Feb: Math.ceil(res.data.series[i].data[1]).toLocaleString('ko-KR').concat('원'),
          Mar: Math.ceil(res.data.series[i].data[2]).toLocaleString('ko-KR').concat('원'),
          Apr: Math.ceil(res.data.series[i].data[3]).toLocaleString('ko-KR').concat('원'),
          May: Math.ceil(res.data.series[i].data[4]).toLocaleString('ko-KR').concat('원'),
          Jun: Math.ceil(res.data.series[i].data[5]).toLocaleString('ko-KR').concat('원'),
          Jul: Math.ceil(res.data.series[i].data[6]).toLocaleString('ko-KR').concat('원'),
          Aug: Math.ceil(res.data.series[i].data[7]).toLocaleString('ko-KR').concat('원'),
          Sept: Math.ceil(res.data.series[i].data[8]).toLocaleString('ko-KR').concat('원'),
          Oct: Math.ceil(res.data.series[i].data[9]).toLocaleString('ko-KR').concat('원'),
          Nov: Math.ceil(res.data.series[i].data[10]).toLocaleString('ko-KR').concat('원'),
          Dec: Math.ceil(res.data.series[i].data[11]).toLocaleString('ko-KR').concat('원'),
        };
        this.desserts.push(data);
      }
    },
    async getDividends() {
      let res = await DividendsService.getMemberDividends(this.userInfo.memberId)
      this.dividends = res.data.data;
    },
    async getDividendsByItems() {
      let res = await DividendsService.getDividendsByItem(this.userInfo.memberId)
      this.dividendByItem = res.data.data;
    },
    openDividendPop() {
      this.isSnowDividendRegPop = true;
    },
    reloadDividend: async function () {
      this.isSnowDividendRegPop = false;
      await this.getDividendChartData();

      if(this.dividendBoxType === 'history') {
        await this.getDividends();
      } else {
        await this.getDividendsByItems();
      }
    },
  }
}
</script>

<style>
.dividend-year-table div table{
  width: 1700px !important;
  overflow-x: scroll;
}
.chart-title { font-weight: 700; font-size: 16px; margin: 10px 10px 6px; }
</style>