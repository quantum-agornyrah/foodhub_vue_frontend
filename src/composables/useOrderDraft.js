import { computed, ref, watch } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { ORDER_STATUS } from '@/constants/orderStatus'
import { useAuthStore } from '@/stores/auth.store'
import { useMenuStore } from '@/stores/menu.store'
import { useOrderStore } from '@/stores/orders.store'
import { parseLocalDate } from '@/utils/dateHelpers'

// localStorage key for persisting the draft between page refreshes
const STORAGE_KEY = 'foodhub:orderDraft'

// Function to read the saved draft from localStorage.
// Function to return null if nothing is saved or the data is corrupt.
function loadFromStorage () {
  try {
    // Fetch the items if item exists
    const raw = localStorage.getItem(STORAGE_KEY)
    // Return null if nothing exists
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Function to write the current draft to localStorage.
function saveToStorage (draft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Silently ignore storage errors
  }
}

// Function to handle staff's weekly order selections (save as draft or submit)
export function useOrderDraft () {
  const orderStore = useOrderStore()
  const authStore = useAuthStore()
  const menuStore = useMenuStore()
  const { success: snackSuccess, error: snackError, warning: snackWarning } = useSnackbar()

  // Get the Monday ISO date string of the week from the draft saved
  const weekStart = ref(null)

  // Object mapping each date to the selected item id, or null if unselected.
  // Shape: { "2025-06-09": "item-id", "2025-06-10": null, ... }
  const selections = ref({})

  // True while a submit or save API call is called based on the button clicked
  const isSubmitting = ref(false)
  const isSavingDraft = ref(false)
  const isSubmittingAll = ref(false)

  // Call the whole object and separate in terms of the Monday date and the rest of the date with assigned item ids
  const stored = loadFromStorage()
  if (stored) {
    weekStart.value = stored.weekStart
    selections.value = stored.selections ?? {}
  }

  // Persist or Auto-save to localStorage whenever weekStart or selections change
  watch(
    [weekStart, selections],
    () => saveToStorage({ weekStart: weekStart.value, selections: selections.value }),
    { deep: true },
  )

  // How many days currently have an item selected or has an assigned item id after saving in draft
  const selectedCount = computed(() =>
    Object.values(selections.value).filter(v => v !== null).length,
  )

  // True if at least one day has a selection or assigned an item id
  const hasSelections = computed(() => selectedCount.value > 0)

  // Function to return true if this draft belongs to the given week
  function isForWeek (weekStartDate) {
    return weekStart.value === weekStartDate
  }

  // Function to return the selected item id for a date, or null if nothing selected
  function selectionFor (date) {
    return selections.value[date] ?? null
  }

  // Function to Initialise the draft for a new week.
  function initDraft (weekStartDate, availableDates) {

    // Check if the week the user clicked is already the active week in the UI using the unique Monday ISO date
    if (weekStart.value === weekStartDate) return

    // If week is a new week, clear and overwrite with a new weeks Monday ISO
    weekStart.value = weekStartDate
    // Populate with the rest of the dates with assigned item ids
    selections.value = Object.fromEntries(availableDates.map(d => [d, null]))
  }

  // Function to set the selected item (food) for a given date using the item ids
  function selectItem (date, itemId) {
    selections.value = { ...selections.value, [date]: itemId }
  }

  // Function to remove the selection for a given date especially when a user changes his/her mind
  function clearDay (date) {
    selections.value = { ...selections.value, [date]: null }
  }

  // Function to clear the entire draft from state and localStorage
  function clearDraft () {
    weekStart.value = null
    selections.value = {}
    localStorage.removeItem(STORAGE_KEY)
  }

  // Function to persist the draft week selections to the database day-by-day
  // FOR THE SAKE OF DEADLINE
  async function persistDraft (status) {

    // Safety notification eventhough buttons are already disabled
    if (!hasSelections.value) {
      snackWarning('Select at least one item before saving.')
      return false
    }

    isSubmitting.value = true
    try {
      const staffId = authStore.userInfo.id
      const staffName = authStore.userInfo.name

      // 1. Fetch existing orders for the selected week by a specific staff
      await orderStore.getMyOrders(staffId)
      const existingMyOrders = orderStore.myOrders.filter(
        o => o.weekString === weekStart.value,
      )

      // 2. Loop through each day of the week selected in selections
      const dates = Object.keys(selections.value)

      // Create an array for getting the updated menu slections
      const promises = []

      for (const date of dates) {
        const menuItemId = selections.value[date]
        const existingOrder = existingMyOrders.find(o => o.date === date)

        // Check the all menu array to extract all the selections made by a specific staff based on menu id
        if (menuItemId) {
          const menuItem = menuStore.allMenuItems.find(
            item => String(item.id) === String(menuItemId),
          )
          const menuTitle = menuItem ? menuItem.title : 'Selected Item'

          const d = parseLocalDate(date)
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          const day = dayNames[d.getDay()]

          // How to save the order values after getting the dates and the menu items id for each selection
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

          // Check if a staff already made selctions and wants to make changes
          if (existingOrder) {

            // If the already selected menu item is changed,
            if (existingOrder.menuItemId !== Number(menuItemId) || existingOrder.status !== status) {
              // Update the value of the menu item id to the new selected item id
              promises.push(orderStore.updateOrder(existingOrder.id, orderData))
            }
          } else {
            // If nothing is selected before, create / select a menu item for a particular date
            promises.push(orderStore.createOrder(orderData))
          }
        } else {
          // When a staff clers selection....NOT IMPLEMENTED YET
          if (existingOrder) {
            promises.push(orderStore.deleteOrder(existingOrder.id))
          }
        }
      }

      // Run all functions related with accessing the promises array concurrently
      // and return false if any other function fails
      if (promises.length > 0) {
        const results =await Promise.all(promises)
        if (results.some(res => res === false)) return false
      }

      // Wait here until all the last function is finished
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

  // Function to submit the draft as a final order (ORDER_STATUS.SUBMITTED).
  // Clears the draft on success especially after deadline has passed
  async function submitOrder () {

    // 1. Check the logic in the persistDraft
    isSubmittingAll.value = true
    const ok = await persistDraft(ORDER_STATUS.SUBMITTED)
    isSubmittingAll.value = false

    // 2. Toast notification if order is submitted successfully
    if (ok) {
      snackSuccess('Your order has been submitted.')
      localStorage.removeItem(STORAGE_KEY) 
      return true
    }

    // 3. Toast notification if order doesnt submit
    snackError(orderStore.error ?? 'Could not submit your order. Try again.')
    return false
  }

  // Function to save current selections as a draft (ORDER_STATUS.DRAFT) WITHOUT submitting.
  async function saveDraft () {

    // 1. Check the logic in the persistDraft
    isSavingDraft.value = true
    const ok = await persistDraft(ORDER_STATUS.DRAFT)
    isSavingDraft.value = false

    // 2. Toast notification if order is saved to draft successfully
    if (ok) {
      snackSuccess('Draft saved.')
      return true
    }

    // 2. Toast notification if order fails to save to draft
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
    submitOrder,
    saveDraft,
  }
}
