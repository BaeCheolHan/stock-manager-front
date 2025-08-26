<template>
  <div class="modal" role="dialog" aria-modal="true" @keydown.esc.prevent="$emit('close-modal')">
    <div class="overlay" @click="$emit('close-modal')"></div>
    <div class="modal-card" :style="UiService().isMobile() ? '' : 'max-width: 1300px'" ref="card" tabindex="-1">
      <slot />
      <button class="visually-hidden" ref="sentinel" @focus="focusTrapToCard"></button>
    </div>
  </div>
</template>

<script>
import UiService from "@/service/UiService";

export default {
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.card) this.$refs.card.focus()
    })
  },
  methods: {
    UiService() {
      return UiService
    },
    focusTrapToCard() {
      if (this.$refs.card) this.$refs.card.focus()
    }
  }

};
</script>