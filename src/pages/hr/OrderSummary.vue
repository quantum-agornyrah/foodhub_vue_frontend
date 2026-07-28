<script setup>
  import { storeToRefs } from 'pinia'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'

  import AppShell from '@/components/layout/AppShell.vue'
  import WeekOrderTable from '@/components/orders/WeekOrderTable.vue'
  import WeekPicker from '@/components/shared/WeekPicker.vue'
  import SkeletonCard from '@/components/shared/SkeletonCard.vue'

  import { useSnackbar } from '@/composables/useSnackbar.js'
  import { getDepartmentsWithAll } from '@/constants/departments.js'
  import { useMenuStore } from '@/stores/menu.store.js'
  import { useOrderStore } from '@/stores/orders.store.js'
  import { useStaffStore } from '@/stores/staff.store.js'
  import { formatDate, getWeekDates, getWeekString } from '@/utils/dateHelpers.js'
  import { exportOrdersToExcel, exportOrdersToPDF } from '@/utils/exportHelpers.js'

  const router = useRouter()
  const { success: snackSuccess, error: snackError } = useSnackbar()

  // Initialize stores
  const staffStore = useStaffStore()
  const orderStore = useOrderStore()
  const menuStore = useMenuStore()

  const { allStaff } = storeToRefs(staffStore)
  const { allOrders } = storeToRefs(orderStore)
  const { allMenuItems } = storeToRefs(menuStore)

  // Get reactive state
  const selectedDepartment = ref('All')
  const exportFormat = ref('pdf')
  const weekOffset = ref(1)
  const isLoading = ref(false)

  // Add departments list
  const departments = computed(() => getDepartmentsWithAll())

  // Compute dates
  const rawWeekDates = computed(() => getWeekDates(weekOffset.value))

  const weekDates = computed(() => rawWeekDates.value.map(d => formatDate(d)))

  const currentWeekString = computed(() => getWeekString(rawWeekDates.value[0]))

  // Current week orders
  const currentWeekOrders = computed(() => {

    const staffMap = new Map(allStaff.value.map(s => [s.id, s]))

    return allOrders.value
      .filter(order => {
        const isThisWeek = order.weekString 
          ? order.weekString === currentWeekString.value 
          : weekDates.value.includes(order.date)

        if(!isThisWeek) return false

        // Filter by department
        if (selectedDepartment.value === 'All') return true
        const staff = staffMap.get(order.staffId)
        return (staff?.department || 'N/A') === selectedDepartment.value
      })
      .map(order => {
        const staff = staffMap.get(order.staffId)
        return {
          ...order,
          staffName: staff?.name || 'Unknown Staff',
          department: staff?.department || 'N/A',
        }
      })
  })

  // Stats
  const stats = computed(() => {
    const orders = currentWeekOrders.value
    const totalOrders = orders.length

    if (totalOrders === 0){
      return [
        { title: 'Total orders', count: 0 },
        { title: 'Most Popular', count: 'None', isText: true}
      ]
    } 

    // Find most popular item
    const itemCounts = {}
    let maxCount = 0

    for (const order of orders) {
      const name = order.menuTitle || 'Unknown'
      const count = (itemCounts[name] || 0) + 1
      itemCounts[name] = count
      if (count > maxCount) maxCount = count
    }

    // Handle tied food menu items
    const popularItems = Object.keys(itemCounts).filter(name => itemCounts[name] === maxCount)
    const mostPopular = popularItems.join(', ')

    return [
      { title: 'Total orders', count: totalOrders },
      { title: 'Most popular', count: mostPopular, isText: true },
    ]
  })

  // Add computed for week range display
  const weekRangeDisplay = computed(() => {
    const dates = getWeekDates(weekOffset.value)
    const startDate = dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endDate = dates[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${startDate} - ${endDate}`
  })

  // Fetch orders & menu items whenever weekOffset changes
  watch(weekOffset, async (newOffset) => {
    isLoading.value = true
    const weekStartDate = getWeekString(getWeekDates(newOffset)[0])

    try {
      await Promise.all([
        orderStore.getAllOrders({ week_string: weekStartDate}),
        menuStore.getAllMenuItems({ week_string: weekStartDate}),
      ])
    } catch (err) {
      console.error('Failed to load week data:', err)
      snackError('Failed to load orders for selected week')
    } finally {
      isLoading.value = false
    }
  }, { immediate: true })

  // Update handleExport function:
  function handleExport () {
    if (currentWeekOrders.value.length === 0) {
      snackError('No orders to export')
      return
    }

    try {
      // Generate filename based on department
      let filename = 'FoodHub_OrderSummary'

      if (selectedDepartment.value !== 'All') {
            const customName = selectedDepartment.value.replace(/[^a-zA-Z0-9]/g, '_')
            filename = `FoodHub_${customName}_OrderSummary`
          }

      if (exportFormat.value === 'pdf') {
        exportOrdersToPDF(
          currentWeekOrders.value,
          weekDates.value,
          weekRangeDisplay.value,
          selectedDepartment.value,
          filename,
        )
        snackSuccess('PDF exported successfully!')
      } else {
        exportOrdersToExcel(
          currentWeekOrders.value,
          weekDates.value,
          filename,
        )
        snackSuccess('Excel exported successfully!')
      }
    } catch (error) {
      console.error('Export failed:', error)
      snackError('Failed to export: ' + error.message)
    }
  }

  // Smart back button fallback helper
  function goBack() {
    if (window.history.state && window.history.state.back) {
      router.back()
    } else {
      router.push('/hr-dashboard')
    }
  }

  // Fetch staff data once on mount
  onMounted(() => {
    staffStore.getAllStaff()
  })

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
      <v-row class="d-flex mb-4 mt-n1 mt-8 align-center justify-space-between">
        <v-col class="d-flex justify-start" cols="12" md="4" sm="6">
          <h1
            class="font-weight-bold text-display-medium"
            style="letter-spacing: 0.5px; color: #D2451E;"
          >
            Order summary
          </h1>
        </v-col>

        <v-col class="d-flex justify-md-end ga-3 flex-wrap" cols="12" sm="5">
          <!-- Department Filter -->
          <v-select
            v-model="selectedDepartment"
            density="compact"
            hide-details
            :items="departments"
            label="Department"
            style="max-width: 250px;"
            variant="outlined"
          />

          <WeekPicker v-model="weekOffset"/>

          <!-- Export Format Selector + Button -->
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                class="text-capitalize font-weight-bold px-12 py-6"
                color="#D2451E"
                variant="flat"
                v-bind="props"
              >
                <v-icon class="mr-2" left>mdi-download</v-icon>
                Export {{ exportFormat.toUpperCase() }}
                <v-icon class="ml-2" right>mdi-menu-down</v-icon>
              </v-btn>
            </template>

            <v-list density="compact">
              <v-list-item
                :class="{ 'bg-orange-lighten-5': exportFormat === 'pdf' }"
                @click="exportFormat = 'pdf'; handleExport()"
              >
                <template #prepend>
                  <v-icon color="#D2451E">mdi-file-pdf-box</v-icon>
                </template>

                <v-list-item-title>Export as PDF</v-list-item-title>
              </v-list-item>

              <v-list-item
                :class="{ 'bg-orange-lighten-5': exportFormat === 'excel' }"
                @click="exportFormat = 'excel'; handleExport()"
              >
                <template #prepend>
                  <v-icon color="green">mdi-file-excel</v-icon>
                </template>

                <v-list-item-title>Export as Excel</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>

      <!-- Stats Cards Row -->
      <v-row class="mb-6">
        <v-col
          v-for="(stat, i) in stats"
          :key="i"
          cols="12"
          md="6"
        >
          <v-card
            class="pa-5 border-0"
            color="white"
            elevation="0"
            style="border: 1px solid #D2451E;"
          >
            <div class="font-weight-medium mb-1" style="font-size: 20px;">
              {{ stat.title }}
            </div>

            <div class="font-weight-medium" style="font-size: clamp(30px, 6vw, 45px); color: #1E1E1E;">
              {{ stat.count }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <v-row v-if="isLoading">
        <v-col 
          v-for = "i in 3"
          :key="i"
          cols="12"
          md="4"
          sm="12"
        >
          <SkeletonCard />
        </v-col>
      </v-row>

      <!-- Order Table -->
      <WeekOrderTable
        v-else
        :orders="currentWeekOrders"
        :week-dates="weekDates"
      />
    </div>
  </AppShell>
</template>
