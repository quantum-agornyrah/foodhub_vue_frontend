<script setup>
  import { storeToRefs } from 'pinia'
  import { computed, onMounted, ref } from 'vue'
  import AppShell from '@/components/layout/AppShell.vue'
  import WeekOrderTable from '@/components/orders/WeekOrderTable.vue'
  import WeekPicker from '@/components/shared/WeekPicker.vue'
  import { useSnackbar } from '@/composables/useSnackbar.js'
  import { getDepartmentsWithAll } from '@/constants/departments.js'
  import { useMenuStore } from '@/stores/menu.store.js'
  import { useOrderStore } from '@/stores/orders.store.js'
  import { useStaffStore } from '@/stores/staff.store.js'
  import { formatDate, getWeekDates, getWeekString } from '@/utils/dateHelpers.js'
  import { exportOrdersToExcel, exportOrdersToPDF } from '@/utils/exportHelpers.js'

  const { success: snackSuccess, error: snackError } = useSnackbar()

  // Initialize stores
  const staffStore = useStaffStore()
  const orderStore = useOrderStore()
  const menuStore = useMenuStore()

  // Get reactive state
  const { allStaff } = storeToRefs(staffStore)
  const { allOrders } = storeToRefs(orderStore)
  const { allMenuItems } = storeToRefs(menuStore)
  const selectedDepartment = ref('All')
  const exportFormat = ref('pdf') // 'pdf' or 'excel'

  // Week offset state
  const weekOffset = ref(0)
  const isLoading = ref(false)

  // Fetch data on mount
  onMounted(async () => {
    isLoading.value = true
    await Promise.all([
      staffStore.getAllStaff(),
      orderStore.getAllOrders(),
      menuStore.getAllMenuItems(),
    ])
    isLoading.value = false
  })

  // Week change handler
  function handleWeekChange (newOffset) {
    weekOffset.value = newOffset
  }

  // Get week dates
  const weekDates = computed(() => {
    return getWeekDates(weekOffset.value).map(date => formatDate(date))
  })

  // Current week orders
  const currentWeekOrders = computed(() => {
    const weekString = getWeekString(getWeekDates(weekOffset.value)[0])

    return allOrders.value
      .filter(order => {
        if (order.weekString) {
          return order.weekString === weekString
        }
        return weekDates.value.includes(order.date)
      })
      .map(order => {
        // Enrich order with staff data
        const staff = allStaff.value.find(s => s.id === order.staffId)
        return {
          ...order,
          staffName: staff?.name || 'Unknown Staff',
          department: staff?.department || 'N/A', // ✨ ADD THIS
        }
      })
      .filter(order => {
        // Filter by department
        if (selectedDepartment.value === 'All') return true
        return order.department === selectedDepartment.value
      })
  })

  // Add departments list
  const departments = computed(() => getDepartmentsWithAll())

  // Stats
  const stats = computed(() => {
    const orders = currentWeekOrders.value

    const totalOrders = orders.length

    // Find most popular item
    const itemCounts = {}
    for (const order of orders) {
      const itemName = order.menuTitle || 'Unknown'
      itemCounts[itemName] = (itemCounts[itemName] || 0) + 1
    }

    const mostPopular = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

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
        // Clean department name for filename (remove special characters, replace spaces with underscores)
        const deptName = selectedDepartment.value
          .replace(/\s+-\s+/g, '_') // Replace " - " with "_"
          .replace(/\s+/g, '_') // Replace spaces with "_"
          .replace(/[^a-zA-Z0-9_]/g, '') // Remove special characters

        filename = `FoodHub_${deptName}_OrderSummary`
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

</script>

<template>
  <AppShell>
    <div style="max-width: 1400px; margin: 0 auto; padding: 0 16px;">
      <!-- Page Header -->
      <v-row class="d-flex mb-4 mt-8 align-center justify-space-between">
        <v-col class="d-flex justify-start" cols="12" md="4" sm="6">
          <h1
            class="font-weight-bold text-display-medium"
            style="letter-spacing: 0.5px; color: #D2451E !important;"
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
            style="max-width: 226px;"
            variant="outlined"
          />

          <WeekPicker
            :model-value="weekOffset"
            @update:model-value="handleWeekChange"
          />

          <!-- Export Format Selector + Button -->
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                class="text-capitalize font-weight-bold px-13 py-6"
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
            style="border: 1px solid #D2451E !important;"
          >
            <div class="font-weight-medium mb-1" style="font-size: 20px;">
              {{ stat.title }}
            </div>

            <div class="font-weight-medium" style="font-size: 45px; color: #1E1E1E;">
              {{ stat.count }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <v-progress-circular color="#D2451E" indeterminate size="45" />
        <div class="mt-4">Loading orders...</div>
      </div>

      <!-- Order Table -->
      <WeekOrderTable
        v-else
        :orders="currentWeekOrders"
        :week-dates="weekDates"
      />
    </div>
  </AppShell>
</template>
