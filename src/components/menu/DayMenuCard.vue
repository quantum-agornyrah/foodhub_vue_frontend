<script setup>
  import { computed } from 'vue'
  import FoodItemChip from './FoodItemChip.vue'

// 1. Prop Definition
  const props = defineProps({

    // Day prop e.g. "Mon", "Tue"
    day: {
      type: String,
      required: true,
    },

    // Date prop e.g. "Jun 9"
    date: {
      type: String,
      required: true,
    },

    // Date ISO format prop e.g. "2026-06-09"
    dateString: {
      type: String,
      required: true,
    },

    // Array of food items { id, name, description } for THAT day prop
    items: {
      type: Array,
      default: () => [],
    },

    // Number of staff orders prop
    orderedCount: {
      type: Number,
      default: 0,
    },

    // Number of staff prop
    totalStaff: {
      type: Number,
      default: 0,
    },

    // Status of day prop
    status: {
      type: String,
      default: 'open',
      validator: value => ['open', 'off_day', 'holiday', 'deadline_passed', 'no-items'].includes(value),
    },

    // Prop to enable and disable edits
    // True for HR users
    canEdit: {
      type: Boolean,
      default: false,
    },
  })

// 2. Declare custom action emits
// Even listener for confirm button and the cancel button
  const emit = defineEmits(['add-item', 'edit-item', 'delete-item'])

// 3. Define Computed properties for offday and no items statuses
  const isOffDay = computed(() => props.status === 'off_day' || props.status === 'holiday')
  const hasItems = computed(() => props.items && props.items.length > 0)

// 4. Define a general style for food item cards  
  const cardStyles = computed(() => ({
    // General minimum height for card when no food items exist
    minHeight: '260px',

    // Border color reference
    borderColor: '#D2451E',

    // Border style reference
    borderStyle: !hasItems.value && !isOffDay.value ? 'dashed' : 'solid'
  }))

  // Function to execute the add-item button
  function handleAddItem () {
    emit('add-item', { 
      day: props.day, 
      date: props.date, 
      dateString: props.dateString 
    })
  }
</script>

<template>
  <v-card
    border
    elevation="0"
    class="pa-5"
    :style="cardStyles"
    :variant="isOffDay ? 'outlined' : 'flat'"
  >
    <!-- Day Header -->
    <div class="mb-4">
      <div class="font-weight-bold text-black" style="font-size: 20px;">
        {{ day }}
      </div>

      <div class="text-caption text-black">
        {{ date }}
      </div>
    </div>

    <!-- Off Day State -->
    <div v-if="isOffDay" class="text-center py-6">
      <v-icon color="#D2451E" size="50" class="mb-2 mt-n4">
        mdi-calendar-remove
      </v-icon>

      <div class="font-weight-bold text-black" style="font-size: 20px;">
        Off day
      </div>

      <div class="text-caption">
        {{ status === 'holiday' ? 'Public holiday' : 'No Work' }}
      </div>
    </div>

    <!-- No Items Yet State -->
    <div v-else-if="!hasItems" class="text-center py-6">
      <div class="font-weight-bold" style="font-size: 20px;">
        No items yet
      </div>
    </div>

    <!-- Food Items List with images -->
    <div v-else class="d-flex flex-column ga-2 mb-4" style="max-height: 240px; overflow-y: auto">
      <FoodItemChip
        v-for="item in items"
        :key="item.id"
        :description="item.description"
        :image-url="item.imageUrl"
        :title="item.title"
        :type="item.type"
      />
    </div>

    <!-- Spacer to push order counts and buttons to the bottom -->
    <v-spacer />

    <!-- Order Count -->
    <div v-if="!isOffDay && hasItems" class="text-caption mb-3">
      {{ orderedCount }} / {{ totalStaff }} ordered
    </div>

    <!-- Add Item Button (HR only) -->
    <v-btn
      v-if="canEdit && !isOffDay"
      block
      class="rounded-lg"
      color="#D2451E"
      prepend-icon="mdi-plus"
      variant="flat"
      @click="handleAddItem"
    >
      {{ hasItems ? 'Add item' : 'Add items' }}
    </v-btn>
  </v-card>
</template>
