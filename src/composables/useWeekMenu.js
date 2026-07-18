import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { DAY_STATUS } from '@/constants/dayStatus'
import { useMenuStore } from '@/stores/menu.store'
import { formatDate, getWeekString, isDeadlinePassed, parseLocalDate } from '@/utils/dateHelpers'

// Function to manage menu data for a pecific week
export function useWeekMenu () {

  // 1. Initialize store and Pull reactive state from menu.store
  const menuStore = useMenuStore()
  const { error: snackError } = useSnackbar()
  const { allMenuItems, isLoading } = storeToRefs(menuStore)

  // 2. Assign an ISO date string ("YYYY-MM-DD") the user is currently viewing
  // Currently selected day from the ShortWeekLabel tab
  const activeDay = ref(null)

  // 3. Assign the Monday ISO date string of the week currently loaded
  // Currently loaded week from the weekLabel component
  const activeWeek = ref(null)

  // 4. Assign off-days
  const offDays = computed(() =>
    // Assign a value in the allMenuItems array as an OFFDAY item or status and map to that particular date
    allMenuItems.value
      .filter(item => item.status === DAY_STATUS.OFF_DAY)
      .map(item => item.date),
  )

  // 5. Assign holidays
  const holidays = computed(() =>
    // Assign a value in the allMenuItems array as a HOLIDAY item or status and map to that particular date
    allMenuItems.value
      .filter(item => item.status === DAY_STATUS.HOLIDAY)
      .map(item => item.date),
  )

  // Function to return true if the given date is an off-day
  function isOffDay (dateString) {
    return offDays.value.includes(dateString)
  }

  // Function to return true if the given date is a public holiday
  function isHoliday (dateString) {
    return holidays.value.includes(dateString)
  }

  // Function to return the DAY_STATUS value for any ISO date string.
  function dayStatus (dateString) {
    // Check and return status for offday and holiday
    if (isOffDay(dateString)) return DAY_STATUS.OFF_DAY
    if (isHoliday(dateString)) return DAY_STATUS.HOLIDAY

    // Check and fetch HR-set deadline for a specific week
    const weekKey = getWeekString(parseLocalDate(dateString))
    const deadline = menuStore.deadlineByWeek(weekKey)

    // Logic to check deadline
    if (deadline) {
      // 1. If a deadline is set, use the status
      if (new Date() > new Date(deadline)) {
        return DAY_STATUS.DEADLINE_PASSED
      }
    } else {
      // Fall back to the old hardcoded logic if no deadline is set
      if (isDeadlinePassed(dateString)) {
        return DAY_STATUS.DEADLINE_PASSED
      }
    }

    // Set menu status to OPEN when they are neither under off_day, holiday or deadline_passed
    return DAY_STATUS.OPEN
  }

  // All menu items for the active week, each annotated with their computed day status
  const weekMenu = computed(() => {
    if (!activeWeek.value) {
      return []
    }

    // Access the menu for a particular week and map each menu-week item i.e Mon 2 with an assigned status
    return menuStore.menuByWeek(activeWeek.value).map(item => ({
      ...item,

      // Annotate with computed status
      status: dayStatus(item.date), 
    }))
  })

  // Unique Mon-Fri dates for the active week with their status.
  // SHAPE: [{ date: "2025-06-09", status: "open" | "off_day" | "holiday" | "deadline_passed" }]
  // Deduplicating, slimming down, and sorting.
  const weekDays = computed(() => {

    // Create a set for holding unique values like the SHAPE above
    const seen = new Set()

    // Go through the weekMenu items array containing dates and statuses for the current or active week
    return weekMenu.value
      .filter(item => {

        // If the date of a particular weekMenu item is already seen, 
        // ignore from adding to the set. i.e DE-DUPLICATION 
        if (seen.has(item.date)) {
          return false
        }

        // If not, remember the date of the particular week array only not the food values and insert into the set
        seen.add(item.date)
        return true
      })
      // SLIMMING - Strap all other heavy details and get only the date and status from the weekMenu arrays
      .map(item => ({ date: item.date, status: item.status }))
      
      // SORTING - Arrange the new set values in ascending order, 
      // old date to new date i.e mon 2 to fri 7
      .sort((a, b) => a.date.localeCompare(b.date))
  })

  // The list of menu items for the day the user is currently viewing
  const activeDayMenu = computed(() => {
    if (!activeDay.value) {
      return []
    }

    // Output something like this suppose the active day is 20th July:
    //  [
    //   { date: '2026-07-20', food: 'Tacos' },
    //   { date: '2026-07-20', food: 'Pizza' },
    //   { date: '2026-07-20', food: 'Burger' }
    // ]
    return menuStore.menuByDate(activeDay.value)
  })

  // Whether the currently active day is an off-day
  const activeDayIsOff = computed(() => isOffDay(activeDay.value))

  // The DAY_STATUS value of the currently active day
  const activeDayStatus = computed(() =>
    activeDay.value ? dayStatus(activeDay.value) : null,
  )

  // True if the active day is still open for ordering
  const activeDayIsOpen = computed(() =>
    activeDayStatus.value === DAY_STATUS.OPEN,
  )

  // True if today's date falls within the currently loaded week
  const isCurrentWeek = computed(() => {
    if (!activeWeek.value) {
      return false
    }
    const todayStr = formatDate(new Date())
    return weekDays.value.some(d => d.date === todayStr)
  })

  // Fetch all menu items then filter down to the given week.
  // Function to set the active day to the first OPEN day, or Monday as default or a fallback.
  async function fetchWeekMenu (weekStartDate) {

    // 1. Assign the activeWeek content or array (All 5 days) for a particular day to the parameter, weekStartDate
    activeWeek.value = weekStartDate

    // 2. Fetch ONLY menu items for the target week and the deadline in parallel
    const [okMenu, okDeadline] = await Promise.all([
      // Fetch all food items for a particular day in the week
      menuStore.getAllMenuItems({ week_string: weekStartDate }),

      // Fetch deadline
      menuStore.getWeekDeadline(weekStartDate),
    ])

    // 3. Send a toast notification when fetch from localStorage or databse or API fails
    if (!okMenu) {
      snackError('Could not load the week menu.')
      return
    }

    // 4. Auto-select first open-day especially when user 
    // clicks the menu manager nav link directly and
    // When user clicks a particular day's add item button
    const firstOpen = weekDays.value.find(d => d.status === DAY_STATUS.OPEN)
    activeDay.value = firstOpen?.date ?? weekDays.value[0]?.date ?? null
  }

  // Set the day the user is currently browsing
  function setActiveDay (dateString) {
    activeDay.value = dateString
  }

  return {
    // Raw store state
    allMenuItems,
    isLoading,

    // Derived lists
    offDays,
    holidays,
    weekMenu,
    weekDays,
    activeDayMenu,

    // Active day state
    activeDay,
    activeWeek,
    activeDayIsOff,
    activeDayStatus,
    activeDayIsOpen,
    isCurrentWeek,
    DAY_STATUS,

    // Helpers
    isOffDay,
    isHoliday,
    dayStatus,

    // Actions
    fetchWeekMenu,
    setActiveDay,

    // HR store actions passed through so HR views don't import the store directly
    createMenu: menuStore.createMenu,
    createBulkMenu: menuStore.createBulkMenu,
    updateMenu: menuStore.updateMenu,
    deleteMenu: menuStore.deleteMenu,
  }
}
