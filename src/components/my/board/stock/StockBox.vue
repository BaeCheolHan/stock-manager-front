<template>
  <div class="content" :style="UiService().isMobileFont()">
    <StockIcon class="mg-b-10" @click="showRegStockPop"/>
    <div v-if="stocks">
      <v-card class="mg-b-5 hover-card" v-for="stock in stocks" :key="stock.id" @click="showStockDetail(stock)">
        <v-card-text>
          <div>
            <div class="flex bold mg-b-10" style="justify-content: left; align-items: center;">
              <img
                  :src="'https://financialmodelingprep.com/image-stock/'.concat(stock.national === 'KR' ? stock.symbol.concat('.KS') : stock.symbol).concat('.png')"
                  :style="UiService().isMobile() ? 'max-width: 40px; max-height: 30px;': 'max-width: 50px;: max-height: 40px;'"
                  style="border: 1px solid white; border-radius: 5px;"
                  class="mg-r-5"
                  loading="lazy" decoding="async"
                  @error="UiService().replaceStockImg($event)"
              >
              <p style="overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 40%;
                        word-break: break-all;">{{ stock.name }}</p>
              <p>({{ stock.symbol }} <span :class="UiService().setUpDownArrowClass(stock.compareToYesterdaySign)"
                                                            :style="UiService().setColorStyle(stock.compareToYesterdaySign)">
                {{ Math.floor(((stock.compareToYesterday / stock.nowPrice) * 100) * 100) / 100 }}%</span>)</p>
            </div>
            <div class="flex" style="justify-content: space-between; font-size: 12px;">
              <div class="w-50">
                <div>
                  <span>{{ stock.quantity.toLocaleString('ko-KR') }}주</span>
                  <span class="mg-l-5" :style="setPriceColor(stock)">(평단 {{ stock.national != 'KR' ? '$' : '' }}</span>
                  <span v-if="stock.national == 'KR'"
                        :style="setPriceColor(stock)">{{
                      Math.floor(Number(stock.avgPrice)).toLocaleString('ko-KR')
                    }}</span>
                  <span v-else
                        :style="setPriceColor(stock)">{{
                      (Math.floor(Number(stock.avgPrice) * 100) / 100).toLocaleString('ko-KR')
                    }}</span>
                  <span :style="setPriceColor(stock)">{{ stock.national == 'KR' ? '원' : '' }})</span>
                </div>
                <p>투자비중</p>
                <p class="bold">수익률</p>
                <p>총 수령 배당금</p>
                <p class="bold">단순 수익 계산</p>
              </div>
              <div class="t-a-r w-55">
                <div class="flex" style="justify-content: right">
                  <span>현재가 : </span>
                  <span :style="UiService().setColorStyle(stock.compareToYesterdaySign)"></span>
                  <span :style="UiService().setColorStyle(stock.compareToYesterdaySign)">{{
                      stock.nowPrice.toLocaleString()
                    }}</span>
                  <div v-if="stock.compareToYesterdaySign != 3">
                    <span :style="UiService().setColorStyle(stock.compareToYesterdaySign)">(</span>
                    <span :style="UiService().setColorStyle(stock.compareToYesterdaySign)"
                          :class="UiService().setUpDownArrowClass(stock.compareToYesterdaySign)"> {{
                        stock.compareToYesterday.toLocaleString("ko-KR")
                      }}</span>
                    <span :style="UiService().setColorStyle(stock.compareToYesterdaySign)">)</span>
                  </div>
                </div>
                <p>
                  {{ stock.priceImportance }}%
                </p>
                <p :style="setRateOfReturnPerColor(stock)" class="bold">
                  {{
                    (Number(stock.quantity) * Number(stock.nowPrice) - (Number(stock.quantity) * Number(stock.avgPrice)))
                        .toLocaleString('ko-KR')
                  }} ({{ Number(stock.rateOfReturnPer).toFixed(2).toLocaleString('ko-KR') }}%)
                </p>
                <p class="red" v-if="stock.national === 'KR'">{{ stock.totalDividend.toLocaleString('ko-KR') }}원</p>
                <p v-else class="red">${{ stock.totalDividend.toLocaleString('ko-KR') }}</p>
                <p v-if="stock.national === 'KR'" :style="setTotalPriceColor(stock)" class="bold">
                  {{
                    (Number(stock.totalDividend) + (Number(stock.quantity) * Number(stock.nowPrice) - (Number(stock.quantity) * Number(stock.avgPrice)))).toLocaleString('ko-KR')
                  }}원
                </p>
                <p v-else :style="setTotalPriceColor(stock)" class="bold">
                  ${{
                    (Number(stock.totalDividend) + (Number(stock.quantity) * Number(stock.nowPrice) - (Number(stock.quantity) * Number(stock.avgPrice)))).toLocaleString('ko-KR')
                  }}
                </p>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
    <v-card>
      <v-card-actions>
        <v-btn color="deep-purple-lighten-2" variant="text" @click="showRegStockPop" width="100%"
               style="text-align: center">
          + 보유 주식을 등록해주세요.
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
  <Modal v-if="isShowRegStockPop" @close-modal="isShowRegStockPop = false">
    <SaveStock msg="" @saved="onSaved"/>
  </Modal>
  <Modal v-if="isShowStockDetailPop" @close-modal="isShowStockDetailPop = false">
    <MyDetailStock msg="" :stock="selectedStock" @deleted="onDeleted"/>
  </Modal>
</template>


<script>

import Modal from "@/components/modal/Modal.vue";
import SaveStock from "@/components/my/popup/stock/SaveStock.vue";
import MyDetailStock from "@/components/my/popup/stock/MyDetailStock.vue";
import StockIcon from "@/components/etc/button/StockIcon.vue";
import UiService from "@/service/UiService";


export default {
  name: "StockBox",
  components: {
    Modal,
    SaveStock,
    MyDetailStock,
    StockIcon
  },
  props: {
    stocks: Array,
  },
  data() {
    return {
      isShowRegStockPop: false,
      isShowStockDetailPop: false,
      stockName: '',
      selectedStock: null,
    }
  },
  watch: {},
  methods: {
    UiService() {
      return UiService;
    },
    showRegStockPop() {
      this.isShowRegStockPop = true;
    },
    async onSaved() {
      this.isShowRegStockPop = false;
      if (this.$parent && typeof this.$parent.reloadStock === 'function') {
        await this.$parent.reloadStock();
      }
    },
    setPriceColor(stock) {
      return Number(stock.avgPrice) > Number(stock.nowPrice) ? 'color: blue' : 'color: red'
    },
    setTotalPriceColor(stock) {
      return (Number(stock.totalDividend) + (Number(stock.quantity) * Number(stock.nowPrice) - (Number(stock.quantity) * Number(stock.avgPrice)))) > 0 ? 'color: red' : 'color: blue'
    },
    setRateOfReturnPerColor(stock) {
      return Number(stock.rateOfReturnPer) > 0 ? 'color: red' : 'color: blue'
    },
    showStockDetail(stock) {
      this.selectedStock = stock
      this.isShowStockDetailPop = true
    },
    async onDeleted() {
      this.isShowStockDetailPop = false
      if (this.$parent && typeof this.$parent.reloadStock === 'function') {
        await this.$parent.reloadStock();
      }
    },
  }
};
</script>
