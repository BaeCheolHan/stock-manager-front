<template>
  <transition name="fade">
    <div class="modal" role="dialog" aria-modal="true" @keydown.esc.prevent="$emit('close-modal')">
      <div class="overlay" @click="$emit('close-modal')"></div>
      <transition name="slide-up">
        <div class="modal-card" :style="UiService().isMobile() ? '' : 'max-width: 1300px'" ref="card" tabindex="-1" @touchstart.passive="onTouchStart" @touchmove.passive="onTouchMove" @touchend.passive="onTouchEnd">
          <slot />
          <button class="visually-hidden" ref="sentinel" @focus="focusTrapToCard"></button>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import UiService from "@/service/UiService";

export default {
  data() {
    return {
      touchStartX: 0,
      touchStartY: 0,
      touchDeltaX: 0,
      touchDeltaY: 0,
      isTouching: false,
    }
  },
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
    },
    onTouchStart(e) {
      if (!e.touches || e.touches.length === 0) return
      const t = e.touches[0]
      this.touchStartX = t.clientX
      this.touchStartY = t.clientY
      this.touchDeltaX = 0
      this.touchDeltaY = 0
      this.isTouching = true
    },
    onTouchMove(e) {
      if (!this.isTouching || !e.touches || e.touches.length === 0) return
      const t = e.touches[0]
      this.touchDeltaX = t.clientX - this.touchStartX
      this.touchDeltaY = t.clientY - this.touchStartY
    },
    onTouchEnd() {
      if (!this.isTouching) return
      const absX = Math.abs(this.touchDeltaX)
      const absY = Math.abs(this.touchDeltaY)
      // Close on dominant downward swipe
      if (this.touchDeltaY > 80 && absY > absX * 1.5) {
        this.$emit('close-modal')
      }
      this.isTouching = false
    }
  }

};
</script>