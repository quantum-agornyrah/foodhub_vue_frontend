<script setup>
  import { computed } from 'vue'

  import { useOrderStore } from '@/stores/orders.store'
  const orderStore = useOrderStore()

  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'submitted', // 'submitted', 'in_progress'
    },
    days: {
      type: Array,
      required: true,
    // Array of { label: 'Mon', selection: 'Jollof rice' | null, status: 'open' | 'off_day' | 'holiday' }
    },
    highlight: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['review'])

  // Status chip helper
  const statusDetails = computed(() => {
    if (props.status === 'in_progress') {
      return {
        text: 'In progress',
        color: 'yellow',
        textColor: 'white',
      }
    }
    return {
      text: 'Submitted',
      color: '#E8F5E9',
      textColor: '#2E7D32',
    }
  })
</script>

<template>
  <v-card
    class="pa-5 mb-5"
    color="#D2451E"
    variant="flat"
  >
    <!-- Header Row -->
    <div class="d-flex align-center justify-space-between mb-1">
      <div class="font-weight-bold text-white" style="font-size: 20px;">
        {{ title }}
      </div>

      <!-- Status Badge -->
      <v-chip
        class="font-weight-medium"
        :color="statusDetails.color"
        size="small"
        :text-color="statusDetails.textColor"
        variant="flat"
      >
        {{ statusDetails.text }}
      </v-chip>
    </div>

    <!-- Subtitle -->
    <div class="text-caption mb-4">
      {{ subtitle }}
    </div>

    <!-- 5 Days Row -->
    <v-row class="ma-0 ga-3 d-flex">
      <v-col
        v-for="(day, idx) in days"
        :key="idx"
        class="pa-0 flex-grow-1 flex-shrink-0"
        width="100%"
      >
        <!-- Individual Day Card -->
        <v-card
          class="pa-3 rounded-lg text-center d-flex flex-column justify-center"
          height="100%"
          :style="{
            backgroundColor: day.status === 'off_day' || day.status === 'holiday' ? '#FFEBEE' : 'white',
            border: day.status === 'off_day' || day.status === 'holiday' ? '1px solid #FFCDD2' : 'none'
          }"
          variant="flat"
        >
          <!-- Day Label -->
          <div class="font-weight-medium text-caption text-grey-darken-1 mb-1">
            {{ day.label }}
          </div>

          <!-- Selection Title -->
          <div
            class="text-caption text-md-body-2 font-weight-medium"
            :style="{
              color: day.status === 'off_day' || day.status === 'holiday' ? '#C62828' : (day.selection ? '#1E1E1E' : '#8C8C8C')
            }"
          >
            <template v-if="day.status === 'off_day' || day.status === 'holiday'">
              Off day
            </template>

            <template v-else>
              {{ day.selection || '–' }}
            </template>
          </div>

          <!-- Review Button -->
          <v-btn
            v-if="day.selection && status === 'submitted' && day.order"
            class="mt-2 px-1 text-capitalize"
            color="#D2451E"
            size="small"
            variant="flat"
            @click="emit('review', day.order)"
          >
          {{ day.order.rating ? 'Edit review' : 'Leave a review' }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<style scoped>

</style>
