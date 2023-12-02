<template>
  <v-window>
    <v-container>
      <UpperMenu />
      <UpperChart/>
    </v-container>
  </v-window>
</template>
<script>
import UpperMenu from "@/components/my/tabs/UpperMenu.vue";
import UpperChart from "@/components/my/chart/UpperChart.vue";

export default {
  name: 'Main',
  components: {
    UpperChart,
    UpperMenu,
  },
  data() {
    return {
    }
  },
  computed: {},
  watch: {
  },
  mounted() {
  },
  created() {
  },
  methods: {
  }
}
</script>
