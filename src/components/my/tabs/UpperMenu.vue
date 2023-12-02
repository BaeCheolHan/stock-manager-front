<template>
  <v-tabs v-model="chartTab" color="#e00000" align-tabs="end">
    <v-tab :value="'stock'">
      <img class="bank-icon mg-r-5" :src="'./icons/collectibles.png'" alt="bank-icon">
      투자 비중
    </v-tab>
    <v-tab :value="'dividend'">
      <img class="bank-icon mg-r-5" :src="'/icons/dividend-icon.png'" alt="bank-icon">
      배당 현황
    </v-tab>
    <v-tab :value="'asset'">
      <img class="bank-icon mg-r-5" :src="'/icons/icons8-line-chart-64.png'" alt="bank-icon">
      자산 현황
    </v-tab>
  </v-tabs>
</template>

<script>
export default {
  name: "UpperMenu",
  data() {
    return {
      chartTab: "stock",
    }
  },
  mounted() {

  },
  watch: {
    'chartTab': function () {
      this.emitter.emit('updateChart', this.chartTab)
    }
  },
  methods: {
  }
}
</script>