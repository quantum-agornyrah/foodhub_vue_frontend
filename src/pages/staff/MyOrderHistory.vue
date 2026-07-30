<script setup>
  // File-based routing meta definition
  definePage({
    name: 'MyOrderHistory',
    path: '/my-order-history',
    meta: {
      requiresAuth: true,
      roles: ['staff'],
    },
  })

  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  import AppShell from '@/components/layout/AppShell.vue'
  import ReviewDialog from '@/components/shared/ReviewDialog.vue'

  import { useAuth } from '@/composables/useAuth'
  import { useMenuStore } from '@/stores/menu.store'
  import { useOrderStore } from '@/stores/orders.store'
  import { getWeekString, parseLocalDate } from '@/utils/dateHelpers'
  import { useSnackbar } from '@/composables/useSnackbar'
  import SkeletonCard from '@/components/shared/SkeletonCard.vue'

  const router = useRouter()

  // Load auth, order store, and menu store
  const { user } = useAuth()
  const orderStore = useOrderStore()
  const menuStore = useMenuStore()
  const { success: snackSuccess, error: snackError } = useSnackbar()

  const isLoading = ref(true)
  const search = ref('')
  const selectedMonth = ref('All Months')

  // Review Dialog Logic
  const showReviewDialog = ref(false)
  const selectedOrderToReview = ref(null)

  const headers = [
    { title: 'Week Date', key: 'title', sortable: false, width: '250px' },
    { title: 'Monday', key: 'days.0', sortable: false, align: 'center', width: '150px' },
    { title: 'Tuesday', key: 'days.1', sortable: false, align: 'center', width: '150px' },
    { title: 'Wednesday', key: 'days.2', sortable: false, align: 'center', width: '150px' },
    { title: 'Thursday', key: 'days.3', sortable: false, align: 'center', width: '150px' },
    { title: 'Friday', key: 'days.4', sortable: false, align: 'center', width: '150px' },
    { title: 'Status', key: 'status', sortable: false, align: 'center', width: '50px' },
  ]


  function goBack() {
    if (window.history.state && window.history.state.back) {
      router.back()
    } else {
      router.push('/staff-dashboard')
    }
  }

  // Fetch all orders and menu configurations on mount
  onMounted(async () => {
    try {
      await Promise.all([
        orderStore.getMyOrders(user.value.id),
        menuStore.getAllMenuItems(),
      ])

      // Check and auto-update expired orders
      const didNotUpdate = await checkAndUpdateExpiredOrders()
      if (didNotUpdate) {
        await orderStore.getMyOrders(user.value.id)
      }
    } catch (error) {
      console.error('Failed to load history data:', error)
    } finally {
      isLoading.value = false
    }
  })

  // Function to open review dialog
  function openReview (order) {
    if (!order) return
    selectedOrderToReview.value = order
    showReviewDialog.value = true
  }

  // Function to execute the submit-review emit on a selected order called 'review'
  async function handleReviewSubmit (review) {
    try {
      const success = await orderStore.updateOrder(review.id, {
        rating: review.rating,
        comment: review.comment,
      })

      if (!success){
        snackError('Failed to submit review')
        return
      }

      // Return success notification & refresh table
      snackSuccess('Review submitted successfully')
      await orderStore.getMyOrders(user.value.id)

      // Update the selected order ref with fresh data
      const updatedOrder = orderStore.myOrders.find(o => o.id === review.id)
      if (updatedOrder) {
        selectedOrderToReview.value = updatedOrder
      }
      showReviewDialog.value = false

    } catch (error) {
      console.error('Failed to submit review', error)
      snackError('Failed to submit review')
    }
  }

  // Auto-update orders to "submitted" when deadline passes
  async function checkAndUpdateExpiredOrders () {
    // Get all unique week strings from myOrders
    const weekStrings = [...new Set(orderStore.myOrders.map(o => o.weekString))]
    const now = new Date()
    let hasUpdates = false

    for (const weekString of weekStrings) {
      // Fetch and get deadline for current week
      await menuStore.getWeekDeadline(weekString)
      const weekDeadline = menuStore.deadlineByWeek(weekString)
      
      // Find all orders for this week that are still "pending" OR "draft"
      if (weekDeadline && now > new Date(weekDeadline)){
        const ordersToUpdate = orderStore.myOrders.filter(
          o => o.weekString === weekString && (o.status === 'pending' || o.status === 'draft'),
        )

        // Update each pending/draft order to "submitted"
        if (ordersToUpdate.length > 0){
          hasUpdates = true
          await Promise.all(
            ordersToUpdate.map(order => 
              orderStore.updateOrder(order.id, {...order, status: 'submitted'})
            )
          )
        }
      }
    }
    return hasUpdates
  }

  // Group and format order weeks for listing
  const historyWeeks = computed(() => {
    const groups = {}

    // Group myOrders by weekStart Monday string
    for (const order of orderStore.myOrders) {
      if (!groups[order.weekString]) {
        groups[order.weekString] = []
      }
      groups[order.weekString].push(order)
    }

    // Ensure the current week is represented even if the user hasn't made selections yet
    const currentWeek = getWeekString(new Date())
    if (!groups[currentWeek]) {
      groups[currentWeek] = []
    }

    return Object.keys(groups).map(weekStart => {
      const orders = groups[weekStart]
      const monday = parseLocalDate(weekStart)

      // Format Mon-Fri range label: e.g., "Week of Jun 9 – 13, 2025"
      const fridayObj = new Date(monday)
      fridayObj.setDate(monday.getDate() + 4)

      const options = { month: 'short', day: 'numeric', year: 'numeric' }
      const startStr = monday.toLocaleDateString('en-US', options)
      const endStr = fridayObj.toLocaleDateString('en-US', options)
      const title = `Week of ${startStr} – ${endStr}`

      // Generate dates for Mon-Fri
      const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      const days = []
      let foodCount = 0
      let offCount = 0

      for (let i = 0; i < 5; i++) {
        const currentDate = new Date(monday)
        currentDate.setDate(monday.getDate() + i)

        const year = currentDate.getFullYear()
        const month = String(currentDate.getMonth() + 1).padStart(2, '0')
        const day = String(currentDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`

        // Look up order in database for this day
        const order = orders.find(o => o.date === dateStr)

        // Cross-reference menu to check if it's an off day or holiday
        const menuItems = menuStore.allMenuItems.filter(item => item.date === dateStr)
        const isMenuOff = menuItems.some(item => item.status === 'off_day' || item.status === 'holiday')

        let selection = null
        let status = 'open'

        if (isMenuOff || order?.status === 'off' || order?.status === 'off_day') {
          status = 'off_day'
          offCount++
        } else if (order) {
          selection = order.menuTitle
          status = order.status
          foodCount++
        }

        days.push({
          label: dayLabels[i],
          selection,
          status,
          order: order || null,
        })
      }

      // Overall status of the week card
      const isCurrent = weekStart === currentWeek
      const isFuture = weekStart > currentWeek
      const isSubmitted = orders.length > 0 && orders.every(o => o.status === 'submitted')

      // Check if deadline has passed for this week
      const weekDeadline = menuStore.deadlineByWeek(weekStart)
      const isDeadlinePassed = weekDeadline ? new Date() > new Date(weekDeadline) : false

      // Past weeks always default to submitted
      let weekStatus = 'submitted'
      if (isFuture) {
        weekStatus = isSubmitted ? 'submitted' : 'in_progress'
      } else if (isCurrent) {
        weekStatus = isDeadlinePassed || orders.length === 0 || isSubmitted ? 'submitted' : 'in_progress'
      }

      // Subtitle text
      let subtitle = isCurrent ? (isDeadlinePassed ? 'Deadline passed · ' : 'Current week · ') : ''

      const maxActiveDays = 5 - offCount
      subtitle += foodCount === maxActiveDays && foodCount > 0 
        ? `${foodCount} day${foodCount === 1 ? '' : 's'} · all ordered` 
        : `${foodCount} selection${foodCount === 1 ? '' : 's'} made`

      if (offCount > 0) subtitle += ` · ${offCount} off day${offCount === 1 ? '' : 's'}`

      return {
        weekStart,
        title,
        subtitle,
        status: weekStatus,
        days,
        highlight: isCurrent,
      }
    }).sort((a, b) => b.weekStart.localeCompare(a.weekStart))
  })

  // Extract all unique months from order history
  const monthsList = computed(() => {
    const months = new Set()
    for (const week of historyWeeks.value) {
      const date = parseLocalDate(week.weekStart)
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      months.add(monthName)
    }
    return ['All Months', ...Array.from(months)]
  })

  // Filter weeks based on selected Month dropdown
  const filteredHistoryWeeks = computed(() => {
    if (selectedMonth.value === 'All Months') return historyWeeks.value

    return historyWeeks.value.filter(week => {
      const date = parseLocalDate(week.weekStart)
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      return monthName === selectedMonth.value
    })
  })

</script>
<template>
  <AppShell>
    <div style="max-width: 1400px; margin: 0 auto; padding: 0 16px;">
      <!-- Loading State -->
      <div v-if="isLoading" class="d-flex flex-column ga-4">
        <SkeletonCard v-for="i in 3" :key="i"/>
      </div>

      <div v-else>
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

        <!-- Header -->
        <v-row class="d-flex mb-4 mt-n1 align-center justify-space-between">
          <v-col class="d-flex justify-start align-center" cols="12" sm="6">
            <h1 class="font-weight-bold text-display-medium" style="color: #1E1E1E;">
              My order history
            </h1>
          </v-col>

          <v-col class="d-flex justify-sm-end align-center ga-3" cols="12" sm="6">
            <!-- Month Filter Dropdown -->
            <v-select
              v-model="selectedMonth"
              density="compact"
              hide-details
              :items="monthsList"
              label="Filter by Month"
              style="max-width: 226px;"
              variant="outlined"
            />
          </v-col>
        </v-row>

        <!-- History Listing Table -->
        <div v-if="filteredHistoryWeeks.length > 0">
          <v-card elevation="0" style="border: 1px solid #BDBDBD;">
            <!-- Search Toolbar -->
            <v-card-title class="d-flex align-center pa-4" style="background-color: #FFF3E0;">
              <v-text-field
                v-model="search"
                clearable
                density="compact"
                hide-details
                label="Search meals or dates..."
                prepend-inner-icon="mdi-magnify"
                single-line
                style="max-width: 400px;"
                variant="outlined"
              />
            </v-card-title>

            <!-- DataTable -->
            <v-data-table
              :headers="headers"
              :items="filteredHistoryWeeks"
              :search="search"
              :loading="isLoading"
              class="elevation-0"
              :items-per-page="10"
            >
              <!-- Week Title Column -->
              <template #item.title="{ item }">
                <span class="font-weight-bold text-grey-darken-4">
                  {{ item.title }}
                </span>
              </template>

              <!-- Dynamic columns for Mon-Fri -->
              <template
                v-for="index in [0, 1, 2, 3, 4]"
                :key="index"
                #[`item.days.${index}`]="{ item }"
              >
                <div class="d-flex flex-column align-center py-2">
                  <!-- Selection Name -->
                  <span 
                    v-if="['off_day', 'holiday'].includes(item.days[index].status)" 
                    class="text-red-darken-2 font-weight-bold text-caption"
                  >
                    Off day
                  </span>
                  <span v-else class="text-body-2 font-weight-medium">
                    {{ item.days[index].selection || '–' }}
                  </span>

                  <!-- Review Button with Tooltip -->
                  <v-tooltip 
                    v-if="item.days[index].selection && item.days[index].order && (item.status === 'submitted' || item.days[index].status === 'submitted')"
                    :text="item.days[index].order.rating ? `Reviewed: ${item.days[index].order.rating} Stars. Click to edit.` : 'Click to review this meal'" 
                    location="top"
                  >
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon
                        variant="text"
                        density="compact"
                        class="mt-1"
                        :color="item.days[index].order.rating ? 'amber-darken-2' : 'grey-darken-1'"
                        @click="openReview(item.days[index].order)"
                      >
                        <v-icon size="small">
                          {{ item.days[index].order.rating ? 'mdi-star' : 'mdi-comment-plus-outline' }}
                        </v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </div>
              </template>

              <!-- Status Column -->
              <template #item.status="{ item }">
                <v-chip
                  :color="item.status === 'submitted' ? 'green-darken-1' : 'orange-darken-2'"
                  size="small"
                  variant="flat"
                  class="font-weight-bold text-capitalize"
                >
                  {{ item.status === 'submitted' ? 'Submitted' : 'In Progress' }}
                </v-chip>
              </template>

              <!-- Empty State -->
              <template #no-data>
                <div class="text-center py-12">
                  <v-icon color="#1E1E1E" size="64">
                    mdi-clipboard-text-off-outline
                  </v-icon>
                  <div class="font-weight-medium mt-4" style="font-size: 20px;">
                    No order history matches the criteria
                  </div>
                </div>
              </template>
            </v-data-table>
          </v-card>

          <ReviewDialog
            v-model="showReviewDialog"
            :order="selectedOrderToReview"
            :loading="orderStore.isLoading"
            @submit-review="handleReviewSubmit"
          />
        </div>

        <!-- Empty State -->
        <v-card
          v-else
          class="pa-8 rounded-lg text-center"
          style="border: 1px dashed #D2451E;"
          variant="flat"
        >
          <v-icon class="mb-3" color="#1E1E1E" size="48">
            mdi-clipboard-text-off-outline
          </v-icon>

          <div class="font-weight-medium" style="font-size: 20px; color: #1E1E1E;">
            No past order history found.
          </div>
        </v-card>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
:deep(.v-data-table) {
  border-radius: 0;
}

:deep(.v-data-table__thead) {
  background-color: #FFF3E0;
}

:deep(.v-data-table__thead th) {
  font-weight: 700 !important;
  color: #1E1E1E !important;
  border-bottom: 2px solid #D2451E !important;
}

:deep(.v-data-table__tbody tr:hover) {
  background-color: #FAFAFA !important;
}

:deep(.v-data-table__tbody td) {
  border-bottom: 1px solid #E0E0E0 !important;
}

/* Pagination styling */
:deep(.v-data-table-footer) {
  border-top: 2px solid #D2451E;
  padding: 16px;
}

:deep(.v-pagination__item--is-active) {
  background-color: #D2451E !important;
  color: white !important;
}
</style>