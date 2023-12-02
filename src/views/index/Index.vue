<template>
  <IndexChartArea/>
  <v-divider class="mg-t-30 mg-b-30"></v-divider>
  <KrVolumeRankBox/>
</template>

<script>

import IndexChartArea from "@/components/index/IndexChartArea.vue";
import KrVolumeRankBox from "@/components/index/KrVolumeRankBox.vue";

export default {
  name: 'Index',
  components: {
    IndexChartArea,
    KrVolumeRankBox,
  },
}
</script>
