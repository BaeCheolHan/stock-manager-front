<template>
  <div v-show="checkSpin" class="t-a-c mg-t-30">
    <v-progress-circular color="primary" indeterminate :size="128"></v-progress-circular>
  </div>
  <div class="content" v-show="!checkSpin">
    <h2>배당금 입력</h2>
    <div class="popup-wrap">
      <div class="mg-t-10" v-if="!this.selectedStock">
        <div class="searchSelect searchStockSelect">
          <input class="form-control" placeholder="종목이 나오지 않을 경우 티커를 입력" @focus="isDropdownOpen = true"
                 v-model="keyword" @input="searchStock">
          <i class="ti-angle-down" @click="isDropdownOpen = !isDropdownOpen"></i>
        </div>
        <ul class="searchSelectBox" v-show="isDropdownOpen">
          <li v-for="stock in copyStocks" :key="stock.symbol" @click="selectStock(stock)">
            <span>{{ stock.name }} ({{ stock.symbol }})</span>
          </li>
        </ul>
      </div>
      <div v-else class="mg-t-10">
        <div class="selected-bank-wrap" @click="cancelSelectStock">
          <li>
            <span style="vertical-align: middle;">{{ selectedStock.name }} ({{ selectedStock.code }})</span>
          </li>
        </div>
      </div>
      <div class="datepicker mg-t-10">
        <div class="calendar">
          <Datepicker v-model="date" autoApply :locale="locale" :enableTimePicker="false" format="yyyy-MM-dd"
                      :clearable="false" placeholder="배당 지급일" hideInputIcon/>
        </div>
      </div>
      <div class="mg-t-10">
        <input type="number" class="form-control" placeholder="배당금" v-model="dividend">
      </div>
      <div class="mg-t-10 btnBox t-a-c">
        <button type="button" :disabled="this.processing" @click="saveDividend">등록</button>
      </div>
    </div>
  </div>
</template>

<script>

import {reactive} from 'vue';

import '@vuepic/vue-datepicker/dist/main.css'
import Datepicker from '@vuepic/vue-datepicker';
import {ko} from 'date-fns/locale'

export default {
  name: "SaveDividend",
  props: {
    msg: String,
  },
  components: {
    Datepicker
  },
  setup() {
    const locale = reactive(ko);
    return {locale}
  },
  data() {
    return {
      checkSpin: false,
      processing: false,
      userInfo: null,
      stocks: null,
      selectedStock: null,
      copyStocks: null,
      dividend: null,
      date: null,
      symbol: null,
      isDropdownOpen: false,
      keyword: '',
    }
  },
  watch: {},
  async created() {

    this.userInfo = await JSON.parse(sessionStorage.getItem('userInfo'));
    let res = await this.axios.get('/api/stock/'.concat(this.userInfo.memberId));
    this.stocks = res.data.stocks;
    this.copyStocks = this.stocks.slice();
    this.closeStockDropDown();
  },
  methods: {
    startProcessing() {
      this.processing = true
    },
    endProcessing() {
      this.processing = false
    },
    selectStock(stock) {
      this.isDropdownOpen = false;
      this.selectedStock = stock;
    },
    cancelSelectStock() {
      this.selectedStock = null;
    },
    searchStock() {
      const v = (this.keyword || '').toString().toLowerCase().replace(' ', '')
      this.copyStocks = this.stocks.filter(item => item.name.toString().toLowerCase().replace(' ', '').includes(v))
      this.symbol = this.keyword
    },
    async saveDividend() {
      if (!this.selectedStock) {
        if (!this.symbol) {
          alert("종목을 선택해주세요.")
          return;
        }
      } else {
        this.symbol = this.selectedStock.symbol
      }

      if (!this.date) {
        alert("날짜를 선택해주세요.")
      }

      if (!this.dividend) {
        alert("배당금을 입력해주세요.")
        return;
      }

      this.startProcessing();
      this.checkSpin = true;

      let param = {
        memberId: JSON.parse(sessionStorage.getItem('userInfo')).memberId,
        symbol: this.symbol,
        date: this.date,
        dividend: this.dividend
      }

      try {
        const { DividendsService } = await import('@/service/dividends')
        let res = await DividendsService.saveDividend(param)
        this.checkSpin = false;
        if (res.data.code === 'SUCCESS') {
          alert("등록 되었습니다.");
          this.endProcessing();
          this.$emit('saved')
        } else {
          alert(res.data.message);
          this.endProcessing();
        }

      } catch (e) {
        console.log(e)

      }
    },
  }
};
</script>
