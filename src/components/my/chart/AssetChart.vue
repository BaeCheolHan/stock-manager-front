<template>
  <div>
    <Suspense>
      <template #default>
        <LazyApex type="area" height="350" :options="chartOptions" :series="chartData"/>
      </template>
      <template #fallback>
        <v-skeleton-loader type="image"/>
      </template>
    </Suspense>
  </div>
</template>


<script>

import { defineAsyncComponent } from 'vue'

export default {
  name: "AssetChart",
  components: { LazyApex: defineAsyncComponent(() => import('vue3-apexcharts')) },
  props: {
    chartData: {
      type: Array,
      required: true
    },
    chartOptions: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {}
  },
  created() {
  },
  methods: {}
}
;
</script>
