<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import AppShell from '@/components/layout/AppShell.vue'
  import DayOrderCard from '@/components/staff/DayOrderCard.vue'
  import OrderProgressBar from '@/components/staff/OrderProgressBar.vue'
  import WeekSelectionSummary from '@/components/staff/WeekSelectionSummary.vue'
  import { useAuth } from '@/composables/useAuth'
  import { useOrderDraft } from '@/composables/useOrderDraft'
  import { useWeekMenu } from '@/composables/useWeekMenu'
  import { useMenuStore } from '@/stores/menu.store'
  import { useOrderStore } from '@/stores/orders.store'
  import { getWeekString, parseLocalDate } from '@/utils/dateHelpers'
  import SkeletonCard from '@/components/shared/SkeletonCard.vue'

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
    submitDraft,
    saveDraft,
  } = useOrderDraft()

  const pageLoading = ref(true)

  // Fetch data and hydrate selections on mount
  onMounted(async () => {
    try {

      const mondayStr = getWeekString(new Date())

      // Fetch menu and user orders in parallel
      await Promise.all([
        fetchWeekMenu(mondayStr),
        orderStore.getMyOrders(user.value.id),
      ])

      // Hydrate selections draft:
      // Gather all valid menu dates
      const availableDates = weekDays.value.map(d => d.date)
      initDraft(mondayStr, availableDates)

      // Pull existing database selections
      const myOrdersThisWeek = orderStore.myOrders.filter(
        o => o.weekString === mondayStr,
      )
      for (const order of myOrdersThisWeek) {
        if (order.menuItemId) {
          selectItem(order.date, order.menuItemId)
        }
      }

      updateCountdown()
      timer = setInterval(updateCountdown, 1000)
      if (timer) clearInterval(timer)
      
    } catch (error) {
      console.error('Failed to load menu/order overview:', error)
    } finally {
      pageLoading.value = false
    }
  })

  const currentWeekStart = computed(() => getWeekString(new Date()))

  const deadlineIso = computed(() => menuStore.deadlineByWeek(currentWeekStart.value))
  const deadlineLabel = computed(() => {
    if (!deadlineIso.value) return 'No deadline set'
    return new Date(deadlineIso.value).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  })

  const isWeekDeadlinePassed = computed(() => {
    if (!deadlineIso.value) return false
    return new Date() > new Date(deadlineIso.value)
  })

  const isCurrentWeekSubmitted = computed(() => {
    const currentOrders = orderStore.myOrders.filter(
      o => o.weekString === currentWeekStart.value,
    )
    if (currentOrders.length === 0) return false
    return currentOrders.every(o => o.status === 'submitted')
  })

  // --- Countdown Timer Logic ---
  const countdown = ref({ days: 0, hours: 0, mins: 0, secs: 0 })
  let timer = null

  function updateCountdown () {
    if (!deadlineIso.value) return

    const now = new Date()
    const end = new Date(deadlineIso.value)
    const diff = end - now // ms remaining

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

  // Map day status and labels
  const mappedWeekDays = computed(() => {
    return weekDays.value.map(d => {
      const parsedDate = parseLocalDate(d.date)
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dayName = dayNames[parsedDate.getDay()]
      const options = { month: 'short', day: 'numeric' }
      const label = parsedDate.toLocaleDateString('en-US', options)
      const status = (isCurrentWeekSubmitted.value && d.status === 'open') ? 'deadline_passed' : d.status

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

  // Look up menu choices for a specific date
  function getMenuItemsForDate (dateString) {
    return weekMenu.value.filter(item => item.date === dateString)
  }

  // Handler for custom radio selects
  function handleSelect ({ date, itemId }) {
    selectItem(date, itemId)
  }

  // Action handlers
  async function handleSubmit () {
    await submitDraft()
    router.push('/staff-dashboard')
  }

  async function handleSaveDraft () {
    await saveDraft()
    router.push('/staff-dashboard')
  }
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
        <!-- Header -->
        <v-row class="d-flex mb-4 align-center justify-space-between">
          <v-col class="d-flex justify-start" cols="12" sm="6">
            <h1 class="font-weight-bold text-display-medium" style="color: #1E1E1E;">
              Order this week
            </h1>
          </v-col>

          <v-col class="d-flex justify-sm-end align-center" cols="12" sm="6">
            <v-chip
              v-if="isCurrentWeekSubmitted"
              class="font-weight-bold px-4 py-5 text-white animate-pulse"
              color="success"
              variant="flat"
            >
              <v-icon class="mr-2" left>mdi-check-circle</v-icon>
              Order Submitted
            </v-chip>

            <v-card
              v-if="deadlineIso && !isWeekDeadlinePassed && !isCurrentWeekSubmitted"
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

            <v-chip
              v-else-if="deadlineIso && isWeekDeadlinePassed"
              class="font-weight-bold px-4 py-5"
              color="#D2451E"
              variant="flat"
            >
              <v-icon class="mr-2" left>mdi-alert-circle</v-icon>
              Deadline Passed
            </v-chip>

            <v-chip
              v-else-if="!deadlineIso"
              class="font-weight-bold px-4 py-5"
              color="grey"
              variant="flat"
            >
              No deadline set
            </v-chip>
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
        </v-row>

        <!-- Summary Section -->
        <v-row>
          <v-col class="mx-auto" cols="12">
            <WeekSelectionSummary
              :is-deadline-passed="isWeekDeadlinePassed || isCurrentWeekSubmitted"
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
