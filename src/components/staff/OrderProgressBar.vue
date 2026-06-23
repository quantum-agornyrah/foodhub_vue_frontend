<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    selectedCount: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 5,
    },
  })

  // Calculate percentage progress
  const progressPercent = computed(() => {
    if (!props.totalCount) return 0
    return Math.min(100, (props.selectedCount / props.totalCount) * 100)
  })
</script>

<template>
  <div class="mb-6">
    <div class="d-flex align-center justify-space-between mb-2">
      <span class="text-subtitle-2 font-weight-medium text-grey-darken-3">
        <span class="font-weight-bold" style="color: #1E1E1E;">{{ selectedCount }}</span> of {{ totalCount }} days selected
      </span>
    </div>

    <!-- Linear progress bar -->
    <v-progress-linear
      bg-color="#E0E0E0"
      bg-opacity="1"
      color="#D2451E"
      height="8"
      :model-value="progressPercent"
      rounded
    />
  </div>
</template>

<style scoped>
:deep(.v-progress-linear) {
  border-radius: 4px;
}
</style>
