<template>
  <div class="flex" style="align-items: center">
    <img
        :src="'https://financialmodelingprep.com/image-stock/'.concat(UiService().getStockLogo($parent.$parent.selectedStock)).concat('.png')"
        :style="UiService().isMobile() ? 'max-width: 40px; max-height: 30px;': 'max-width: 50px;: max-height: 40px;'"
        style="border: 1px solid white; border-radius: 5px;"
        class="mg-r-5"
        @error="UiService().replaceStockImg($event)"
    >
    <h2>{{ $parent.$parent.selectedStock.name }}({{ $parent.$parent.selectedStock.symbol }})</h2>
  </div>
  <div>
    <h2>배당 수령 내역</h2>
  </div>
  <div>
    <apexchart height="350" type="bar" :options="chartOptions" :series="series" />
  </div>

  <v-card class="mg-b-5" v-for="dividend in dividends" :key="dividend.id">
    <v-card-text>
      <div>
        <div style=" font-size: 12px;">
          <div>
            <div class="flex mg-b-5" style="justify-content: space-between">
              <p class="mg-r-10">{{dividend.year}}년 {{dividend.month}}월 {{dividend.day}}일</p>
              <i class="ti-trash" @click="removeHistory(dividend.id)"></i>
            </div>
            <div class="flex" style="justify-content: space-between">
              <div>
                <p style="width: 200px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        word-break: break-all;
                            ">{{ $parent.$parent.selectedStock.name }}({{ dividend.symbol }})</p>
              </div>
              <div>
                <p class="t-a-r">{{$parent.$parent.selectedStock.national !== 'KR' ? '$' : ''}}{{ dividend.dividend.toLocaleString('ko-KR')}} {{$parent.$parent.selectedStock.national == 'KR' ? '원' : ''}}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
<script>
import UiService from "@/service/UiService";

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
      }],
      dividends: [],
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
        this.dividends = res.data.data;
      } else {
        location.replace("/");
      }
    },
    async removeHistory(id) {
      if(confirm('삭제 하시겠습니까?')) {
        await this.axios.delete('/api/dividend/'.concat(id));
        this.emitter.emit('reloadDividend');
        await this.init();
      }
    }
  }

}
</script>