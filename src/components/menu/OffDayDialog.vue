<script setup>
  import { computed, ref } from 'vue'
  import { useSnackbar } from '@/composables/useSnackbar.js'
  import { useWeekMenu } from '@/composables/useWeekMenu.js'
  import { getWeekString, parseLocalDate } from '@/utils/dateHelpers.js'

  // Get methods from helpers and composables
  const { success: snackSuccess, error: snackError } = useSnackbar()
  const { deleteMenu, createMenu, activeDayMenu } = useWeekMenu()

  // Form data
  const offDayType = ref('off_day')
  const reason = ref('')
  const isLoading = ref(false)

  // Off day types
  const offDayTypes = [
    { title: 'Off Day', value: 'off_day', icon: 'mdi-calendar-remove' },
    { title: 'Public Holiday', value: 'holiday', icon: 'mdi-calendar-star' },
  ]

// 1. Declare the two-way v-model binding
// This handles the prop receiving and emitting updates automatically
  const offDayDialog = defineModel({
    type: Boolean,
    default: false,
  })

// 2. Declare remaining props 
  const props = defineProps({
    // Selected date for offday prop
    selectedDate: {
      type: String,
      required: true,
    },
  })

// 3. Parse selected date for offday to avoid timezone issues
  const parsedDate = computed(() => {
    // If date is not selected
    if (!props.selectedDate) return null

    // If a particular date is selected
    // Define the date and parse it to get the correct timezone of that particular date
    return parseLocalDate(props.selectedDate)
  })

// 4. Format the parsed date to look like = Monday, March 2, 2026
  const formattedSelectedDate = computed(() => {
    // If date is not selected
    if (!parsedDate.value) return ''

    // If a particular date is selected
    return parsedDate.value.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  })

  // Function to close dialog
  function handleClose () {
    // 1. Clear form
    resetForm ()

    // 2. Disable dialog
    offDayDialog.value = false
  }

  // Function to clear form
  function resetForm () {
    offDayType.value = 'off_day'
    reason.value = ''
  }

// 4. Function to execute mark as offday or submit offday
  async function handleMarkOffDay () {
    // Return error notification when no date is selcted
    if (!props.selectedDate) {
      snackError('No date selected')
      return
    }

    // Enable the loading spin when a date is selected
    isLoading.value = true

    try {
      // Delete existing menu items in the selected dateconcurrently
      const itemsToDelete = activeDayMenu.value || []
        if (itemsToDelete.length > 0) {
          await Promise.all(itemsToDelete.map((item) => deleteMenu(item.id)))
      }

      // Create a special "off day" marker item to fit the backend database model
      const offDayData = {
        title: offDayType.value === 'holiday' ? 'Public Holiday' : 'Off Day',
        description: reason.value || 'This day is marked as off',
        day: parsedDate.value.toLocaleDateString('en-US', { weekday: 'long' }),
        date: props.selectedDate,
        weekString: getWeekString(parsedDate.value),
        type: 'Off Day',
        imageUrl: '',
        status: offDayType.value,
      }

      // Create the marker item by executing the createmenu API call
      await createMenu(offDayData)

      // Toast notification after success
      snackSuccess('Day marked as off successfully')

      // Close dialog
      handleClose()
    } catch (error) {
      console.error('Error marking off day:', error)
      // Toast notification after error
      snackError('Failed to mark day as off')
    } finally {
      isLoading.value = false
    }
  }
</script>

<template>
  <v-dialog
    max-width="600"
    v-model="offDayDialog"
    persistent
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
