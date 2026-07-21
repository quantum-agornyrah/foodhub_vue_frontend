<script setup>
  import { computed } from 'vue'
  import { getWeekDates, getWeekLabel } from '@/utils/dateHelpers.js'

// 1. Declare the two-way v-model binding
// This handles the prop receiving and emitting updates automatically
// Week offset (0 = current week, -1 = last week, 1 = next week)
  const offset = defineModel({
    type: Number,
    default: 0,
  })

// 2. Point to the getWeekLabel function already defined and feed it with the default value
  const weekLabel = computed(() => {
    return getWeekLabel(offset.value)
  })

  // Function to reduce the value of the offset by 1 -> Previous week
  function goToPreviousWeek () {
    offset.value--
  }

  // Function to increase the value of the offset by 1 -> Next week
  function goToNextWeek () {
    offset.value++
  }
</script>

<template>
  <div
    class="d-flex align-center border px-1 py-2 bg-white"
    style="border-color: #D2451E !important;"
  >
    <!-- Previous Week Button -->
    <v-btn
      density="comfortable"
      icon="mdi-chevron-left"
      size="small"
      variant="text"
      @click="goToPreviousWeek"
    />

    <!-- Week Display -->
    <div class="font-weight-medium px-3">
      {{ weekLabel }}
    </div>

    <!-- Next Week Button -->
    <v-btn
      density="comfortable"
      icon="mdi-chevron-right"
      size="small"
      variant="text"
      @click="goToNextWeek"
    />
  </div>
</template>
