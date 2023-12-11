<template>
  <div class="content">
    <h2>종목 검색</h2>
    <div class="popup-wrap">
      <div class="col-1 mg-t-10">
        <div class="flex">
          <select required class="form-control mg-r-5" v-model="national">
            <option value="KR" selected>국내</option>
            <option value="US">미국</option>
            <option value="JP">일본</option>
            <option value="CN">중국</option>
            <option value="HK">홍콩</option>
            <option value="VN">베트남</option>
          </select>

          <select required class="form-control" v-model="selectedCode">
            <option v-for="code in codes" :key="code" :value="code">{{ code }}</option>
          </select>
        </div>
        <div class="mg-t-10" v-if="!this.selectedStock">
          <div class="searchSelect searchStockSelect">
            <input class="form-control" placeholder="종목명" @focus="stockSelectFocus"
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
                <span style="vertical-align: middle;">
                  {{ selectedStock.name }} ({{ selectedStock.code }})
                </span>
            </li>
          </div>
        </div>
        <div class="mg-t-10 btnBox t-a-c">
          <button type="button" :disabled="this.processing" @click="search">조회</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SearchStock',
  data() {
    return {
      national: '',
      stocks: null,
      copyStocks: null,
      selectedStock: null,
      codes: [],
      selectedCode: "KOSPI",
      processing: false,
    }
  },
  watch: {
    'national': async function () {
      this.closeStockDropDown();
      let res = await this.axios.get("/api/stocks/code/".concat(this.national));
      this.codes = res.data.codes;
    },
    'selectedCode': async function () {
      let res = await this.axios.get("/api/stocks/".concat(this.selectedCode));
      this.stocks = res.data.stocksList;
      this.copyStocks = this.stocks.slice();
    }
  },
  async created() {
    this.national = 'KR';
    let res = await this.axios.get("/api/stocks/".concat(this.selectedCode))
    this.stocks = res.data.stocksList;
    this.copyStocks = this.stocks.slice();
  },
  methods: {
    searchStock(event) {
      this.copyStocks = this.stocks.filter(item => {
        return (item.name.toString().toLowerCase().replace(' ', '').includes(event.target.value.toLowerCase().replace(' ', '')) ||
            item.symbol.toString().toLowerCase().replace(' ', '').includes(event.target.value.toLowerCase().replace(' ', '')))
      });
    },
    stockSelectFocus() {
      document.getElementsByClassName('searchStockSelectBox')[0].style.display = "";
    },
    closeStockDropDown() {
      document.getElementsByClassName('searchStockSelectBox')[0].style.display = "none";
    },
    selectStock(stock) {
      document.getElementsByClassName('searchStockSelectBox')[0].style.display = "none";
      this.selectedStock = stock;
    },
    cancelSelectStock() {
      this.selectedStock = null;
    },
    search() {
      this.startProcessing();
      this.emitter.emit('searchStock', this.selectedStock)
      this.endProcessing();
    },
    startProcessing: function () {
      this.processing = true
    },
    endProcessing: function () {
      this.processing = false
    },
  }

}
</script>