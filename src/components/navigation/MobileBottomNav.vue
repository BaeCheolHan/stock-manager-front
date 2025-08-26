<template>
  <nav class="mobile-bottom-nav" role="navigation" aria-label="하단 탐색">
    <ul>
      <li>
        <button @click="go('/')" :class="{active: isActive('/')}" :aria-current="isActive('/') ? 'page' : undefined" aria-label="홈">
          <v-icon :color="colorFor('/')" icon="mdi-home-outline" :size="sizePx()"/>
          <span>홈</span>
        </button>
      </li>
      <li>
        <button @click="go('/my')" :class="{active: isActive('/my')}" :aria-current="isActive('/my') ? 'page' : undefined" aria-label="내 주식">
          <v-icon :color="colorFor('/my')" icon="mdi-finance" :size="sizePx()"/>
          <span>내 주식</span>
        </button>
      </li>
      <li>
        <button @click="go('/settings')" :class="{active: isActive('/settings')}" :aria-current="isActive('/settings') ? 'page' : undefined" aria-label="설정">
          <v-icon :color="colorFor('/settings')" icon="mdi-cog-outline" :size="sizePx()"/>
          <span>설정</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script>
import UiService from '@/service/UiService'
export default {
  name: 'MobileBottomNav',
  props: {
    iconSize: { type: [String, Number], default: 20 },
    activeColor: { type: String, default: 'primary' },
    inactiveColor: { type: String, default: undefined },
    hideLabelsOnXs: { type: Boolean, default: true },
  },
  methods: {
    go(path) {
      UiService.vibrate(10)
      if (this.$route.path !== path) this.$router.replace(path)
    },
    isActive(pathPrefix) {
      return this.$route.path === pathPrefix || this.$route.path.startsWith(pathPrefix + '/')
    },
    colorFor(pathPrefix) {
      return this.isActive(pathPrefix) ? this.activeColor : this.inactiveColor
    },
    sizePx() {
      return Number(this.iconSize)
    }
  }
}
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9997;
  background: #ffffff;
  border-top: 1px solid #e6e4eb;
  padding-bottom: env(safe-area-inset-bottom);
}
.mobile-bottom-nav ul {
  display: flex;
}
.mobile-bottom-nav li { flex: 1; }
.mobile-bottom-nav button {
  width: 100%;
  padding: 8px 8px 10px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mobile-bottom-nav button span { font-size: 11px; margin-top: 2px; }
.mobile-bottom-nav button.active { color: #1976d2; }
@media (max-width: 360px) {
  .mobile-bottom-nav button span { display: none; }
}
.mobile-bottom-nav button.active :deep(.v-icon) {
  background-color: rgba(25,118,210,.12);
  border-radius: 999px;
  padding: 6px;
}
</style>


