<template>
  <div style=" max-width: 90%; margin: 0 auto;">
    <h3>국내 거래량 순위</h3>
    <v-skeleton-loader v-if="!data" type="list-item-two-line, list-item-two-line, list-item-two-line" class="mg-t-10"/>
    <v-card v-else class="mg-b-5 mg-t-10" v-for="stock in data" :key="stock.data_rank" @click="showStockDetail(stock)">
      <v-card-text>
        <div>
          <div class="flex text-xs-mobile">
            <div>
              <div class="flex" style="justify-content: left;">
                <span class="bold">{{ stock.data_rank }}. </span>
                <span class="bold">{{ stock.hts_kor_isnm }}</span>
                <div :class="[UiService().setColorClass(stock.prdy_vrss_sign)]">
                  <span class="mg-l-5">
                    (<span :class="UiService().setUpDownArrowClass(stock.prdy_vrss_sign)"></span>{{
                      Number(stock.prdy_ctrt).toLocaleString('ko-KR')
                    }}%)
                  </span>
                </div>
              </div>
              <div class="flex">
                <div>
                  <span class="bold">현재가 : </span>
                  <span :style="UiService().setColorStyle(stock.prdy_vrss_sign)">{{
                      Number(stock.stck_prpr).toLocaleString('ko-KR')
                    }} 원</span>
                </div>
                <div>
                  <span class="mg-l-20 bold">전일 대비 : </span>
                  <span :class="[UiService().setColorClass(stock.prdy_vrss_sign)]">
                    <span :class="UiService().setUpDownArrowClass(stock.prdy_vrss_sign)"></span>
                    {{ Number(stock.prdy_vrss).toLocaleString('ko-KR') }} 원
                </span>
                </div>
              </div>
              <div>
                <span class="bold">거래량 : {{ Number(stock.acml_vol).toLocaleString('ko-KR') }}</span>
                <span class="mg-l-5">({{ stock.vol_inrt }} %)</span>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
  <Modal v-if="isShowStockDetailPop" @close-modal="isShowStockDetailPop = false">
    <DetailStock :stock="selectedStock" msg=""/>
  </Modal>
</template>

<script>

import DetailStock from "@/components/index/popup/DetailStock";
import Modal from "@/components/modal/Modal.vue";
import UiService from "@/service/UiService";

export default {
  name: "KrVolumeRankBox",
  components: {
    Modal,
    DetailStock
  },
  data() {
    return {
      data: null,
      selectedStock: null,
      isShowStockDetailPop: false,
    }
  },
  async created() {
    const { StocksService } = await import('@/service/stocks')
    let res = await StocksService.getKrVolumeRank()
    this.data = res.data.data;
  },
  methods: {
    UiService() {
      return UiService
    },
    showStockDetail(stock) {
      this.selectedStock = stock;
      this.isShowStockDetailPop = true
    }
  }
};
</script>
