<script setup>
  import { computed } from 'vue'

// 1. Props Definition
  const props = defineProps({
    // Selected food items prop
    selectedCount: {
      type: Number,
      default: 0,
    },

    // Total selections prop
    totalCount: {
      type: Number,
      default: 5,
    },
  })

// 2. Logic to calculate progress bar percentatge
  const progressPercent = computed(() => {
    // If no items are added to menu to select
    if (!props.totalCount) return 0

    // Math.min(100, ) = Force calculation to return greater numbers than 100 to be 100
    // * 100 causes results to land in percentage
    return Math.min(100, (props.selectedCount / props.totalCount) * 100)
  })
</script>

<template>
  <div class="mb-6">
    <div class="d-flex align-center justify-space-between mb-2">
      <span class="text-subtitle-2 font-weight-medium text-grey-darken-3">
        <span class="font-weight-bold" style="color: #1E1E1E;">{{ selectedCount }}</span> 
        of {{ totalCount }} days selected
      </span>
    </div>

    <!-- Linear progress bar -->
    <v-progress-linear
      bg-color="#E0E0E0"
      bg-opacity="1"
      color="#D2451E"
      :model-value="progressPercent"
      rounded
    />
  </div>
</template>

<style scoped>

</style>
