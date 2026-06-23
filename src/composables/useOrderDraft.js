import { computed, ref, watch } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { ORDER_STATUS } from '@/constants/orderStatus'
import { useAuthStore } from '@/stores/auth.store'
import { useMenuStore } from '@/stores/menu.store'
import { useOrderStore } from '@/stores/orders.store'
import { parseLocalDate } from '@/utils/dateHelpers'

// localStorage key for persisting the draft between page refreshes
const STORAGE_KEY = 'foodhub:orderDraft'

// Read the saved draft from localStorage.
// Returns null if nothing is saved or the data is corrupt.
function loadFromStorage () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Write the current draft to localStorage.
// Fails silently if storage is unavailable (private mode, quota exceeded).
function saveToStorage (draft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Silently ignore storage errors
  }
}

export function useOrderDraft () {
  const orderStore = useOrderStore()
  const authStore = useAuthStore()
  const menuStore = useMenuStore()
  const { success: snackSuccess, error: snackError, warning: snackWarning } = useSnackbar()

  // The Monday ISO date string of the week this draft belongs to
  const weekStart = ref(null)

  // Object mapping each date to the selected item id, or null if unselected.
  // Shape: { "2025-06-09": "item-id-abc", "2025-06-10": null, ... }
  const selections = ref({})

  // True while a submit or save API call is in flight
  const isSubmitting = ref(false)
  const isSavingDraft = ref(false)
  const isSubmittingAll = ref(false)

  // Hydrate from localStorage on first use
  const stored = loadFromStorage()
  if (stored) {
    weekStart.value = stored.weekStart
    selections.value = stored.selections ?? {}
  }

  // Persist to localStorage whenever weekStart or selections change
  watch(
    [weekStart, selections],
    () => saveToStorage({ weekStart: weekStart.value, selections: selections.value }),
    { deep: true },
  )

  // How many days currently have an item selected
  const selectedCount = computed(() =>
    Object.values(selections.value).filter(v => v !== null).length,
  )

  // True if at least one day has a selection
  const hasSelections = computed(() => selectedCount.value > 0)

  // Returns true if this draft belongs to the given week
  function isForWeek (weekStartDate) {
    return weekStart.value === weekStartDate
  }

  // Returns the selected item id for a date, or null if nothing selected
  function selectionFor (date) {
    return selections.value[date] ?? null
  }

  // Initialise the draft for a new week.
  // Safe to call on every page mount — if a draft already exists for
  // the same week it will be kept, not overwritten.
  function initDraft (weekStartDate, availableDates) {
    if (weekStart.value === weekStartDate) {
      return
    }
    weekStart.value = weekStartDate
    selections.value = Object.fromEntries(availableDates.map(d => [d, null]))
  }

  // Set the selected item for a given date
  function selectItem (date, itemId) {
    selections.value = { ...selections.value, [date]: itemId }
  }

  // Remove the selection for a given date
  function clearDay (date) {
    selections.value = { ...selections.value, [date]: null }
  }

  // Wipe the entire draft from state and localStorage
  function clearDraft () {
    weekStart.value = null
    selections.value = {}
    localStorage.removeItem(STORAGE_KEY)
  }

  // Helper to persist the draft week selections to the DB day-by-day
  async function persistDraft (status) {
    if (!hasSelections.value) {
      snackWarning('Select at least one item before saving.')
      return false
    }

    isSubmitting.value = true
    try {
      const staffId = authStore.userInfo.id
      const staffName = authStore.userInfo.name

      // 1. Fetch current staff orders to check for existing entries
      await orderStore.getMyOrders(staffId)
      const existingMyOrders = orderStore.myOrders.filter(
        o => o.weekString === weekStart.value,
      )

      // 2. Loop through each weekday in selections
      const dates = Object.keys(selections.value)

      const promises = []

      for (const date of dates) {
        const menuItemId = selections.value[date]
        const existingOrder = existingMyOrders.find(o => o.date === date)

        if (menuItemId) {
          const menuItem = menuStore.allMenuItems.find(
            item => String(item.id) === String(menuItemId),
          )
          const menuTitle = menuItem ? menuItem.title : 'Selected Item'

          const d = parseLocalDate(date)
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          const day = dayNames[d.getDay()]

          const orderData = {
            staffId,
            staffName,
            weekString: weekStart.value,
            date,
            day,
            menuItemId: Number(menuItemId),
            menuTitle,
            status,
          }

          if (existingOrder) {
            // Only update if changes were actually made
            if (existingOrder.menuItemId !== Number(menuItemId) || existingOrder.status !== status) {
              promises.push(orderStore.updateOrder(existingOrder.id, orderData))
            }
          } else {
            promises.push(orderStore.createOrder(orderData))
          }
        } else {
          if (existingOrder) {
            promises.push(orderStore.deleteOrder(existingOrder.id))
          }
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises)
      }

      await Promise.all(promises);

      // 3. Refresh the staff's orders in the store
      await orderStore.getMyOrders(staffId)
      return true
    } catch (error) {
      console.error('Failed to persist draft:', error)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  // Submit the draft as a final order (ORDER_STATUS.SUBMITTED).
  // Clears the draft on success.
  async function submitDraft () {
    isSubmittingAll.value = true
    const ok = await persistDraft(ORDER_STATUS.SUBMITTED)
    isSubmittingAll.value = false

    if (ok) {
      snackSuccess('Your order has been submitted.')
      clearDraft()
      return true
    }
    snackError(orderStore.error ?? 'Could not submit your order. Try again.')
    return false
  }

  // Save current selections as a draft (ORDER_STATUS.DRAFT) without submitting.
  async function saveDraft () {
    isSavingDraft.value = true
    const ok = await persistDraft(ORDER_STATUS.DRAFT)
    isSavingDraft.value = false

    if (ok) {
      snackSuccess('Draft saved.')
      return true
    }
    snackError(orderStore.error ?? 'Could not save draft.')
    return false
  }

  return {
    // State
    weekStart,
    selections,
    isSubmitting,
    isSavingDraft,
    isSubmittingAll,

    // Computed
    selectedCount,
    hasSelections,
    ORDER_STATUS,

    // Helpers
    isForWeek,
    selectionFor,

    // Actions
    initDraft,
    selectItem,
    clearDay,
    clearDraft,
    submitDraft,
    saveDraft,
  }
}
