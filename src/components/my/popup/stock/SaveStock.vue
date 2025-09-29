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
        <div class="mg-t-10" v-if="!this.selectedStock">
          <SearchSelect :items="copyStocks" :placeholder="'종목명 또는 코드'" :label="(s)=>s.name + ' ('+s.symbol+')'" :key-field="'symbol'" :debounce="300" @select="selectStock" @input-change="onStockKeywordChange"/>
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
          <input type="text" inputmode="decimal" enterkeyhint="next" autocomplete="off" autocapitalize="off" required aria-label="구입 가격" class="form-control" placeholder="구입 가격" v-model="priceText">
          <p v-if="attempted && (!price || Number(price) === 0)" class="red" style="font-size: 11px; margin-top: 4px;">구입 가격을 입력해주세요.</p>
        </div>
        <div class="mg-t-10">
          <input type="text" inputmode="numeric" enterkeyhint="done" autocomplete="off" autocapitalize="off" required aria-label="수량" class="form-control" placeholder="수량" v-model="quantityText">
          <p v-if="attempted && (!quantity || Number(quantity) === 0)" class="red" style="font-size: 11px; margin-top: 4px;">수량을 입력해주세요.</p>
        </div>
        <div class="mg-t-10 btnBox t-a-c sticky-action-bottom form-compact">
          <v-btn color="primary" :loading="processing" :disabled="processing" @click="saveStock" block>등록</v-btn>
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
      attempted: false,
      userInfo: null,
      bankAccounts: null,
      copiedBankAccounts: null,
      selectedBank: null,
      national: '',
      stocks: [],
      copyStocks: [],
      selectedStock: null,
      copiedBanks: null,
      codes: [],
      selectedCode: "KOSPI",
      quantity: null,
      price: null,
      quantityText: '',
      priceText: '',
      isBankOpen: false,
      isStockOpen: false,
      bankKeyword: '',
      stockKeyword: '',
      _searchToken: 0,
    }
  },
  watch: {
    'national': async function () {},
    'selectedCode': async function () {},
    priceText(val) {
      const raw = (val || '').toString().replace(/[^0-9.]/g, '')
      const num = raw === '' ? null : Number(raw)
      this.price = Number.isFinite(num) ? num : 0
      const parts = raw.split('.')
      let formatted = ''
      if (parts[0]) formatted = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      if (parts.length > 1) formatted += '.' + parts[1]
      if (formatted !== val) this.priceText = formatted
    },
    quantityText(val) {
      const raw = (val || '').toString().replace(/[^0-9]/g, '')
      const num = raw === '' ? null : Number(raw)
      this.quantity = Number.isFinite(num) ? num : 0
      const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      if (formatted !== val) this.quantityText = formatted
    }
  },
  created: async function () {
    const { useAppStore } = await import('@/store')
    this.userInfo = useAppStore().userInfo;
    this.bankAccounts = this.userInfo.bankAccounts;
    this.copiedBankAccounts = this.bankAccounts.slice();

    if (this.userInfo.defaultBankAccountId) {
      this.selectedBank = this.copiedBankAccounts
          .filter(item => item.id == this.userInfo.defaultBankAccountId)[0];
      this.national = this.selectedBank.personalBankAccountSetting.defaultNational;
      this.selectedCode = this.selectedBank.personalBankAccountSetting.defaultCode;
    }

    this.isBankOpen = false;
    this.isStockOpen = false;
    // 초기 대용량 선로딩 제거: 입력 시 서버 검색으로만 동작
    this.stocks = []
    this.copyStocks = []
  },
  methods: {
    closeBankDropDown() {
      this.isBankOpen = false
    },
    closeStockDropDown() {
      this.isStockOpen = false
    },
    formatNumber(val) {
      if (val === null || val === undefined || val === '') return ''
      const num = Number(val)
      if (Number.isNaN(num)) return ''
      return num.toLocaleString('ko-KR')
    },
    startProcessing: function () {
      this.processing = true
    },
    endProcessing: function () {
      this.processing = false
    },
    saveStock: async function () {
      const { success, error } = useNotify()
      const { start, stop } = useLoading()
      this.attempted = true
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
        const { StocksService } = await import('@/service/stocks')
        let res = await StocksService.saveStock(param);
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
    async onStockKeywordChange(v) {
      this.stockKeyword = v
      const q = (v || '').trim()
      if (!q) {
        this.copyStocks = (this.stocks || []).slice(0, 50)
        return
      }
      const token = ++this._searchToken
      try {
        const { StocksService } = await import('@/service/stocks')
        const limit = q.length <= 1 ? 20 : 50
        const res = await StocksService.searchStocks(q, limit)
        if (token === this._searchToken) {
          this.copyStocks = res.data.stocksList || []
        }
      } catch (_) {
        const key = q.toLowerCase().replace(/\s+/g, '')
        this.copyStocks = (this.stocks || []).filter(item => (
          (item.name || '').toString().toLowerCase().replace(/\s+/g, '').includes(key) ||
          (item.symbol || '').toString().toLowerCase().replace(/\s+/g, '').includes(key) ||
          (item.code || '').toString().toLowerCase().replace(/\s+/g, '').includes(key)
        )).slice(0, 50)
      }
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
      import('@/service/stocks').then(({ StocksService }) => {
        try { StocksService.increaseSearchHit(stock.symbol) } catch(_) {}
      })
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
