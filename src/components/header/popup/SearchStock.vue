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
          <SearchSelect :key="national + '-' + selectedCode" :items="copyStocks" :placeholder="'종목명'" :label="(s)=>s.name + ' ('+s.symbol+')'" :key-field="'symbol'" @select="selectStock" @input-change="onKeyword"/>
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
import { defineAsyncComponent } from 'vue'
export default {
  name: 'SearchStock',
  components: { SearchSelect: defineAsyncComponent(() => import('@/components/etc/SearchSelect.vue')) },
  data() {
    return {
      national: '',
      stocks: null,
      copyStocks: null,
      selectedStock: null,
      codes: [],
      selectedCode: "KOSPI",
      processing: false,
      searchKeyword: '',
    }
  },
  watch: {
    'national': async function () {
      // reset selection on national change
      this.selectedStock = null
      this.searchKeyword = ''
      const { StocksService } = await import('@/service/stocks')
      let res = await StocksService.getCodesByNational(this.national)
      this.codes = res.data.codes || [];
      if (!this.codes.includes(this.selectedCode)) {
        this.selectedCode = this.codes[0] || ''
      }
    },
    'selectedCode': async function () {
      if (!this.selectedCode) {
        this.stocks = [];
        this.copyStocks = [];
        return;
      }
      const { StocksService } = await import('@/service/stocks')
      let res = await StocksService.getStocksByCode(this.selectedCode)
      this.stocks = res.data.stocksList || [];
      this.copyStocks = this.stocks.slice();
    }
  },
  async created() {
    this.national = 'KR';
    // 초기 코드 목록 로드 후 기본 코드 설정
    const { StocksService } = await import('@/service/stocks')
    let codeRes = await StocksService.getCodesByNational(this.national)
    this.codes = codeRes.data.codes || [];
    if (!this.codes.includes(this.selectedCode)) {
      this.selectedCode = this.codes[0] || ''
    }
    // 선택된 코드 기준 종목 로드
    if (this.selectedCode) {
      let res = await StocksService.getStocksByCode(this.selectedCode)
      this.stocks = res.data.stocksList || [];
      this.copyStocks = this.stocks.slice();
    } else {
      this.stocks = [];
      this.copyStocks = [];
    }
  },
  methods: {
    onKeyword(v) {
      this.searchKeyword = v
      const keyword = (v || '').toLowerCase().replace(' ', '');
      this.copyStocks = this.stocks.filter(item => (item.name.toString().toLowerCase().replace(' ', '').includes(keyword) || item.symbol.toString().toLowerCase().replace(' ', '').includes(keyword)));
    },
    selectStock(stock) {
      this.isDropdownOpen = false;
      this.selectedStock = stock;
    },
    cancelSelectStock() {
      this.selectedStock = null;
    },
    search() {
      this.startProcessing();
      this.$emit('search', this.selectedStock)
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