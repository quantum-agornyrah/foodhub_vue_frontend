<script setup>
  import { computed } from 'vue'
  import { formatDate, getWeekDates } from '@/utils/dateHelpers.js'

  const props = defineProps({
    weekOffset: {
      type: Number,
      default: 0,
    },
    selectedDate: {
      type: String,
      required: true,
    },
    offDays: {
      type: Array,
      default: () => [],
    },
  })

  const emit = defineEmits(['update:selectedDate'])

  const weekDates = computed(() => {
    return getWeekDates(props.weekOffset)
  })

  const tabs = computed(() => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

    return weekDates.value.map((date, index) => {
      const dateString = formatDate(date)
      const day = date.getDate()
      const isOffDay = props.offDays.includes(dateString)
      const isSelected = dateString === props.selectedDate

      return {
        label: `${dayNames[index]} ${day}`,
        value: dateString,
        isOffDay,
        isSelected,
      }
    })
  })

  function selectDay (dateString) {
    emit('update:selectedDate', dateString)
  }
</script>

<template>
  <div class="d-flex ga-2 overflow-x-auto pb-2">
    <v-btn
      v-for="tab in tabs"
      :key="tab.value"
      class="text-capitalize font-weight-bold px-6"
      :class="{ 'text-decoration-line-through': tab.isOffDay }"
      :color="tab.isSelected ? '#D2451E' : undefined"
      rounded="lg"
      :style="tab.isSelected ? {} : { borderColor: '#D2451E', color: '#1E1E1E' }"
      :variant="tab.isSelected ? 'flat' : 'outlined'"
      @click="selectDay(tab.value)"
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
