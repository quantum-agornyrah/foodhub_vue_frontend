<script setup>
  // File-based routing meta definition
  definePage({
    name: 'MenuManager',
    path: '/menu-manager',
    meta: {
      requiresAuth: true,
      roles: ['hr'],
    },
  })

  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import AppShell from '@/components/layout/AppShell.vue'
  import FoodFormDialog from '@/components/menu/FoodFormDialog.vue'
  import BulkFoodFormDialog from '@/components/menu/BulkFoodFormDialog.vue'
  import OffDayDialog from '@/components/menu/OffDayDialog.vue'
  import WeekStrip from '@/components/menu/WeekStrip.vue'
  import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
  import WeekPicker from '@/components/shared/WeekPicker.vue'
  import SkeletonCard from '../../components/shared/SkeletonCard.vue'

  import { useSnackbar } from '@/composables/useSnackbar.js'
  import { useWeekMenu } from '@/composables/useWeekMenu.js'
  import { formatDate, getWeekDates, getWeekString, parseLocalDate } from '@/utils/dateHelpers.js'

  const router = useRouter()
  const route = useRoute()
  const { success: snackSuccess, error: snackError } = useSnackbar()

  // Week offset state
  const weekOffset = ref(1)

  // Use the composable
  const { weekMenu, weekDays, activeDay, activeDayMenu, activeDayIsOff, isLoading, fetchWeekMenu, setActiveDay, createMenu, createBulkMenu, updateMenu, deleteMenu} = useWeekMenu()

  // Dialog states
  const showFoodDialog = ref(false)
  const showBulkFoodDialog = ref(false)
  const showOffDayDialog = ref(false)
  const showDeleteDialog = ref(false)

  const itemToDelete = ref(null)
  const editingFood = ref(null)

  // Fetch data on mount
  onMounted(async () => {
    let targetDate

    // When HR wants to access the menu for other weeks aside the current week.
    if (route.query.date) {
      // Polish the timezone of the date in the route path
      targetDate = parseLocalDate(route.query.date)
    } else {
      // Fallback to Monday of weekOffset
      const dates = getWeekDates(weekOffset.value)
      targetDate = dates[0]
    }

    const weekStartDate = getWeekString(targetDate)
    await fetchWeekMenu(weekStartDate)
    setActiveDay(formatDate(targetDate))
  })

  // Watch for route query changes
  watch(() => route.query.date, newDate => {
    if (newDate) {
      setActiveDay(newDate)
    }
  })

  // Watch for week changes
  watch(weekOffset, (newOffset) => {
    const dates = getWeekDates(newOffset)
    const mondayDate = getWeekString(dates[0])

    setActiveDay(formatDate(dates[0]))
    fetchWeekMenu(mondayDate)
  })

  // Selected day info
  const selectedDayInfo = computed(() => {
    if (!activeDay.value) return null

    // ParseLocalDate to avoid timezone issues
    const date = parseLocalDate(activeDay.value)
    const options = { weekday: 'long', month: 'short', day: 'numeric' }
    const formatted = date.toLocaleDateString('en-US', options)

    return {
      formatted,
      itemCount: activeDayMenu.value.length,
    }
  })

  // Off days list for week strip
  const offDaysList = computed(() => {
    return weekDays.value
      .filter(d => d.status === 'off_day' || d.status === 'holiday')
      .map(d => d.date)
  })

  // Add food item
  function handleAddFood () {
    editingFood.value = null
    showFoodDialog.value = true
  }

  //Add bulk food items
  function handleAddMultipleFoods () {
    showBulkFoodDialog.value = true
  }

  // Edit food item
  function handleEditFood (item) {
    editingFood.value = item
    showFoodDialog.value = true
  }

  // Delete food item
  function handleDeleteFood (item) {
    itemToDelete.value = item
    showDeleteDialog.value = true
  }

  // Actually delete after confirmation
  async function confirmDelete () {
    if (!itemToDelete.value) return

    const success = await deleteMenu(itemToDelete.value.id)
    if (success) {
      snackSuccess('Food item deleted successfully')
    } else {
      snackError('Failed to delete food item')
    }

    // Close dialog and reset
    showDeleteDialog.value = false
    itemToDelete.value = null
  }

  // Cancel delete
  function cancelDelete () {
    showDeleteDialog.value = false
    itemToDelete.value = null
  }

  // Save food item (create or update)
  async function handleSaveFood (foodData) {
    if (!editingFood.value?.id) {
      snackError('No food item selected for editing')
      return
    }

    if (activeDayIsOff.value) {
      snackError('Cannot edit food items on an off day')
      return
    }

    try {
      const localDate = parseLocalDate(activeDay.value)
      const dayName = localDate.toLocaleDateString('en-US', { weekday: 'long' })

      const data = {
        ...foodData,
        day: dayName,
        date: activeDay.value,
        weekString: getWeekString(localDate),
      }

      const success = await updateMenu(editingFood.value.id, data)

      if (success) {
        showFoodDialog.value = false
        snackSuccess('Food item updated')
      } else {
        snackError('Failed to update food item')
      }
    } catch (error) {
      console.error('Error updating food item:', error)
      snackError('Food update failed')
    }
  }

  //Save Bulk food items
  async function handleSaveBulkFoods (foods) {
    if (activeDayIsOff.value) {
      snackError('Cannot add food items to an off day')
      return
    }

    try {
      const localDate = parseLocalDate(activeDay.value)
      const dayName = localDate.toLocaleDateString('en-US', { weekday: 'long' })

      const items = foods.map(food => ({
        ...food,
        day: dayName,
        date: activeDay.value,
        weekString: getWeekString(localDate),
        imageUrl: food.imageUrl || '',
        status: null,
      }))

      const success = await createBulkMenu(items)

      if (success) {
        showBulkFoodDialog.value = false
        snackSuccess(`${items.length} food item${items.length === 1 ? '' : 's'} added`)
      } else {
        snackError('Failed to add food items')
      }
    } catch (error) {
      console.error('Error saving bulk foods:', error)
      snackError('Failed to add food items')
    }
  }

  // Mark as off day
  function handleMarkOffDay () {
    showOffDayDialog.value = true
  }

  // Smart back button fallback helper
  function goBack() {
    if (window.history.state && window.history.state.back) {
      router.back()
    } else {
      router.push('/hr-dashboard')
    }
  }
</script>

<template>
  <AppShell>
    <div style="max-width: 1400px; margin: 0 auto; padding: 0 16px;">
      <!-- Back button -->
      <v-row class="d-flex align-center justify-space-between">
        <v-col class="d-flex justify-start align-center" cols="12" sm="6">
          <v-btn
            prepend-icon="mdi-arrow-left"
            variant="flat"
            color="#D2451E"
            class="mr-2 mt-4"
            @click="goBack"
          > 
          Go back 
          </v-btn>
        </v-col>
      </v-row>

      <!-- Page Header -->
      <v-row class="mb-4 mt-n1 d-flex align-center justify-space-between">
        <v-col class="d-flex justify-start" cols="12" sm="6">
          <h1
            class="font-weight-bold text-display-medium"
            style="letter-spacing: 0.5px; color: #D2451E !important;"
          >
            Menu manager
          </h1>
        </v-col>

        <!-- 1. Week Navigation -->
        <v-col class="d-flex justify-md-end ga-3 flex-wrap" cols="12" sm="5">
          <WeekPicker v-model="weekOffset"/>
        </v-col>
      </v-row>

      <!-- 2. Day Selection Tabs -->
      <div class="mb-6">
        <WeekStrip
          :off-days="offDaysList"
          :selected-date="activeDay"
          :week-offset="weekOffset"
          @update:selected-date="setActiveDay"
        />
      </div>

      <!-- 3. Selected Day Card -->
      <v-card
        v-if="selectedDayInfo"
        class="mb-6 pa-6"
        elevation="0"
        style="border: 1px solid #D2451E;"
      >
        <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-center ga-4 mb-6">
          <div>
            <h2 class="font-weight-bold" style="color: #1E1E1E;">
              {{ selectedDayInfo.formatted }}
            </h2>
            <div class="text-caption" style="color: #1E1E1E; font-size: 16px;">
              {{ selectedDayInfo.itemCount }} items
            </div>
          </div>
          <v-btn
            color="#D2451E"
            variant="flat"
            prepend-icon="mdi-plus"
            class="text-capitalize font-weight-bold px-6 w-100 w-sm-auto"
            @click="handleAddMultipleFoods"
          >
            Add food item
          </v-btn>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="d-flex flex-column ga-2">
          <SkeletonCard v-for="i in 3" :key="i" />
        </div>

        <!-- Food Items List -->
        <div v-else-if="activeDayMenu.length > 0" class="d-flex flex-column ga-2">
          <v-card
            v-for="item in activeDayMenu"
            :key="item.id"
            class="pa-4"
            color="grey-lighten-5"
            elevation="0"
            rounded="lg"
          >
            <div class="d-flex flex-column flex-sm-row ga-4 align-start align-sm-center">
              <div class="d-flex ga-4 align-center flex-grow-1 w-100">
                <!-- Food Image/Icon -->
                <v-avatar size="56" rounded="lg" class="flex-shrink-0">
                  <v-img
                    v-if="item.imageUrl"
                    :src="item.imageUrl"
                    :alt="item.title"
                    cover
                    loading="lazy"
                  >
                    <template #error>
                      <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                        <v-icon color="#D2451E" size="32">mdi-food</v-icon>
                      </div>
                    </template>
                  </v-img>
                  <v-icon v-else color="#D2451E" size="32">mdi-food</v-icon>
                </v-avatar>

                <!-- Food Details -->
                <div class="min-width-0">
                  <div class="font-weight-bold text-truncate" style="color: #1E1E1E; font-size: 17px;">
                    {{ item.title }}
                  </div>
                  <div class="text-caption" style="color: #666666;">
                    {{ item.description }}
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex ga-2 w-100 w-sm-auto justify-end">
                <v-btn
                  icon="mdi-pencil-outline"
                  variant="outlined"
                  size="small"
                  style="border-color: #D2451E;"
                  @click="handleEditFood(item)"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  variant="outlined"
                  size="small"
                  color="#D2451E"
                  @click="handleDeleteFood(item)"
                />
              </div>
            </div>
          </v-card>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <v-icon color="#1E1E1E" size="48">
            mdi-food-off-outline
          </v-icon>

          <div class="font-weight-bold" style="font-size: 20px; color: #1E1E1E;">
            No items for this day
          </div>
        </div>
      </v-card>

      <!-- Mark as Off Day Section -->
      <v-card
        class="pa-6 mb-14"
        elevation="0"
        style="border: 1px solid #D2451E !important;"
      >
        <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-center ga-4">
          <div class="font-weight-bold" style="color: #1E1E1E;">
            Mark this day as off / holiday
          </div>
          <v-btn
            color="#D2451E"
            variant="outlined"
            prepend-icon="mdi-calendar-remove"
            class="text-capitalize font-weight-bold px-8 w-100 w-sm-auto"
            @click="handleMarkOffDay"
          >
            Set off day
          </v-btn>
        </div>
      </v-card>
    </div>

    <!-- 4. Dialogs -->
    <FoodFormDialog
      v-model="showFoodDialog"
      :food-item="editingFood"
      :loading="isLoading"
      @save="handleSaveFood"
    />

    <BulkFoodFormDialog
      v-model="showBulkFoodDialog"
      :loading="isLoading"
      @save="handleSaveBulkFoods"
    />

    <OffDayDialog
      v-model="showOffDayDialog"
      :selected-date="activeDay"
    />

    <ConfirmDialog
      v-model="showDeleteDialog"
      cancel-label="Cancel"
      confirm-color="#D2451E"
      confirm-label="Delete"
      icon="mdi-delete-alert-outline"
      :message="`Are you sure you want to delete '${itemToDelete?.title}'? This action cannot be undone.`"
      title="Delete Food Item"
      :loading="isLoading"
      @cancel="cancelDelete"
      @confirm="confirmDelete"
    />
  </AppShell>
</template>
