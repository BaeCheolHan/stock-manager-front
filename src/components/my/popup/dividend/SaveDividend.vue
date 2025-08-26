<template>
  <div v-show="checkSpin" class="t-a-c mg-t-30">
    <v-progress-circular color="primary" indeterminate :size="128"></v-progress-circular>
  </div>
  <div class="content" v-show="!checkSpin">
    <h2>배당금 입력</h2>
    <div class="popup-wrap">
      <div class="mg-t-10" v-if="!this.selectedStock">
        <div class="searchSelect searchStockSelect">
          <input class="form-control" placeholder="종목이 나오지 않을 경우 티커를 입력" @focus="stockSelectFocus"
                 @keyup="searchStock($event)">
          <i class="ti-angle-down"></i>
        </div>
        <ul class="searchSelectBox searchStockSelectBox" @blur="closeStockDropDown" @focus="stockSelectFocus">
          <li v-for="stock in copyStocks" :key="stock" @click="selectStock(stock)">
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
    stockSelectFocus() {
      document.getElementsByClassName('searchStockSelectBox')[0].style.display = "";
    },
    selectStock(stock) {
      document.getElementsByClassName('searchStockSelectBox')[0].style.display = "none";
      this.selectedStock = stock;
    },
    cancelSelectStock() {
      this.selectedStock = null;
    },
    searchStock(event) {
      this.copyStocks = this.stocks.filter(item => {
        return item.name.toString().replace(' ', '').includes(event.target.value)
      });
      this.symbol = event.target.value;
    },
    closeStockDropDown() {
      document.getElementsByClassName('searchStockSelectBox')[0].style.display = "none";
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
        let res = await this.axios.post("/api/dividend", param);
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
