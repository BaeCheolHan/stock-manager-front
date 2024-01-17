<template>
  <div class="modal">
    <div class="overlay" @click="$emit('close-modal')"></div>
    <div class="modal-card" :style="UiService().isMobile() ? '' : 'max-width: 1300px'">
      <slot />
    </div>
  </div>
</template>

<script>
import UiService from "@/service/UiService";

export default {
  methods: {
    UiService() {
      return UiService
    }
  }

};
</script>