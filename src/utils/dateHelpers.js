// Helper function to format a date object as YYYY-MM-DD
export function formatDate (date) {
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  return `${year}-${month}-${day}`
}

// Helper to safely parse YYYY-MM-DD string into a local Date object without timezone shift
export function parseLocalDate (dateString) {
  const [year, month, day] = dateString.split('-').map(Number)

  // Month is 0-indexed in JS Dates
  return new Date(year, month - 1, day)
}

// Helper function to get the weekdays i.e Monday to Friday
export function getWeekDates (weekOffset = 0) {
  const dates = [] // Get array of the weekday dates
  const today = new Date() // Get todays day from the date object

  // Find Monday of the current week
  const day = today.getDay()

  // Calculate the offset to get to Monday (Monday is 1, Sunday is 0)
  const mondayOffset = day === 0 ? -6 : 1 - day

  // Get the Monday date for the current week
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset + weekOffset * 7)

  // Generate the weekdays from Monday to Friday
  for (let i = 0; i < 5; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    dates.push(date)
  }

  return dates
}

// Helper function to return the MONDAY Date from that week as YYYY-MM-DD
export function getWeekString (date = new Date()) {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date)
  const day = d.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + mondayOffset)
  return formatDate(monday)
}

// Helper function to format a week range
export function getWeekLabel (weekOffset = 0) {
  // Get the whole week
  const dates = getWeekDates(weekOffset)

  // Initialize the start and end dates
  const startDate = dates[0]
  const endDate = dates[4]

  // Format date to show as "Jun 8 - Jun 12, 2026"
  const options = { month: 'short', day: 'numeric' }
  const startStr = startDate.toLocaleDateString('en-US', options)
  const endStr = endDate.toLocaleDateString('en-US', options)
  const year = startDate.getFullYear()

  return `${startStr} - ${endStr}, ${year}`
}

// Helper function to check if a YYYY-MM-DD date string represents a day prior to today
export function isPastDate (dateString) {
  // Get today's date
  const today = new Date()

  // Set time to 00:00:00.000 for accurate comparison
  today.setHours(0, 0, 0, 0)

  // Parse target date locally to avoid timezone shifts
  const date = parseLocalDate(dateString)
  date.setHours(0, 0, 0, 0)

  return date < today
}

// Helper function to check if the ordering deadline has passed
export function isDeadlinePassed (dateString, deadlineHour = 15) {
  const today = new Date()
  const todayStr = formatDate(today)

  // If the day is past, then its locked
  if (isPastDate(dateString)) {
    return true
  }

  // If the day is today, check if the deadline has passed
  if (todayStr === dateString) {
    const currentHour = today.getHours()
    return currentHour >= deadlineHour
  }

  // If the day is in the future, it's not locked
  return false
}
