<script setup>
  import { computed, onMounted, ref } from 'vue'
  import AppShell from '@/components/layout/AppShell.vue'
  import OrderReviewCard from '@/components/orders/OrderReviewCard.vue'
  import ReviewDialog from '@/components/shared/ReviewDialog.vue'
  import { useAuth } from '@/composables/useAuth'
  import { useMenuStore } from '@/stores/menu.store'
  import { useOrderStore } from '@/stores/orders.store'
  import { getWeekString, parseLocalDate } from '@/utils/dateHelpers'
  import { useSnackbar } from '@/composables/useSnackbar'

  // Load auth, order store, and menu store
  const { user } = useAuth()
  const orderStore = useOrderStore()
  const menuStore = useMenuStore()
  const { success: snackSuccess, error: snackError } = useSnackbar()

  const isLoading = ref(true)

  // Fetch all orders and menu configurations on mount
  onMounted(async () => {
    try {
      await Promise.all([
        orderStore.getMyOrders(user.value.id),
        menuStore.getAllMenuItems(),
      ])

      // Check and auto-update expired orders
      await checkAndUpdateExpiredOrders()

      // Refetch to get updated data
      await orderStore.getMyOrders(user.value.id)
    } catch (error) {
      console.error('Failed to load history data:', error)
    } finally {
      isLoading.value = false
    }
  })

  // Review Dialog Logic
  const showReviewDialog = ref(false)
  const selectedOrderToReview = ref(null)

  function openReview (order) {
    if (!order) return
    selectedOrderToReview.value = order
    showReviewDialog.value = true
  }

  async function handleReviewSubmit (review) {
    try {
      const success = await orderStore.updateOrder(review.id, {
        rating: review.rating,
        comment: review.comment,
      })

      if (success) {
        snackSuccess('Review submitted successfully')
        // Re-fetch the user's personal orders to update the UI instantly
        await orderStore.getMyOrders(user.value.id)

        // Update the selected order ref with fresh data
        const updatedOrder = orderStore.myOrders.find(o => o.id === review.id)
        if (updatedOrder) {
          selectedOrderToReview.value = updatedOrder
          showReviewDialog.value = false // Close dialog ONLY after successful API update
        }
        else{
          snackError('Failed to submit review')
        }
      }
    } catch (error) {
      console.error('Failed to submit review', error)
      snackError('Failed to submit review')
    }
  }

  // Auto-update orders to "submitted" when deadline passes
  async function checkAndUpdateExpiredOrders () {
    // Get all unique week strings from myOrders
    const weekStrings = [...new Set(orderStore.myOrders.map(o => o.weekString))]

    for (const weekString of weekStrings) {
      // Get deadline for this week
      const weekDeadline = menuStore.deadlineByWeek(weekString)
      if (!weekDeadline) continue

      // Check if deadline has passed
      const isDeadlinePassed = new Date() > new Date(weekDeadline)
      if (!isDeadlinePassed) continue

      // Find all orders for this week that are still "pending"
      const ordersToUpdate = orderStore.myOrders.filter(
        o => o.weekString === weekString && o.status === 'pending',
      )

      // Update each pending order to "submitted"
      for (const order of ordersToUpdate) {
        await orderStore.updateOrder(order.id, {
          ...order,
          status: 'submitted',
        })
      }
    }
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
      const mondayObj = new Date(monday)
      const fridayObj = new Date(monday)
      fridayObj.setDate(mondayObj.getDate() + 4)

      const options = { month: 'short', day: 'numeric', year: 'numeric' }
      const startStr = mondayObj.toLocaleDateString('en-US', options)
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

        if (isMenuOff) {
          status = 'off_day'
          offCount++
        } else if (order) {
          if (order.status === 'off' || order.status === 'off_day') {
            status = 'off_day'
            offCount++
          } else {
            selection = order.menuTitle
            status = order.status
            foodCount++
          }
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
      const isSubmitted = orders.length > 0 && orders.every(o => o.status === 'submitted')

      // Check if deadline has passed for this week
      const weekDeadline = menuStore.deadlineByWeek(weekStart)
      const isDeadlinePassed = weekDeadline ? new Date() > new Date(weekDeadline) : false

      // Determine week status
      let weekStatus = 'submitted' // Default to submitted

      if (isCurrent) {
        // Current week logic
        if (isDeadlinePassed) {
          // Deadline passed → Treat as submitted even if in current week
          weekStatus = 'submitted'
        } else if (isSubmitted) {
          // Deadline NOT passed but all orders submitted → Submitted
          weekStatus = 'submitted'
        } else {
          // Deadline NOT passed and not fully submitted → In progress
          weekStatus = 'in_progress'
        }
      }
      // Past weeks are always 'submitted' (default)

      // Subtitle text
      let subtitle = ''
      if (isCurrent) {
        subtitle += isDeadlinePassed ? 'Deadline passed · ' : 'Current week · '
      }

      const maxActiveDays = 5 - offCount
      subtitle += foodCount === maxActiveDays && foodCount > 0 ? `${foodCount} day${foodCount === 1 ? '' : 's'} · all ordered` : `${foodCount} selection${foodCount === 1 ? '' : 's'} made`

      if (offCount > 0) {
        subtitle += ` · ${offCount} off day${offCount === 1 ? '' : 's'}`
      }

      return {
        weekStart,
        title,
        subtitle,
        status: weekStatus,
        days,
        highlight: isCurrent,
      }
    }).sort((a, b) => b.weekStart.localeCompare(a.weekStart)) // Newest first
  })
</script>

<template>
  <AppShell>
    <div style="max-width: 1400px; margin: 0 auto; padding: 0 16px;">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <v-progress-circular color="#D2451E" indeterminate size="45" />
        <div class="mt-4">Loading your history...</div>
      </div>

      <div v-else>
        <!-- Header -->
        <div class="mb-6">
          <h1 class="font-weight-bold text-display-medium" style="color: #1E1E1E;">
            My order history
          </h1>
        </div>

        <!-- History Listing -->
        <div v-if="historyWeeks.length > 0">
          <OrderReviewCard
            v-for="week in historyWeeks"
            :key="week.weekStart"
            :days="week.days"
            :highlight="week.highlight"
            :status="week.status"
            :subtitle="week.subtitle"
            :title="week.title"
            @review="openReview"
          />

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

</style>
