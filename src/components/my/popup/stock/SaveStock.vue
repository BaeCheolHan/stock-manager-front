<template>
  <div v-show="checkSpin" class="t-a-c mg-t-30">
    <v-progress-circular color="primary" indeterminate :size="128"></v-progress-circular>
  </div>
  <div class="content" v-show="!checkSpin">
    <h2>주식 등록</h2>
    <div class="popup-wrap">

      <div class="mg-t-10" v-if="!this.selectedBank">
        <div class="searchSelect searchBankSelect">
          <input class="form-control" placeholder="계좌 별칭" @focus="isBankOpen = true" v-model="bankKeyword" @input="searchBank">
          <i class="ti-angle-down" @click="isBankOpen = !isBankOpen"></i>
        </div>
        <ul class="searchSelectBox" v-show="isBankOpen">
          <li v-for="bank in copiedBankAccounts" :key="bank.id" @click="selectBank(bank)">
            <img class="bank-icon" :src="'./bank-icons/'.concat(bank.bankInfo.bankCode).concat('.jpg')"
                 @error="replaceBankDefaultImg">
            <span>{{ bank.alias }}</span>
          </li>
        </ul>
      </div>
      <div v-else class="mg-t-10">
        <div class="selected-bank-wrap" @click="cancelSelectBank">
          <li>
            <img class="bank-icon"
                 :src="'./bank-icons/'.concat(selectedBank.bankInfo.bankCode).concat('.jpg')"
                 @error="replaceBankDefaultImg">
            <span style="vertical-align: middle;">{{ selectedBank.alias }}</span>
          </li>
        </div>
      </div>

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
          <SearchSelect :items="copyStocks" :placeholder="'종목명'" :label="(s)=>s.name + ' ('+s.symbol+')'" :key-field="'symbol'" @select="selectStock" @input-change="onStockKeywordChange"/>
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
        <div class="mg-t-10">
          <input type="number" class="form-control" placeholder="구입 가격" v-model="price">
        </div>
        <div class="mg-t-10">
          <input type="number" class="form-control" placeholder="수량" v-model="quantity">
        </div>
        <div class="mg-t-10 btnBox t-a-c sticky-action-bottom">
          <button type="button" :disabled="this.processing" @click="saveStock">등록</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useNotify } from '@/composables/useNotify'
import { useLoading } from '@/composables/useLoading'
import SearchSelect from '@/components/etc/SearchSelect.vue'
export default {
  name: "SaveStock",
  props: {
    msg: String,
  },
  components: { SearchSelect },
  data: function () {
    return {
      checkSpin:false,
      processing: false,
      userInfo: null,
      bankAccounts: null,
      copiedBankAccounts: null,
      selectedBank: null,
      national: '',
      stocks: null,
      copyStocks: null,
      selectedStock: null,
      copiedBanks: null,
      codes: [],
      selectedCode: "KOSPI",
      quantity: null,
      price: null,
      isBankOpen: false,
      bankKeyword: '',
      stockKeyword: '',
    }
  },
  watch: {
    'national': async function () {
      this.closeStockDropDown();
      let res = await this.axios.get("/api/stocks/code/".concat(this.national));
      this.codes = res.data.codes;
    },
    'selectedCode': async function () {
      let res = await this.axios.get("/api/stocks/".concat(this.selectedCode))
      this.stocks = res.data.stocksList;
      this.copyStocks = this.stocks.slice();
    }
  },
  created: async function () {
    this.userInfo = await JSON.parse(sessionStorage.getItem('userInfo'));
    this.bankAccounts = this.userInfo.bankAccounts;
    this.copiedBankAccounts = this.bankAccounts.slice();

    if (this.userInfo.defaultBankAccountId) {
      this.selectedBank = this.copiedBankAccounts
          .filter(item => item.id == this.userInfo.defaultBankAccountId)[0];
      this.national = this.selectedBank.personalBankAccountSetting.defaultNational;
      this.selectedCode = this.selectedBank.personalBankAccountSetting.defaultCode;
    }

    this.closeBankDropDown();
    this.closeStockDropDown();
    let res = await this.axios.get("/api/stocks/".concat(this.selectedCode))
    this.stocks = res.data.stocksList;
    this.copyStocks = this.stocks.slice();
  },
  methods: {
    startProcessing: function () {
      this.processing = true
    },
    endProcessing: function () {
      this.processing = false
    },
    saveStock: async function () {
      const { success, error } = useNotify()
      const { start, stop } = useLoading()
      if (!this.selectedBank) {
        error("계좌를 선택해주세요")
        return;
      }

      if (!this.selectedStock) {
        error("종목을 선택해주세요")
        return;
      }

      if (!this.price || this.price === 0) {
        error("구입 가격을 입력해주세요")
        return;
      }

      if (!this.quantity || this.quantity === 0) {
        error("수량을 입력해주세요")
        return;
      }

      let param = {
        bankId: this.selectedBank.id,
        symbol: this.selectedStock.symbol,
        quantity: this.quantity,
        price: this.price
      }
      this.checkSpin = true;
      this.startProcessing();
      start('주식 등록 중...')
      try {
        let res = await this.axios.post('/api/stock', param);
        if (res.data.code === 'SUCCESS') {
          success('등록되었습니다.')
          this.$emit('saved')
        } else if (res.data.message) {
          error(res.data.message)
        }
      } catch (e) {
        error('등록 중 오류가 발생했습니다.')
      } finally {
        stop()
        this.endProcessing();
        this.checkSpin = false;
      }
    },
    searchBank: function () {
      const v = (this.bankKeyword || '').replace(' ', '')
      this.copiedBankAccounts = this.bankAccounts.filter(item => item.alias.replace(' ', '').includes(v))
    },
    onStockKeywordChange(v) {
      this.stockKeyword = v
      const q = (v || '').toLowerCase().replace(' ', '')
      this.copyStocks = this.stocks.filter(item => (
          item.name.toString().toLowerCase().replace(' ', '').includes(q) ||
          item.symbol.toString().toLowerCase().replace(' ', '').includes(q)
      ));
    },
    replaceBankDefaultImg(e) {
      e.target.src = './bank-icons/default-bank.png';
    },
    selectBank: function (bank) {
      this.isBankOpen = false;
      this.selectedBank = bank;
      this.national = this.selectedBank.personalBankAccountSetting.defaultNational;
      this.selectedCode = this.selectedBank.personalBankAccountSetting.defaultCode;
    },
    selectStock: function (stock) {
      this.isStockOpen = false;
      this.selectedStock = stock;
    },
    cancelSelectBank: function () {
      this.selectedBank = null;
    },
    cancelSelectStock: function () {
      this.selectedStock = null;
    },
  }
};
</script>
