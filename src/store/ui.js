import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    snackbar: {
      show: false,
      message: '',
      color: 'success',
      timeout: 3000,
    },
    loading: {
      active: false,
      message: '',
    },
  }),
  actions: {
    showSnackbar({ message, color = 'success', timeout = 3000 }) {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.timeout = timeout
      this.snackbar.show = true
    },
    hideSnackbar() {
      this.snackbar.show = false
    },
    startLoading(message = '') {
      this.loading.message = message
      this.loading.active = true
    },
    stopLoading() {
      this.loading.active = false
      this.loading.message = ''
    },
  },
})

export default useUiStore

