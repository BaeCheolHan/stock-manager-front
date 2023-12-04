<template>
  <div class="content">
    <v-card class="mg-b-5" v-for="dividend in dividends" :key="dividend.id" @click="openDividendByStockDetailPop(dividend)">
      <v-card-text>
        <div class="flex" style="justify-content: space-between">
          <div>
            <p style="font-size: 12px;"> {{ dividend.name }}({{ dividend.symbol }})</p>
            <p style="font-size: 12px;">총 수령 배당금</p>
          </div>
          <div style="text-align: right">
            <p style="font-size: 12px;">{{ dividend.code }}({{ dividend.national }})</p>
            <p style="font-size: 12px;">{{Math.floor(dividend.totalKrDividend).toLocaleString('ko-KR')}} 원<span v-if="dividend.national !== 'KR'">(${{dividend.totalOverSeaDividend}})</span></p>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>

  <Modal v-if="isShowDividendByStockDetailPop" @close-modal="isShowDividendByStockDetailPop = false">
    <DividendByStockDetailPop msg=""/>
  </Modal>
</template>


<script>

import Modal from "@/components/modal/Modal.vue";
import DividendByStockDetailPop from "@/components/my/popup/dividend/DividendByStockDetailPop.vue";

export default {
  name: "DividendByStockBox",
  components: {
    DividendByStockDetailPop, Modal,
  },
  props: {
    dividends: Array,
  },
  data() {
    return {
      userInfo: null,
      isShowDividendByStockDetailPop: false,
      selectedStock: null,
    }
  },
  created() {

  },
  methods: {
    openDividendByStockDetailPop(dividend) {
      this.selectedStock = dividend;
      this.isShowDividendByStockDetailPop = true;
    }
  }
}
</script>
