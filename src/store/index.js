import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    info: {
      isMobile: true,
      subDomain: undefined,
    },
    userInfo: null,
  }),
  getters: {
    getInfo: (state) => state.info,
    getUserInfo: (state) => state.userInfo,
  },
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    removeUserInfo() {
      this.userInfo = null
    },
  },
})
