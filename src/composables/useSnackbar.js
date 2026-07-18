import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useUiStore } from '@/stores/ui.store'

// Function to act as a wrapper around ui.store for triggering toast notifications.
export function useSnackbar () {
  const uiStore = useUiStore()
  const { snackbar } = storeToRefs(uiStore)

  // Referencing and computing useUiStore states
  const isVisible = computed(() => snackbar.value.show)
  const message = computed(() => snackbar.value.message)
  const color = computed(() => snackbar.value.color) // 'success' | 'error' | 'info'
  const timeout = computed(() => snackbar.value.timeout)

  // Function for showing SUCCESSFUL toast notifications - close after 3 seconds
  function success (msg, duration = 3000) {
    uiStore.showSnackbar(msg, 'success', duration)
  }

  // Function for showing FAILED toast notifications - close after 4 seconds
  function error (msg, duration = 4000) {
    // Slightly longer default for errors so users have time to read them
    uiStore.showSnackbar(msg, 'error', duration)
  }

  // Function for showing INFORMATION toast notifications - close after 3 seconds
  function info (msg, duration = 3000) {
    uiStore.showSnackbar(msg, 'info', duration)
  }

  // Function for showing PROMPT toast notifications - close after 3 seconds
  function warning (msg, duration = 3500) {
    uiStore.showSnackbar(msg, 'warning', duration)
  }

  // Function for closing or making notifications invisible
  function dismiss () {
    uiStore.hideSnackbar()
  }

  return {
    // State
    isVisible,
    message,
    color,
    timeout,

    // Actions
    success,
    error,
    info,
    warning,
    dismiss,
  }
}
