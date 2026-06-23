import {
  formatDate,
  getWeekDates,
  getWeekLabel,
  getWeekString,
  parseLocalDate,
} from '@/utils/dateHelpers'

// Short day name labels in Mon-Fri order
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export function useWeekLabel () {
  // Label formatters

  // Returns a short week label: "Week of Jun 9"
  // Accepts a weekOffset (0 = this week, 1 = next week, -1 = last week)
  function weekLabel (weekOffset = 0) {
    const dates = getWeekDates(weekOffset)
    const monday = dates[0]
    const monthStr = monday.toLocaleDateString('en-US', { month: 'short' })
    return `Week of ${monthStr} ${monday.getDate()}`
  }

  // Returns a full range label: "Jun 9 - Jun 13, 2025"
  // Thin alias over dateHelpers.getWeekLabel so views import from one place
  function weekRangeLabel (weekOffset = 0) {
    return getWeekLabel(weekOffset)
  }

  // Returns Mon-Fri as ISO strings for the given weekOffset
  // e.g. ["2025-06-09", "2025-06-10", "2025-06-11", "2025-06-12", "2025-06-13"]
  function weekDays (weekOffset = 0) {
    return getWeekDates(weekOffset).map(formatDate)
  }

  // Returns Mon-Fri as labelled objects for WeekStrip / WeekPicker components
  // e.g. [{ date: "2025-06-09", label: "Mon 9" }, ...]
  function weekDayLabels (weekOffset = 0) {
    return getWeekDates(weekOffset).map((date, i) => ({
      date: formatDate(date),
      label: `${DAY_NAMES[i]} ${date.getDate()}`,
    }))
  }

  // Returns a short label for a single ISO date string: "Mon 9"
  function shortDayLabel (dateString) {
    const d = parseLocalDate(dateString)
    const dow = d.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const FULL_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return `${FULL_DAY_NAMES[dow]} ${d.getDate()}`
  }

  // Returns the Monday of the week containing the given date as an ISO string
  // Thin alias over dateHelpers.getWeekString
  function weekStart (date = new Date()) {
    return getWeekString(date)
  }

  // Returns today's date as an ISO string without timezone shift
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
