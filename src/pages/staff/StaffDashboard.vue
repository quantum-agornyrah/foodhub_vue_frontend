<script setup>
  import { storeToRefs } from 'pinia'
  import { computed, onMounted, ref } from 'vue'
  import AppShell from '@/components/layout/AppShell.vue'
  import DeadlineAlert from '@/components/staff/DeadlineAlert.vue'
  import PreviousWeekCard from '@/components/staff/PreviousWeekCard.vue'
  import { useAuth } from '@/composables/useAuth'
  import { useWeekLabel } from '@/composables/useWeekLabel'
  import { useWeekMenu } from '@/composables/useWeekMenu'
  import { useMenuStore } from '@/stores/menu.store'
  import { useOrderStore } from '@/stores/orders.store'
  import { getWeekDates, getWeekString, parseLocalDate } from '@/utils/dateHelpers'
  import SkeletonCard from '@/components/shared/SkeletonCard.vue'

  // Load composables and stores
  const { user } = useAuth()
  const orderStore = useOrderStore()
  const menuStore = useMenuStore()
  const { weekRangeLabel, weekDayLabels } = useWeekLabel()
  const { weekDays: menuDays, fetchWeekMenu, DAY_STATUS } = useWeekMenu()

  const isLoading = ref(true)

  // Fetch orders and menus on mount
  onMounted(async () => {
    try {
      const mondayStr = getWeekString(new Date())
      await Promise.all([
        orderStore.getMyOrders(user.value.id),
        menuStore.getAllMenuItems(),
        fetchWeekMenu(mondayStr),
      ])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      isLoading.value = false
    }
  })

  // Dynamic Greeting based on time of day
  const greeting = computed(() => {
    const hr = new Date().getHours()
    const name = user.value.name ? user.value.name.split(' ')[0] : 'there'
    if (hr < 12) return `Good morning, ${name}`
    if (hr < 17) return `Good afternoon, ${name}`
    return `Good evening, ${name}`
  })

  // Monday date string for the current week
  const currentWeekStart = computed(() => getWeekString(new Date()))

  // Subtitle date info: e.g., "Monday, Jun 8 • Week of Jun 8 - 12"
  const dateSubtitle = computed(() => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' }
    const formattedToday = new Date().toLocaleDateString('en-US', options)

    // Get Mon-Fri range label
    const range = weekRangeLabel(0) // e.g. "Jun 8 - Jun 12, 2026"
    // Strip the year for a cleaner look
    const rangeShort = range.split(',')[0]

    return `${formattedToday} • Week of ${rangeShort}`
  })

  // Calculate deadline details
  const deadlineIso = computed(() =>
    menuStore.deadlineByWeek(currentWeekStart.value) ?? null,
  )
  const isDeadlinePassed = computed(() => {
    if (!deadlineIso.value) return false
    return new Date() > new Date(deadlineIso.value)
  })

  // Check if current week's order is fully submitted
  const isCurrentWeekSubmitted = computed(() => {
    const currentOrders = orderStore.myOrders.filter(
      o => o.weekString === currentWeekStart.value,
    )
    if (currentOrders.length === 0) return false
    return currentOrders.every(o => o.status === 'submitted')
  })

  // Current Week's selections mapped for Mon-Fri
  const thisWeekSummary = computed(() => {
    // Mon-Fri labels: e.g., [{ date: "2026-06-08", label: "Mon" }]
    const labels = weekDayLabels(0)

    return labels.map(day => {
      // Check if day is off/holiday in menu
      const menuDay = menuDays.value.find(d => d.date === day.date)
      const isOff = menuDay?.status === DAY_STATUS.OFF_DAY || menuDay?.status === DAY_STATUS.HOLIDAY

      // Find matching order in DB
      const order = orderStore.myOrders.find(o => o.date === day.date)

      let selectionText = 'Not selected'
      // let style = { border: '1px solid #D2451E', color: '#8C8C8C' }
      let style = { border: '1.5px solid ' + (day.imageUrl ? '#D2451E' : '#E0E0E0') }

      if (isOff) {
        selectionText = 'Off day'
        style = {
          borderColor: '#FFCDD2',
          backgroundColor: '#FFEBEE',
          color: '#C62828',
        }
      } else if (order) {
        const fullItem = menuStore.allMenuItems.find(m => m.id === order.menuItemId)

        return {
          dayName: day.label.split(' ')[0],
          selection: order.menuTitle || 'Selected',
          imageUrl: fullItem?.imageUrl || '',
          description: fullItem?.description || '',
          style: { ...style, borderColor: '#D2451E' },
        }
      }

      return {
        dayName: day.label.split(' ')[0],
        selection: selectionText,
        imageUrl: '',
        description: '',
        style,
      }
    })
  })

  // Historical weeks for "Previous Weeks" summary list
  const previousWeeks = computed(() => {
    const groups = {}

    // Sort orders descending
    const sortedOrders = [...orderStore.myOrders].sort((a, b) => b.date.localeCompare(a.date))

    for (const order of sortedOrders) {
      // Filter out current week start
      if (order.weekString === currentWeekStart.value) continue

      if (!groups[order.weekString]) {
        groups[order.weekString] = []
      }
      groups[order.weekString].push(order)
    }

    return Object.keys(groups).map(weekStart => {
      const orders = groups[weekStart]
      const monday = parseLocalDate(weekStart)
      const friday = parseLocalDate(weekStart)
      friday.setDate(monday.getDate() + 4)

      const options = { month: 'short', day: 'numeric' }
      const startStr = monday.toLocaleDateString('en-US', options)
      const endStr = friday.toLocaleDateString('en-US', { day: 'numeric' })
      const title = `Week of ${startStr} – ${endStr}`

      // Compute stats
      const foodCount = orders.filter(
        o => o.menuItemId !== null && o.status !== 'off' && o.status !== 'off_day',
      ).length
      const offCount = orders.filter(
        o => o.menuItemId === null || o.status === 'off' || o.status === 'off_day',
      ).length

      let subtitle = `${foodCount} day${foodCount === 1 ? '' : 's'} ordered`
      if (offCount > 0) {
        subtitle += ` · ${offCount} off day${offCount === 1 ? '' : 's'}`
      }

      // Status
      const isSubmitted = orders.some(o => o.status === 'submitted')
      const status = isSubmitted ? 'submitted' : 'draft'

      return {
        weekStart,
        title,
        subtitle,
        status,
      }
    }).sort((a, b) => b.weekStart.localeCompare(a.weekStart)) // Newest first
  })
</script>

<template>
  <AppShell>
    <div style="max-width: 1400px; margin: 0 auto; padding: 0 16px;">
      <!-- Loading State -->
      <v-row v-if="isLoading">
        <v-col 
          v-for="i in 3" :key="i" 
          cols="12" 
          md="4" 
          sm="12"
        >
          <SkeletonCard />
        </v-col>
      </v-row>

      <div v-else>
        <!-- Greeting Header -->
        <div class="mb-6">
          <h1 class="font-weight-bold text-display-medium" style="color: #1E1E1E;">
            {{ greeting }}
          </h1>

          <div class="font-weight-medium mt-n6">
            {{ dateSubtitle }}
          </div>
        </div>

        <v-divider class="border-opacity-25 my-6" />

        <!-- Section 1: This Week's Selections -->

        <div class="mb-8">
          <h2 class="font-weight-bold mb-4">
            This week's selections
          </h2>

          <v-row class="ma-0 ga-3 d-flex flex-wrap justify-space-between">
            <v-col
              v-for="day in thisWeekSummary"
              :key="day.dayName"
              class="pa-0 flex-grow-1 d-flex flex-column"
              cols="12"
              md="2"
              sm="5"
            >
              <v-card
                class="pa-0 rounded-lg overflow-hidden flex-grow-1 d-flex flex-column"
                elevation="0"
                :style="day.style"
              >
                <!-- Food Image (top portion) -->
                <v-img
                  v-if="day.imageUrl"
                  class="flex-shrink-0"
                  cover
                  height="200"
                  :src="day.imageUrl"
                >
                  <template #error>
                    <div class="d-flex align-center justify-center" style="height: 200px; background-color: #F5F2EC;">
                      <v-icon color="#D2451E" size="80">mdi-food</v-icon>
                    </div>
                  </template>
                </v-img>

                <div
                  v-else
                  class="d-flex align-center justify-center flex-shrink-0"
                  style="height: 200px; background-color: #F5F2EC;"
                >
                  <v-icon color="#D2451E" size="80">mdi-food</v-icon>
                </div>

                <!-- Card Content (Stretches to fill remaining space) -->
                <div class="pa-3 d-flex flex-column flex-grow-1">
                  <div class="font-weight-bold mb-1" style="color: #1E1E1E; font-size: 20px;">
                    {{ day.dayName }}
                  </div>

                  <div class="font-weight-bold text-truncate mb-1" style="color: #1E1E1E; font-size: 20px;">
                    {{ day.selection }}
                  </div>

                  <div
                    v-if="day.description"
                    class="font-weight-medium mb-1 text-grey-darken-2"
                  >
                    {{ day.description }}
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <v-divider class="border-opacity-25 my-6" />

        <!-- Deadline Notification Banner -->
        <DeadlineAlert
          v-if="!isCurrentWeekSubmitted && deadlineIso"
          :deadline-iso="deadlineIso"
          to="/weekly-overview"
        />

        <v-divider class="border-opacity-25 my-6" />

        <!-- Section 2: Previous Weeks -->
        <div>
          <h2 class="font-weight-bold mb-4" style="color: #1E1E1E;">
            Previous weeks
          </h2>

          <div v-if="previousWeeks.length > 0">
            <PreviousWeekCard
              v-for="week in previousWeeks"
              :key="week.weekStart"
              :status="week.status"
              :subtitle="week.subtitle"
              :title="week.title"
            />
          </div>

          <!-- Empty State -->
          <v-card
            v-else
            class="pa-8 rounded-lg text-center"
            style="border: 1px dashed #BDBDBD;"
            variant="flat"
          >
            <v-icon class="mb-3" color="#1E1E1E" size="48">
              mdi-history
            </v-icon>

            <div class="font-weight-medium" style="color: #1E1E1E; font-size: 20px;">
              No previous order weeks found.
            </div>
          </v-card>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>

</style>
