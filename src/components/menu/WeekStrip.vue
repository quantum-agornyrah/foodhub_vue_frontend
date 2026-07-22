<script setup>
  import { computed } from 'vue'
  import { formatDate, getWeekDates } from '@/utils/dateHelpers.js'

// 1. Declare the two-way v-model binding
// This handles the prop receiving and emitting updates automatically
  const selectedDate = defineModel('selectedDate', {
    type: String,
    required: true,
  })

// 2. Declare remaining props 
  const props = defineProps({
    // Week duration prop
    weekOffset: {
      type: Number,
      default: 0,
    },

    // Offday prop
    offDays: {
      type: Array,
      default: () => [],
    },
  })

// 3. Get the whole week i.e from Mon - Fri of the particular offset 
// using the method form the datehelper utils
  const weekDates = computed(() => {
    return getWeekDates(props.weekOffset)
  })

// 4. Automaticall define tabs for eachday of the weekoffset
  const tabs = computed(() => {
    // List all days
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    // Loop through each Date object in the weekDates reactive array
    return weekDates.value.map((date, index) => {
      // Convert date to look like "2026-07-20"
      const dateString = formatDate(date)

      // Extract the day value from the date i.e 20
      const day = date.getDate()

      // Check if the extracted date is an offday already
      const isOffDay = props.offDays.includes(dateString)

      return {
        label: `${dayNames[index]} ${day}`,
        value: dateString,
        isOffDay,
      }
    })
  })

</script>

<template>
  <div class="d-flex ga-2 overflow-x-auto pb-2">
    <v-btn
      v-for="tab in tabs"
      :key="tab.value"
      class="text-capitalize font-weight-bold px-5"
      :class="{ 'text-decoration-line-through': tab.isOffDay }"
      :color="selectedDate === tab.value ? '#D2451E' : '#1E1E1E'"
      rounded="lg"
      :style="selectedDate === tab.value ? {} : { borderColor: '#D2451E' }"
      :variant="selectedDate === tab.value ? 'flat' : 'outlined'"
      @click="selectedDate = tab.value"
    >
      {{ tab.label }}
    </v-btn>
  </div>
</template>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #D2451E;
  border-radius: 10px;
}
</style>
