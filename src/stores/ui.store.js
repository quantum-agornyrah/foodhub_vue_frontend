import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    globalLoading: false,

    snackbar: {
      show: false,
      message: '',
      color: 'success',
      timeout: 3000,
    },

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

    showSnackbar (message, color = 'success', timeout = 3000) {
      this.snackbar = {
        show: true,
        message,
        color,
        timeout,
      }
    },

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
