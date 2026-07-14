<script setup>
  import { computed, ref, watch } from 'vue'
  import { useSnackbar } from '@/composables/useSnackbar.js'
  import { useWeekMenu } from '@/composables/useWeekMenu.js'
  import { DAY_STATUS } from '@/constants/dayStatus.js'
  import { getWeekString, parseLocalDate } from '@/utils/dateHelpers.js'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    selectedDate: {
      type: String,
      required: true,
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const { success: snackSuccess, error: snackError } = useSnackbar()
  const { deleteMenu, createMenu, fetchWeekMenu, activeDayMenu } = useWeekMenu()

  // Format selected date to avoid timezone issues
  const formattedSelectedDate = computed(() => {
    if (!props.selectedDate) return ''

    const date = parseLocalDate(props.selectedDate)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  })

  // Form data
  const offDayType = ref('off_day')
  const reason = ref('')
  const isLoading = ref(false)

  // Off day types
  const offDayTypes = [
    { title: 'Off Day', value: 'off_day', icon: 'mdi-calendar-remove' },
    { title: 'Public Holiday', value: 'holiday', icon: 'mdi-calendar-star' },
  ]

  // Watch dialog close
  watch(() => props.modelValue, newVal => {
    if (!newVal) {
      resetForm()
    }
  })

  function resetForm () {
    offDayType.value = 'off_day'
    reason.value = ''
  }

  function handleClose () {
    emit('update:modelValue', false)
  }

  async function handleMarkOffDay () {
    if (!props.selectedDate) {
      snackError('No date selected')
      return
    }

    isLoading.value = true

    try {
      // Delete all menu items for this day
      const itemsToDelete = activeDayMenu.value

      for (const item of itemsToDelete) {
        await deleteMenu(item.id)
      }

      // Create a special "off day" marker item
      // You might want to adjust this based on your backend structure
      const offDayData = {
        title: offDayType.value === 'holiday' ? 'Public Holiday' : 'Off Day',
        description: reason.value || 'This day is marked as off',
        day: new Date(props.selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
        date: props.selectedDate,
        weekString: getWeekString(parseLocalDate(props.selectedDate)),
        type: 'Off Day',
        imageUrl: '',
        status: offDayType.value,
      }

      // Note: You may need to adjust your backend to handle "off day" status
      // For now, this creates a marker item
      await createMenu(offDayData)

      snackSuccess('Day marked as off successfully')
      handleClose()
    } catch (error) {
      console.error('Error marking off day:', error)
      snackError('Failed to mark day as off')
    } finally {
      isLoading.value = false
    }
  }
</script>

<template>
  <v-dialog
    max-width="600"
    :model-value="modelValue"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card elevation="0" style="border: 2px solid #D2451E;">
      <!-- Dialog Header -->
      <v-card-title class="px-8" style="background-color: #D2451E;">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center ga-3">
            <v-icon color="white" size="26">mdi-calendar-remove</v-icon>

            <h2 class="text-title-medium font-weight-bold text-white">
              Mark as Off Day
            </h2>
          </div>

          <v-btn
            color="white"
            icon="mdi-close"
            variant="text"
            @click="handleClose"
          />
        </div>
      </v-card-title>

      <!-- Dialog Content -->
      <v-card-text class="px-8 pt-10">
        <!-- Warning Message -->
        <v-alert
          class="mb-6"
          type="info"
          variant="tonal"
        >
          <div class="">
            <strong>Note:</strong> Marking this day as off will remove all existing menu items for this day.
          </div>
        </v-alert>

        <!-- Selected Date -->
        <div class="mb-6 pa-4" style="background-color: white; border: 1px solid #D2451E;">
          <div class="text-caption" style="color: #1E1E1E;">
            Selected Date
          </div>

          <div class="text-h6 font-weight-bold" style="color: #1E1E1E;">
            {{ formattedSelectedDate }}
          </div>
        </div>

        <!-- Off Day Type -->
        <div>
          <label class="font-weight-bold mb-3 d-block" style="color: #1E1E1E;">
            <v-icon class="mr-2">mdi-calendar-alert</v-icon>
            Select Type
          </label>

          <v-radio-group v-model="offDayType" inline>
            <v-radio
              v-for="type in offDayTypes"
              :key="type.value"
              color="#D2451E"
              :label="type.title"
              :value="type.value"
            >
              <template #label>
                <div class="d-flex align-center ga-2">
                  <v-icon :icon="type.icon" size="20" />
                  <span>{{ type.title }}</span>
                </div>
              </template>
            </v-radio>
          </v-radio-group>
        </div>

        <!-- Reason (Optional) -->
        <div>
          <label class="font-weight-bold mb-2 d-block" style="color: #1E1E1E;">
            <v-icon class="mr-2">mdi-note-text-outline</v-icon>
            Reason (optional)
          </label>

          <v-textarea
            v-model="reason"
            placeholder="e.g., Christmas Day, Staff Training Day..."
            rows="2"
            variant="outlined"
          />
        </div>
      </v-card-text>

      <!-- Dialog Actions -->
      <v-card-actions class="pa-4 pa-sm-6 pt-0 d-flex flex-column-reverse flex-sm-row justify-end ga-3">
        <v-spacer class="d-none d-sm-block" />

        <v-btn
          class="text-capitalize font-weight-bold px-sm-14 w-100 w-sm-auto"
          color="#1E1E1E"
          :disabled="isLoading"
          variant="outlined"
          @click="handleClose"
        >
          Cancel
        </v-btn>

        <v-btn
          class="text-capitalize font-weight-bold px-sm-8 w-100 w-sm-auto ml-0 ml-sm-2"
          color="#D2451E"
          :loading="isLoading"
          prepend-icon="mdi-calendar-remove"
          variant="flat"
          @click="handleMarkOffDay"
        >
          Mark as Off Day
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
