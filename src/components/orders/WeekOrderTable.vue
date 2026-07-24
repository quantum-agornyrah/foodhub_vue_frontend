<script setup>
  import { computed, ref } from 'vue'
  import ReviewDialog from '@/components/shared/ReviewDialog.vue'

  // Search functionality
  const search = ref('')
  const showReviewDialog = ref(false)
  const selectedOrderToReview = ref(null)

// 1. Props Definition
  const props = defineProps({
    // Orders props
    orders: {
      type: Array,
      default: () => [],
    },

    // Dates for which food was chosen prop
    weekDates: {
      type: Array,
      default: () => [],
    },
  })

// 2. Function to enable review dialog on a paticular food order
  function openReview (order) {
    // If no order exists(offDay) or nor rating exists on an order
    if (!order || !order.rating) return

    // Mark the order that exists as active and open the dialog on that particular order
    selectedOrderToReview.value = order
    showReviewDialog.value = true
  }

// 3. Define the table elements
  // Define day names for table column headers
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

  // Define other table headers
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

// 4. Define the table data with the props
  const tableData = computed(() => {

    // Create a unique group to hold unique staff and orders
    const staffGroup = new Map()
    const ordersGroup = new Map()

    // Loop through each order object inside the props.orders array.
    for (const order of props.orders) {

      // Check if this staffId is already stored in the staffGroup map
      if (!staffGroup.has(order.staffId)) {

        // If NOT, add that particular order object to the staff group 
        // with staff-d as the unique id
        staffGroup.set(order.staffId, {
          id: order.staffId,
          name: order.staffName || 'Unknown',
          department: order.department || 'N/A',
        })
      }

      // Assign a new index value for orders to aid easy lookup
      const orderGroupId = `${order.staffId}_${order.date}`
      ordersGroup.set(orderGroupId, order)
    }

    // Convert the mapped object or group back into an array
    // and then loop through each staff member to 
    // format a single table row (row) for them.
    return Array.from(staffGroup.values()).map(staff => {
      const row = {
        id: staff.id,
        name: staff.name,
        department: staff.department,
      }

      // Attach unique staff order using the ordergroupID per date index
      props.weekDates.forEach((date, index) => {
        // Define the unique id again for easy loop using both staffId and date
        const orderGroupId = `${staff.id}_${date}`

        // For each day, assign the order by staff correctly
        row[`day_${index}`] = ordersGroup.get(orderGroupId) || '-'
      })

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
      <template v-slot:item.name="{ item }">
        <div class="d-flex align-center ga-3 py-2">
          <span class="font-weight-bold" style="color: #1E1E1E;">
            {{ item.name }}
          </span>
        </div>
      </template>

      <!-- Department Column -->
      <template v-slot:item.department="{ item }">
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
        v-slot:[`item.day_${index}`]="{ item }"
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

      <!-- Single Combined Empty & Search State -->
      <template v-slot:no-data>

        <!-- 1. Empty State -->
        <div v-if="!search" class="text-center py-12">
          <v-icon color="#1E1E1E" size="64">
            mdi-clipboard-text-off-outline
          </v-icon>

          <div class="font-weight-medium mt-4" style="font-size: 20px;">
            No orders for this week
          </div>
        </div>

        <!-- 2. Search Fallback -->
        <div v-else class="text-center py-8">
          <v-icon color="#1E1E1E" size="64">
            mdi-magnify
          </v-icon>

          <div class="font-weight-medium mt-4" style="font-size: 20px;">
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
