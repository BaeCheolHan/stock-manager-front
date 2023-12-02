<template>
  <StockTreemapChart v-if="chartTab === 'stock'"/>
  <DividendMonthlyChart v-if="chartTab === 'dividend'"/>
  <AssetChart v-if="chartTab === 'asset'"/>
</template>
<script>
import StockTreemapChart from "@/components/my/chart/StockTreemapChart.vue";
import DividendMonthlyChart from "@/components/my/chart/DividendMonthlyChart.vue";
import AssetChart from "@/components/my/chart/AssetChart.vue";

export default {
  name: "UpperChart",
  components: {
    StockTreemapChart,
    DividendMonthlyChart,
    AssetChart
  },
  mounted() {
    this.emitter.on('updateChart', (chartTab) => {
      alert(chartTab)
      // this.updateChart(chartTab)
    })
  },
  created() {
  },
  data() {
    return {
      chartTab: 'stock',
    }
  },
  methods: {
    updateChart(chartTab) {
      this.chartTab = chartTab;
    }
  }
}
</script>