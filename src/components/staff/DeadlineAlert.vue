<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'

  // Reactive store for the countdown
  const countdown = ref({ days: 0, hours: 0, mins: 0, secs: 0 })
  let timer = null

// 1. Props Definition
  const props = defineProps({
    // Deadline prop e.g. "2026-06-13T10:00:00"
    deadlineIso: {
      type: String,
      required: true,
    },

    // Route prop
    to: {
      type: String,
      default: '/weekly-overview',
    },
  })

// 2. Compute states for dates or times that are passed
  const isPassed = computed(() =>{
    // If current date is greater or more than the set deadline date/time
    return new Date() > new Date(props.deadlineIso)
  })

// 3. Compute states for dates or times that are urget i.e 5 hours before deadline
  const isUrgent = computed(() =>{
    // First check if deadline is passed
    if (isPassed.value) return false

    // Compare deadline and current date and find the difference
    const now = new Date()
    const end = new Date(props.deadlineIso)
    const diff = end - now

    // 5 hours remaining in milliseconds
    return diff > 0 && diff <= 5 * 60 * 60 * 1000
  })

// 4. Function to count deadline in real time
  function updateCountdown () {

    // 1. Calculate the Time Difference (in milliseconds)
    // between the deal=dline time and the current time
    const now = new Date()
    const end = new Date(props.deadlineIso)
    const diff = end - now

    // 2. Check if time difference is 0 or negative, meaning the deadline has passed. 
    // And reset countdown numbers to 0
    if (diff <= 0) {
      countdown.value = { days: 0, hours: 0, mins: 0, secs: 0 }
      clearInterval(timer)
      return
    }

    // 3. Convert milliseconds to real-time seconds
    const realTimeSeconds = Math.floor(diff / 1000)

    // 4. Set countdown to Days, Hours, Mins and Seconds
    countdown.value = {
      // 86,400 (the number of seconds in a full 24-hour day)
      days: Math.floor(realTimeSeconds / 86_400),
      // Divide the remaining seconds by 3,600 (seconds in an hour).
      hours: Math.floor((realTimeSeconds % 86_400) / 3600),
      // Divide the remaining seconds by 60 (seconds in a minute).
      mins: Math.floor((realTimeSeconds % 3600) / 60),
      // Keep only the left-over seconds under a full minute.
      secs: realTimeSeconds % 60,
    }
  }

// 5. Run the real-time countdown immediately
  onMounted(() => {
    // Start timer
    updateCountdown()
    // Tick every second
    timer = setInterval(updateCountdown, 1000)
  })

// 6. Disable real-time countdown once user deactivates
  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

</script>

<template>
  <v-card
    class="pa-4 pa-sm-5 d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between ga-3 cursor-pointer"
    elevation="2"
    ripple
    style="background-color: #D2451E;"
    :to="to"
    variant="flat"
  >
    <!-- Left: Icon + Text Container Wrapper -->
    <div class="d-flex align-center flex-grow-1 min-width-0 w-100">
      <!-- Responsive Avatar -->
      <v-avatar class="mr-3 mr-sm-4 flex-shrink-0" color="white" rounded="lg" size="55" size-sm="48">
        <v-icon color='#D2451E'" size="30" size-sm="45">
          {{ isPassed ? 'mdi-alert-circle' : (isUrgent ? 'mdi-alert-decagram' : 'mdi-calendar-clock') }}
        </v-icon>
      </v-avatar>

      <!-- Responsive Text -->
      <div class="flex-grow-1 min-width-0">
        <div class="font-weight-bold text-white text-title-large text-sm-h3 lh-tight text-wrap">
          {{ isPassed ? 'Ordering deadline has passed' : (isUrgent ? 'Urgent: Click this banner to complete your meal selection!' : 'Click this banner to select your meals for next week') }}
        </div>

        <div class="font-weight-medium text-white text-body-2 text-sm-body-1 mt-1">
          <template v-if="isPassed">
            Meal selection is now locked for next week.
          </template>
          <template v-else-if="isUrgent">
            Deadline in:
            {{ countdown.days }}d :
            {{ String(countdown.hours).padStart(2,'0') }}hrs :
            {{ String(countdown.mins).padStart(2,'0') }}mins :
            {{ String(countdown.secs).padStart(2,'0') }}secs left!
          </template>
          <template v-else>
            Deadline in:
            {{ countdown.days }}d :
            {{ String(countdown.hours).padStart(2,'0') }}hrs :
            {{ String(countdown.mins).padStart(2,'0') }}mins :
            {{ String(countdown.secs).padStart(2,'0') }}secs left
          </template>
        </div>
      </div>
    </div>

    <!-- Arrow Icon -->
    <v-icon class="ml-auto ml-sm-2 d-none d-sm-flex" color="white" size="36" size-sm="48">]
      mdi-arrow-right
    </v-icon>
  </v-card>
</template>

<style scoped>


</style>
