<script setup>
  import { computed } from 'vue'
  // Use your existing helper functions
  import { getWeekDates, getWeekLabel } from '@/utils/dateHelpers.js'

  const props = defineProps({
    modelValue: {
      type: Number, // Week offset (0 = current week, -1 = last week, 1 = next week)
      default: 0,
    },
  })

  const emit = defineEmits(['update:modelValue'])

  // Use your existing getWeekLabel function
  const weekLabel = computed(() => {
    return getWeekLabel(props.modelValue)
  })

  function goToPreviousWeek () {
    emit('update:modelValue', props.modelValue - 1)
  }

  function goToNextWeek () {
    emit('update:modelValue', props.modelValue + 1)
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
