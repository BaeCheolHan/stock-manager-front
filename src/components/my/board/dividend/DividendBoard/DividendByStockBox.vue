<template>
  <div class="content">
    <v-card class="mg-b-5" v-for="dividend in dividends" :key="dividend.id">
      <v-card-text>
        <div class="flex" style="justify-content: space-between">
          <div>
            <p style=" font-size: 12px;"> {{ dividend.name }}({{ dividend.symbol }})</p>
            <p>총 수령 배당금</p>
          </div>
          <div style="text-align: right">
            <p style=" font-size: 12px;">{{ dividend.code }}({{ dividend.national }})</p>
            <p>{{Math.floor(dividend.totalKrDividend).toLocaleString('ko-KR')}} 원<span v-if="dividend.national !== 'KR'">(${{dividend.totalOverSeaDividend}})</span></p>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>


<script>

export default {
  name: "DividendByStockBox",
  components: {},
  props: {
    dividends: Array,
  },
}
</script>
