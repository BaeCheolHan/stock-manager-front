<template>
  <div>
    <apexchart type="area" height="350" :options="chartOptions" :series="chartData"></apexchart>
  </div>
</template>


<script>

export default {
  name: "AssetChart",
  components: {},
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
