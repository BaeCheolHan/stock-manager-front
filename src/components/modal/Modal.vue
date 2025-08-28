<template>
  <transition name="fade">
    <div class="modal" role="dialog" aria-modal="true" @keydown.esc.prevent="$emit('close-modal')">
      <div class="overlay" :class="{ 'is-closing': isClosing }" @click="$emit('close-modal')" @touchmove.prevent></div>
      <transition name="slide-up">
        <div class="modal-card" :class="{ 'is-closing': isClosing }" :style="dragStyle" ref="card" tabindex="-1" @touchstart.passive="onTouchStart" @touchmove="onTouchMove" @touchend.passive="onTouchEnd">
          <div class="modal-header" role="heading" aria-level="2">
            <div class="modal-drag-handle" v-if="UiService().isMobile()"></div>
            <button v-if="!UiService().isMobile()" class="modal-close" @click="$emit('close-modal')" aria-label="닫기">×</button>
          </div>
          <div class="modal-content">
            <slot />
          </div>
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
      isClosing: false,
      scrollPosition: 0,
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.card) this.$refs.card.focus()
    })
    try {
      // Record current scroll position and lock body to prevent background scroll/bounce
      this.scrollPosition = window.scrollY || window.pageYOffset || 0
      document.body.classList.add('modal-open')
      document.body.style.position = 'fixed'
      document.body.style.top = `-${this.scrollPosition}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
    } catch (_) {}
  },
  unmounted() {
    try {
      document.body.classList.remove('modal-open')
      // Restore body scroll state
      document.body.style.position = ''
      const top = document.body.style.top
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      const restoreY = top ? Math.abs(parseInt(top, 10)) : this.scrollPosition
      window.scrollTo(0, restoreY || 0)
    } catch (_) {}
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
      // Prevent iOS rubber-band by stopping scroll chaining at edges
      try {
        const el = this.$refs.card
        if (el) {
          const scrollTop = el.scrollTop
          const atTop = scrollTop <= 0
          const atBottom = scrollTop + el.clientHeight >= el.scrollHeight - 1
          const pullingDown = this.touchDeltaY > 0
          const pullingUp = this.touchDeltaY < 0
          if ((atTop && pullingDown) || (atBottom && pullingUp)) {
            e.preventDefault()
          }
        }
      } catch (_) {}
    },
    onTouchEnd() {
      if (!this.isTouching) return
      const absX = Math.abs(this.touchDeltaX)
      const absY = Math.abs(this.touchDeltaY)
      // Close on dominant downward swipe
      if (this.touchDeltaY > 80 && absY > absX * 1.5) {
        this.isClosing = true
        setTimeout(() => this.$emit('close-modal'), 180)
      }
      this.isTouching = false
    }
  }

};
</script>