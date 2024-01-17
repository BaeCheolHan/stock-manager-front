<template>

  <div>
    <v-data-table-virtual :headers="getTableHeader()" :items="tableData" class="elevation-1 mg-t-10"
                              :class="{'mobile-asset-history-table' : UiService().isMobile() == true, 'asset-history-table' : UiService().isMobile() == false} "
                          item-value="date" v-if="tableData" style="font-size: 12px;"/>
  </div>
</template>
<script>
import UiService from "@/service/UiService";

export default {
  name: 'AssetBox',
  props: {
    tableData: Array
  },
  data() {
    return {
      mobileHeaders: [
        {title: '날짜', align: 'center', key: 'date', width: '90px'},
        {title: '투자 금액', align: 'center', key: 'investmentAmount', width: '150px'},
        {title: '평가 금액', align: 'center', key: 'evaluationAmount', width: '150px'},
        {title: '평가 손익', align: 'center', key: 'diff', width: '150px'},
      ],
      defaultHeaders: [
        {title: '날짜', align: 'center', key: 'date'},
        {title: '투자 금액', align: 'center', key: 'investmentAmount'},
        {title: '평가 금액', align: 'center', key: 'evaluationAmount'},
        {title: '평가 손익', align: 'center', key: 'diff'},
      ]
    }
  },
  methods: {
    UiService() {
      return UiService
    },
    getTableHeader() {
      return this.UiService().isMobile() ? this.mobileHeaders : this.defaultHeaders;
    }
  }

}
</script>

<style>
.mobile-asset-history-table div table {
  width: 600px !important;
  margin: 0 auto; text-align:center;
  overflow-x: scroll;
}

.asset-history-table div table {
  width: 100% !important;
  margin: 0 auto; text-align:center;
  overflow-x: scroll;
}
</style>