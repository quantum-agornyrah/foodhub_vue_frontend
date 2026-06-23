<script setup>
  import { computed } from 'vue'
  import FoodItemChip from './FoodItemChip.vue'

  const props = defineProps({
    day: {
      type: String,
      required: true, // e.g., "Mon", "Tue"
    },
    date: {
      type: String,
      required: true, // e.g., "Jun 9"
    },
    dateString: {
      type: String,
      required: true, // e.g., "2026-06-09"
    },
    items: {
      type: Array,
      default: () => [], // Array of food items { id, name, description }
    },
    orderedCount: {
      type: Number,
      default: 0,
    },
    totalStaff: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: 'open', // 'open', 'off', 'holiday'
      validator: value => ['open', 'off_day', 'holiday', 'deadline_passed', 'no-items'].includes(value),
    },
    canEdit: {
      type: Boolean,
      default: false, // True for HR users
    },
  })

  const emit = defineEmits(['add-item', 'edit-item', 'delete-item'])

  // Computed properties
  const isOffDay = computed(() => props.status === 'off_day' || props.status === 'holiday')

  const hasItems = computed(() => props.items && props.items.length > 0)

  const cardBorderColor = computed(() => {
    if (isOffDay.value) return '#D2451E'
    if (!hasItems.value) return '#D2451E'
    if (props.orderedCount > 0) return '#D2451E'
    return '#BDBDBD'
  })

  const cardBackgroundColor = computed(() => {
    if (isOffDay.value) return '#D2451E'
    if (!hasItems.value) return '#F5F5F5'
    return 'white'
  })

  // Functions
  function handleAddItem () {
    emit('add-item', { day: props.day, date: props.date, dateString: props.dateString })
  }
</script>

<template>
  <v-card
    :border="true"
    :class="[
      'pa-5',
      { 'dashed-border': !hasItems && !isOffDay }
    ]"
    :color="cardBackgroundColor"
    elevation="0"
    style="min-height: 280px;"
    :style="{
      borderColor: cardBorderColor,
      borderStyle: !hasItems && !isOffDay ? 'dashed !important' : 'solid !important'
    }"
    :variant="isOffDay ? 'outlined' : 'flat'"
  >
    <!-- Day Header -->
    <div class="mb-4">
      <div class="font-weight-bold" style="font-size: 20px;">
        {{ day }}
      </div>

      <div class="text-caption">
        {{ date }}
      </div>
    </div>

    <!-- Off Day State -->
    <div v-if="isOffDay" class="text-center py-6">
      <v-avatar class="mb-2" color="red-lighten-5" size="48">
        <v-icon color="red-darken-1" size="24">
          mdi-beach
        </v-icon>
      </v-avatar>

      <div class="font-weight-bold" style="font-size: 20px;">
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

    <!-- Food Items List (Compact with images) -->
    <div v-else class="d-flex flex-column ga-2 mb-4" style="max-height: 240px; overflow-y: auto;">
      <FoodItemChip
        v-for="item in items"
        :key="item.id"
        :compact="true"
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
      style="color: white !important;"
      variant="flat"
      @click="handleAddItem"
    >
      {{ hasItems ? 'Add item' : 'Add items' }}
    </v-btn>
  </v-card>
</template>
