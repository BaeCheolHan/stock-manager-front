<template>
  <div class="modal">
    <div class="overlay" @click="$emit('close-modal')"></div>
    <div class="modal-card" :style="this.UiService.isMobile() ? '' : 'max-width: 1300px'">
      <slot />
    </div>
  </div>
</template>

<script>
export default {

};
</script>