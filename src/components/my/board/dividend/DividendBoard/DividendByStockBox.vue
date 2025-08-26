<template>
  <div class="content">
    <v-card class="mg-b-5" v-for="dividend in dividends" :key="dividend.id" @click="openDividendByStockDetailPop(dividend)">
      <v-card-text>
        <div class="flex" style="justify-content: space-between">
          <div class="flex bold mg-b-10" style="justify-content: left; align-items: center; max-width: 60%;">
            <img
                :src="'https://financialmodelingprep.com/image-stock/'.concat(dividend.national === 'KR' ? dividend.symbol.concat('.KS') : dividend.symbol).concat('.png')"
                :style="UiService().isMobile() ? 'max-width: 40px; max-height: 30px;': 'max-width: 50px;: max-height: 40px;'"
                style="border: 1px solid white; border-radius: 5px;"
                class="mg-r-5"
                @error="UiService().replaceStockImg($event)"
            >
            <p style="overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 70%;
                        word-break: break-all;">{{ dividend.name }}</p>
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
    <DividendByStockDetailPop msg="" :stock="selectedStock"/>
  </Modal>
</template>


<script>

import Modal from "@/components/modal/Modal.vue";
import DividendByStockDetailPop from "@/components/my/popup/dividend/DividendByStockDetailPop.vue";
import UiService from "@/service/UiService";

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
  methods: {
    UiService() {
      return UiService
    },
    openDividendByStockDetailPop(dividend) {
      this.selectedStock = dividend;
      this.isShowDividendByStockDetailPop = true;
    }
  }
}
</script>
