import { formatDate, getWeekDates, getWeekLabel, getWeekString, parseLocalDate } from '@/utils/dateHelpers'

// Short day name labels in Mon-Fri order
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

// Function to format dates for display throughout the app
export function useWeekLabel () {

  // Function that accepts a weekOffset (0 = this week, 1 = next week, -1 = last week)
  function weekLabel (weekOffset = 0) {

    // 1. Automatically extract or get the DATE based on the offset
    // The DATE here is example, Monday, January 2nd, 2026 - Friday, January 7th, 2026
    const dates = getWeekDates(weekOffset)

    // 2. Take out the first day/ MONDAY from the extracted week i.e Monday, January 2nd, 2026
    const monday = dates[0]

    // 3. Take a date object, i.e Monday, January 2nd, 2026 and extract just a 3-letter abbreviation of the MONTH i.e Jan
    const monthStr = monday.toLocaleDateString('en-US', { month: 'short' })

    // 4. Return a short week label: "Week of { Jan 2 }"
    return `Week of ${monthStr} ${monday.getDate()}`
  }

  // Function to return the full range label: "Jan 2 - Jan 7, 2026"
  function weekRangeLabel (weekOffset = 0) {
    // Thin alias over dateHelpers.getWeekLabel so views import from one place
    return getWeekLabel(weekOffset)
  }

  // Function to return Mon - Fri as ISO strings for the given weekOffset
  // e.g. ["2025-06-09", "2025-06-10", "2025-06-11", "2025-06-12", "2025-06-13"]
  function weekDays (weekOffset = 0) {
    return getWeekDates(weekOffset).map(formatDate)
  }

  // Function to return Mon-Fri as labelled objects for WeekStrip / WeekPicker components
  // e.g. [{ date: "2025-06-09", label: "Mon 9" }, ...]
  function weekDayLabels (weekOffset = 0) {
    return getWeekDates(weekOffset).map((date, i) => ({
      date: formatDate(date),
      label: `${DAY_NAMES[i]} ${date.getDate()}`,
    }))
  }

  // Function to return a short label for a single ISO date string: "Mon 9"
  function shortDayLabel (dateString) {

    // 1. Convert and configure date string specifically to the user's local timezone.
    const d = parseLocalDate(dateString)

    // 2. Get the week value (Sun, 0 - Sat, 6) for that particular date string
    // e.g. 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dayOfWeek = d.getDay()

    // 3. Return something like, "Mon 9"
    const FULL_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return `${FULL_DAY_NAMES[dayOfWeek]} ${d.getDate()}`
  }

  // Function to return the Monday of the week containing the given date as an ISO string
  function weekStart (date = new Date()) {
    // Thin alias over dateHelpers.getWeekString
    return getWeekString(date)
  }

  // Function to return today's date as an ISO string without timezone shift
  function today () {
    return formatDate(new Date())
  }

  return {
    weekLabel,
    weekRangeLabel,
    weekDays,
    weekDayLabels,
    shortDayLabel,
    weekStart,
    today,
  }
}
