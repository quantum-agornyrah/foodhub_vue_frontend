import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    // Shor or hide loading overlay
    globalLoading: false,

    // Toast notifications
    snackbar: {
      show: false,
      message: '',
      color: 'success',
      timeout: 3000,
    },

    // Confirmation pop-up
    confirmDialog: {
      show: false,
      title: '',
      message: '',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      loading: false,
      onConfirm: null,
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
    
    openConfirmDialog (options) {
      this.confirmDialog = {
        show: true,
        title: options.title || 'Confirm action',
        message: options.message || '',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        loading: false,
        onConfirm: options.onConfirm || null,
      }
    },

    closeConfirmDialog () {
      this.confirmDialog.show = false
      this.confirmDialog.loading = false
      this.confirmDialog.onConfirm = null
    },

    async confirmAction () {
      if (!this.confirmDialog.onConfirm) {
        this.closeConfirmDialog()
        return
      }

      this.confirmDialog.loading = true

      try {
        await this.confirmDialog.onConfirm()
      } finally {
        this.closeConfirmDialog()
      }
    },
  },
})
