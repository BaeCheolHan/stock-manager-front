<template>
  <DividendMonthlyChart :chart-data="dividendChartSeries" v-if="dividendChartSeries"/>

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
          <DividendHistoryBox :dividends="dividends" v-if="dividends" @reload="reloadDividend"/>
          <div v-else class="mg-t-10">
            <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line"/>
          </div>
          <DividendByStockBox :dividends="dividendByItem" v-if="dividendByItem"/>
          <div v-else class="mg-t-10">
            <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line"/>
          </div>
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
    async getDividendChartData() {
      this.desserts = [];
      let res = await DividendsService.getMonthlyChart(this.userInfo.memberId)
      this.dividendChartSeries = res.data.series;
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
</style>