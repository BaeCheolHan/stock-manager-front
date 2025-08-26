<template>
</template>

<script>

export default {
  name: 'SocialRedirect',
  data() {
    return {
      userInfo: null
    }
  },
  async created() {
    try {
      const snsType = this.$route.params.snsType;
      if (snsType == 'kakao') {

        const code = this.$route.query.code;
        let response = await this.axios.get('/sns/login/kakao?code='.concat(code));
        if (response.data) {
          const appStore = (await import('@/store')).useAppStore()
          appStore.setUserInfo(response.data)
          sessionStorage.setItem('userInfo', JSON.stringify(response.data))
          this.$router.replace('/my')
        }
      }

      if (snsType == 'google') {
        const code = this.$route.query.code;
        const scope = this.$route.query.scope;
        let response = await this.axios.get('/sns/login/google?code='.concat(code).concat("&scope=").concat(scope));
        if (response.data) {
          const appStore = (await import('@/store')).useAppStore()
          appStore.setUserInfo(response.data)
          sessionStorage.setItem('userInfo', JSON.stringify(response.data))
          this.$router.replace('/my')
        }
      }


    } catch (e) {
      // location.href = '/'
    }

  },
}

</script>