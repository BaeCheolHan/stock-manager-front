<template>

</template>
<script>
export default {
  name: "DividendByStockDetailPop",
  props: {

  },
  data() {
    return {
      userInfo: null,
    }
  },
  created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (this.userInfo) {
      this.$store.commit('setUserInfo', this.userInfo)
      this.accounts = this.userInfo.bankAccounts;
      this.bankAccountTab = 'all'
    } else {
      location.replace("/");
    }
  },
  methods: {

  }

}
</script>