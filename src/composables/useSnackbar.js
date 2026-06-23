import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useUiStore } from '@/stores/ui.store'

// Wrapper around ui.store for triggering toasts.
export function useSnackbar () {
  const uiStore = useUiStore()
  const { snackbar } = storeToRefs(uiStore)

  // Read-only state (for SnackbarHost component)
  // ui.store uses `show` and `color` — map to friendlier names here
  const isVisible = computed(() => snackbar.value.show)
  const message = computed(() => snackbar.value.message)
  const color = computed(() => snackbar.value.color) // 'success' | 'error' | 'info'
  const timeout = computed(() => snackbar.value.timeout)

  // Trigger helpers
  function success (msg, duration = 3000) {
    uiStore.showSnackbar(msg, 'success', duration)
  }

  function error (msg, duration = 4000) {
    // Slightly longer default for errors so users have time to read them
    uiStore.showSnackbar(msg, 'error', duration)
  }

  function info (msg, duration = 3000) {
    uiStore.showSnackbar(msg, 'info', duration)
  }

  function warning (msg, duration = 3500) {
    uiStore.showSnackbar(msg, 'warning', duration)
  }

  function dismiss () {
    uiStore.hideSnackbar()
  }

  return {
    // State (for SnackbarHost)
    isVisible,
    message,
    color,
    timeout,

    // Helpers
    success,
    error,
    info,
    warning,
    dismiss,
  }
}
