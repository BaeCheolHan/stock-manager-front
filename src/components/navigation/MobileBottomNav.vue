<template>
  <nav class="mobile-bottom-nav" role="navigation" aria-label="하단 탐색">
    <ul>
      <li>
        <button @click="go('/')" :class="{active: isActive('/')}" :aria-current="isActive('/') ? 'page' : undefined" aria-label="홈">
          <v-icon :color="isActive('/') ? 'primary' : undefined" icon="mdi-home-outline" size="20"/>
          <span>홈</span>
        </button>
      </li>
      <li>
        <button @click="go('/my')" :class="{active: isActive('/my')}" :aria-current="isActive('/my') ? 'page' : undefined" aria-label="내 주식">
          <v-icon :color="isActive('/my') ? 'primary' : undefined" icon="mdi-finance" size="20"/>
          <span>내 주식</span>
        </button>
      </li>
      <li>
        <button @click="go('/settings')" :class="{active: isActive('/settings')}" :aria-current="isActive('/settings') ? 'page' : undefined" aria-label="설정">
          <v-icon :color="isActive('/settings') ? 'primary' : undefined" icon="mdi-cog-outline" size="20"/>
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
  methods: {
    go(path) {
      UiService.vibrate(10)
      if (this.$route.path !== path) this.$router.replace(path)
    },
    isActive(path) {
      return this.$route.path === path
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
</style>


