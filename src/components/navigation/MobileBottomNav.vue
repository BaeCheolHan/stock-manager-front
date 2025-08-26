<template>
  <nav class="mobile-bottom-nav" role="navigation" aria-label="하단 탐색">
    <ul>
      <li>
        <button @click="go('/')" aria-label="홈">홈</button>
      </li>
      <li>
        <button @click="go('/my')" aria-label="내 주식">내 주식</button>
      </li>
      <li>
        <button @click="go('/settings')" aria-label="설정">설정</button>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'MobileBottomNav',
  methods: {
    go(path) {
      if (this.$route.path !== path) this.$router.replace(path)
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
  padding: 12px 8px;
  font-weight: 600;
}
</style>


