<script setup>
  // File-based routing meta definition
  definePage({
    name: 'WeeklyOverview',
    path: '/weekly-overview',
    meta: {
      requiresAuth: true,
      roles: ['staff'],
    },
  })

  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'

  import AppShell from '@/components/layout/AppShell.vue'
  import DayOrderCard from '@/components/staff/DayOrderCard.vue'
  import OrderProgressBar from '@/components/staff/OrderProgressBar.vue'
  import WeekSelectionSummary from '@/components/staff/WeekSelectionSummary.vue'
  import SkeletonCard from '@/components/shared/SkeletonCard.vue'

  import { useAuth } from '@/composables/useAuth'
  import { useOrderDraft } from '@/composables/useOrderDraft'
  import { useWeekMenu } from '@/composables/useWeekMenu'
  import { useMenuStore } from '@/stores/menu.store'
  import { useOrderStore } from '@/stores/orders.store'
  import { getWeekString, parseLocalDate } from '@/utils/dateHelpers'

  const router = useRouter()

  // Load composables and stores
  const { user } = useAuth()
  const orderStore = useOrderStore()
  const menuStore = useMenuStore()
  const { weekDays, weekMenu, isLoading, fetchWeekMenu } = useWeekMenu()
  const {
    selections,
    isSubmitting,
    isSavingDraft,
    isSubmittingAll,
    initDraft,
    selectItem,
    submitOrder,
    saveDraft,
  } = useOrderDraft()

  const pageLoading = ref(true)
  let timer = null

  // Calculate next week date
  const getNextWeekMondayDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return getWeekString(d)
  }

  const nextWeekStart = computed(() => getNextWeekMondayDate())

  // Track deadline set for nextweek
  const deadlineIso = computed(() => menuStore.deadlineByWeek(nextWeekStart.value))

  const isWeekDeadlinePassed = computed(() => {
    if (!deadlineIso.value) return false
    return new Date() > new Date(deadlineIso.value)
  })

  // Check if next week's order is fully submitted
  const isCurrentWeekSubmitted = computed(() => {
    const nextOrders = orderStore.myOrders.filter(
      o => o.weekString === nextWeekStart.value,
    )
    if (nextOrders.length === 0) return false
    return nextOrders.every(o => o.status === 'submitted')
  })

  // Countdown logic
  const countdown = ref({ days: 0, hours: 0, mins: 0, secs: 0 })

  function updateCountdown () {
    if (!deadlineIso.value) return

    // Calculate difference in time in milliseconds
    const diff = new Date(deadlineIso.value) - new Date()

    if (diff <= 0) {
      countdown.value = { days: 0, hours: 0, mins: 0, secs: 0 }
      if (timer) clearInterval(timer)
      return
    }

    const totalSeconds = Math.floor(diff / 1000)
    countdown.value = {
      days: Math.floor(totalSeconds / 86_400),
      hours: Math.floor((totalSeconds % 86_400) / 3600),
      mins: Math.floor((totalSeconds % 3600) / 60),
      secs: totalSeconds % 60,
    }
  }

  // Revert auto-submitted orders back to 'pending' if HR extends deadline
  async function revertExpiredOrders (weekString) {
    const ordersToRevert = orderStore.myOrders.filter(
      o => o.weekString === weekString && o.status === 'submitted',
    )
    for (const order of ordersToRevert) {
      await orderStore.updateOrder(order.id, { ...order, status: 'pending' })
    }
    await orderStore.getMyOrders(user.value.id)
  }

  // Watch for HR extending a deadline that had already passed
  watch(deadlineIso, async (newDeadline, oldDeadline) => {
    if (!oldDeadline || !newDeadline) return

    const wasPassed = new Date() > new Date(oldDeadline)
    const nowPassed = new Date() > new Date(newDeadline)

    // If deadline was extended, restart the countdown timer and revert order statuses
    if (wasPassed && !nowPassed) {
      if (timer) clearInterval(timer)
      updateCountdown()
      timer = setInterval(updateCountdown, 1000)
      await revertExpiredOrders(nextWeekStart.value)
    }
  })

  // Map day status and labels
  const mappedWeekDays = computed(() => {
    return weekDays.value.map(d => {
      const parsedDate = parseLocalDate(d.date)
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dayName = dayNames[parsedDate.getDay()]
      const options = { month: 'long', day: 'numeric' }
      const label = parsedDate.toLocaleDateString('en-US', options)

      // Disable or lock card ONLY if the deadline has actually passed and order has been submitted
      const status = ((isWeekDeadlinePassed.value || isCurrentWeekSubmitted.value) && d.status === 'open') ? 'deadline_passed' : d.status

      return {
        date: d.date,
        status: status,
        dayName,
        label,
      }
    })
  })

  // Calculate stats for the progress bar
  const activeDaysCount = computed(() => {
    return weekDays.value.filter(d => d.status === 'open' || d.status === 'deadline_passed').length
  })

  const selectedCount = computed(() => {
    return Object.keys(selections.value).filter(date => {
      // Check if the day is active and has a selection
      const isDayActive = weekDays.value.some(
        d => d.date === date && (d.status === 'open' || d.status === 'deadline_passed'),
      )
      return isDayActive && selections.value[date] !== null
    }).length
  })

  // Look up food menu items for a specific date
  function getMenuItemsForDate (dateString) {
    return weekMenu.value.filter(item => item.date === dateString)
  }

  // Function for custom radio selections i.e date and food item
  function handleSelect ({ date, itemId }) {
    selectItem(date, itemId)
  }

  async function handleSubmit () {
    await submitOrder()
  }

  async function handleSaveDraft () {
    await saveDraft()
    router.push('/my-order-history')
  }

  function goBack() {
    if (window.history.state && window.history.state.back) {
      router.back()
    } else {
      router.push('/staff-dashboard')
    }
  }

  // Fetch data on mount
  onMounted(async () => {
    try {
      const nextWeekMonday = nextWeekStart.value

      // Fetch menu and user orders in parallel
      await Promise.all([
        fetchWeekMenu(nextWeekMonday),
        orderStore.getMyOrders(user.value.id),
      ])

      // Gather all valid menu dates
      const availableDates = weekDays.value.map(d => d.date)
      initDraft(nextWeekMonday, availableDates)

      // Pull existing database selections
      const myOrdersNextWeek = orderStore.myOrders.filter(
        o => o.weekString === nextWeekMonday,
      )
      for (const order of myOrdersNextWeek) {
        if (order.menuItemId) {
          selectItem(order.date, order.menuItemId)
        }
      }

      updateCountdown()
      timer = setInterval(updateCountdown, 1000)
      
    } catch (error) {
      console.error('Failed to load menu and order overview:', error)
    } finally {
      pageLoading.value = false
    }
  })

  // Clean up the timer when leaving the page
  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })
</script>

<template>
  <AppShell>
    <div style="max-width: 1400px; margin: 0 auto; padding: 0 16px;">
      
      <!-- Loading State -->
      <v-row v-if="pageLoading || isLoading">
        <v-col
          v-for="i in 3"
          :key="i"
          cols="12"
          sm="12"
          md="4"
        >
          <SkeletonCard />
        </v-col>
      </v-row>

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
              Order for Next Week
            </h1>
          </v-col>

          <v-col class="d-flex flex-column ga-3 justify-sm-end align-end" cols="12" sm="6">
            <v-card
              v-if="isCurrentWeekSubmitted"
              class="font-weight-bold px-6 py-3 text-white"
              color="success"
              variant="flat"
            >
              <v-icon class="mr-2" left>mdi-check-circle</v-icon>
              Order Submitted
            </v-card>

            <v-card
              v-else-if="deadlineIso && !isWeekDeadlinePassed"
              class="px-4 py-3 d-flex align-center"
              elevation="0"
              style="background-color: #D2451E; color: white;"
              variant="flat"
            >
              <v-icon class="mr-3" color="white" size="24">mdi-calendar-clock</v-icon>
              <div class="font-weight-medium" style="font-size: 16px;">
                Deadline in:
                {{ countdown.days }}d :
                {{ String(countdown.hours).padStart(2, '0') }}h :
                {{ String(countdown.mins).padStart(2, '0') }}m :
                {{ String(countdown.secs).padStart(2, '0') }}s
              </div>
            </v-card>

            <v-card
              v-else-if="deadlineIso && isWeekDeadlinePassed"
              class="font-weight-bold px-6 py-3"
              color="#D2451E"
              variant="flat"
            >
              <v-icon class="mr-2" left>mdi-alert-circle</v-icon>
              Deadline Passed
            </v-card>

            <v-card
              v-else
              class="font-weight-bold px-4 py-3 text-white"
              color="#D2451E"
              variant="flat"
            >
              No deadline set
            </v-card>
          </v-col>
        </v-row>

        <!-- Progress Indicator -->
        <OrderProgressBar
          :selected-count="selectedCount"
          :total-count="activeDaysCount"
        />

        <!-- Weekly Columns Grid -->
        <v-row class="mb-8">
          <v-col
            v-for="day in mappedWeekDays"
            :key="day.date"
            cols="12"
            md="4"
            sm="6"
          >
            <DayOrderCard
              :date="day.label"
              :date-string="day.date"
              :day="day.dayName"
              :items="getMenuItemsForDate(day.date)"
              :selected-item-id="selections[day.date]"
              :status="day.status"
              @select="handleSelect"
            />
          </v-col>

          <v-col class="mr-auto" cols="12" md="4" sm="6">
            <WeekSelectionSummary
              :is-deadline-passed="isWeekDeadlinePassed"
              :is-submitted="isCurrentWeekSubmitted"
              :is-saving-draft="isSavingDraft"
              :is-submitting="isSubmitting"
              :is-submitting-all="isSubmittingAll"
              :menu-items="weekMenu"
              :selections="selections"
              :week-days="mappedWeekDays"
              @save-draft="handleSaveDraft"
              @submit="handleSubmit"
            />
          </v-col>

        </v-row>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>

</style>
