// Function to format a date object as YYYY-MM-DD
export function formatDate (date) {

  // 1. Get the current DATE
  const d = new Date(date)

  // 2. Get the MONTH form the current date
  const month = String(d.getMonth() + 1).padStart(2, '0')

  // 3. Get the DAY from the current date
  const day = String(d.getDate()).padStart(2, '0')

  // 4. Get the YEAR from the current date
  const year = d.getFullYear()

  // Result example = "2025-06-09"
  return `${year}-${month}-${day}`
}

// Function to safely parse YYYY-MM-DD string into a local Date object without timezone shift
export function parseLocalDate (dateString) {
  // 1. Takes a string like "2026-07-17" and breaks it down into raw math numbers: ["2026", "07", "17"].
  // And .map(Number) makes them real numbers = [2026, 07, 17].
  const [year, month, day] = dateString.split('-').map(Number)

  // 2. Create this date using the user's local timezone clock, not UTC.
  // Javascrpt recognizes months that are 0 - indexed
  // So when you enter a month, month -1 takes place to allow JS to read them perfectly
  return new Date(year, month - 1, day)
}

// Function to get the weekdays i.e Monday to Friday
export function getWeekDates (weekOffset = 0) {

  // 1. Create an array for the weekday dates
  const dates = []

  // 2. Get todays day from the date object
  const today = new Date()

  // 3. Find a MONDAY from today's date of current week
  const day = today.getDay()

  // 4. Calculate the offset to get to Monday (Monday is 1, Sunday is 0)
  const mondayOffset = day === 0 ? -6 : 1 - day

  // 5. Get the Monday date for the current week
  const monday = new Date(today)

  // 6. Calculate the NEXT WEEK and PREVIOUS WEEK logic
  monday.setDate(today.getDate() + mondayOffset + weekOffset * 7)

  // 7. Generate the weekdays from Monday to Friday and add them in the array we created
  for (let i = 0; i < 5; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    dates.push(date)
  }

  return dates
}

// Function to return the MONDAY Date from that week as YYYY-MM-DD
export function getWeekString (date = new Date()) {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date)
  const day = d.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + mondayOffset)

  // Return = "2025-06-09" (Monday of that week)
  return formatDate(monday)
}

// Function to format a week range
export function getWeekLabel (weekOffset = 0) {
  // 1. Get the whole week; Mon to Fri
  const dates = getWeekDates(weekOffset)

  // 2. Initialize the start and end dates
  const startDate = dates[0]
  const endDate = dates[4]

  // 3. Format date to show as "Jun 8 - Jun 12, 2026"
  const options = { month: 'short', day: 'numeric' }
  const startStr = startDate.toLocaleDateString('en-US', options)
  const endStr = endDate.toLocaleDateString('en-US', options)
  const year = startDate.getFullYear()

  return `${startStr} - ${endStr}, ${year}`
}

// Function to check if a YYYY-MM-DD date string represents a day prior to today
export function isPastDate (dateString) {
  // 1. Get today's date
  const today = new Date()

  // 2. Set time to 00:00:00.000 for accurate comparison
  today.setHours(0, 0, 0, 0)

  // 3. Parse target date locally to avoid timezone shifts
  const date = parseLocalDate(dateString)
  date.setHours(0, 0, 0, 0)

  // 4. Check if the whole date of the date is less than the day of todays date
  // Return True
  return date < today
}

// Function to check if the ordering deadline has passed.....CHANGED
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
