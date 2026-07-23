import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    // Show or hide loading overlay
    globalLoading: false,

    // Toast notifications
    snackbar: {
      show: false,
      message: '',
      color: 'success',
      timeout: 3000,
    },
  }),

  actions: {
    setGlobalLoading (value) {
      this.globalLoading = value
    },

    // Action to activate and SHOW toast notifications
    showSnackbar (message, color = 'success', timeout = 3000) {
      this.snackbar = {
        show: true,
        message,
        color,
        timeout,
      }
    },

    // Function to disable toast notification
    hideSnackbar () {
      this.snackbar.show = false
    },
  },
})
