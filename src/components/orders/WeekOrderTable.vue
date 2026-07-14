<script setup>
  import { computed, ref } from 'vue'
  import ReviewDialog from '@/components/shared/ReviewDialog.vue'

  const props = defineProps({
    orders: {
      type: Array,
      default: () => [],
    },
    weekDates: {
      type: Array,
      default: () => [],
    },
  })

  // Search functionality
  const search = ref('')
  const showReviewDialog = ref(false)
  const selectedOrderToReview = ref(null)

  function openReview (order) {
    if (!order || !order.rating) return // Only open if review exists
    selectedOrderToReview.value = order
    showReviewDialog.value = true
  }

  // Day names for column headers
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

  // DataTable headers
  const headers = computed(() => {
    return [
      {
        title: 'Staff',
        key: 'name',
        sortable: true,
        width: '200px',
        align: 'start',
      },
      {
        title: 'Department',
        key: 'department',
        sortable: true,
        width: '150px',
        align: 'start',
      },
      ...props.weekDates.map((date, index) => ({
        title: dayNames[index],
        key: `day_${index}`,
        sortable: false,
        width: '180px',
        align: 'center',
      })),
    ]
  })

  // Transform orders into DataTable format
  const tableData = computed(() => {
    const staffMap = new Map()

    for (const order of props.orders) {
      if (!staffMap.has(order.staffId)) {
        staffMap.set(order.staffId, {
          id: order.staffId,
          name: order.staffName || 'Unknown',
          department: order.department || 'N/A',
        })
      }
    }

    // Convert to array with day columns
    return Array.from(staffMap.values()).map(staff => {
      const row = {
        id: staff.id,
        name: staff.name,
        department: staff.department,
        initials: staff.initials,
      }

      // Add columns for each day
      for (const [index, date] of props.weekDates.entries()) {
        // Store the full order object instead of just the title
        const orderForDate = props.orders.find(o => o.staffId === staff.id && o.date === date)
        row[`day_${index}`] = orderForDate || '-'
      }

      return row
    })
  })

</script>

<template>
  <v-card elevation="0" style="border: 1px solid #BDBDBD;">
    <!-- Search Bar -->
    <v-card-title class="d-flex align-center pa-4" style="background-color: #FFF3E0;">
      <v-text-field
        v-model="search"
        clearable
        density="compact"
        hide-details
        label="Search staff..."
        prepend-inner-icon="mdi-magnify"
        single-line
        style="max-width: 400px; width: 100%"
        variant="outlined"
      />

      <v-spacer />
      <span class="text-subtitle d-none d-sm-inline">{{ tableData.length }} staff members</span>
    </v-card-title>

    <!-- DataTable -->
    <v-data-table
      class="order-data-table"
      :headers="headers"
      hover
      :items="tableData"
      :items-per-page="10"
      :items-per-page-options="[5, 10, 25, 50, 100]"
      :search="search"
    >
      <!-- Staff Name Column -->
      <template #item.name="{ item }">
        <div class="d-flex align-center ga-3 py-2">
          <span class="font-weight-bold" style="color: #1E1E1E;">
            {{ item.name }}
          </span>
        </div>
      </template>

      <!-- Department Column -->
      <template #item.department="{ item }">
        <v-chip
          color="#FFF3E0"
          size="small"
          text-color="#1E1E1E"
          variant="flat"
        >
          {{ item.department }}
        </v-chip>
      </template>

      <!-- Day Columns -->
      <template
        v-for="(date, index) in weekDates"
        :key="`day_${index}`"
        #[`item.day_${index}`]="{ item }"
      >
        <div class="text-body-2 d-flex align-center justify-center" style="color: #1E1E1E;">
          <!-- Check if it's an order object or just '-' -->
          <template v-if="item[`day_${index}`] !== '-'">
            {{ item[`day_${index}`]?.menuTitle || '-' }}

            <!-- Show a clickable star icon if a review exists -->
            <v-icon
              v-if="item[`day_${index}`]?.rating"
              class="ml-1 cursor-pointer"
              color="amber"
              size="small"
              @click="openReview(item[`day_${index}`])"
            >
              mdi-star
            </v-icon>
          </template>

          <template v-else>
            -
          </template>
        </div>
      </template>

      <!-- Empty State -->
      <template #no-data>
        <div class="text-center py-12">
          <v-icon color="#1E1E1E" size="64">
            mdi-clipboard-text-off-outline
          </v-icon>

          <div class="font-weight-medium mt-4" style="font-size: 20px;">
            No orders for this week
          </div>
        </div>
      </template>

      <!-- No Results State -->
      <template #no-results>
        <div class="text-center py-8">
          <v-icon color="#1E1E1E" size="48">
            mdi-magnify
          </v-icon>

          <div class="font-weight-medium mt-2" style="font-size: 20px;">
            No staff members found for "{{ search }}"
          </div>
        </div>
      </template>
    </v-data-table>

    <ReviewDialog
      v-model="showReviewDialog"
      :order="selectedOrderToReview"
      :readonly="true"
    />

  </v-card>
</template>

<style scoped>
/* Custom table styling */
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
