<script setup>
  import { computed } from 'vue'
  import { DAY_STATUS } from '@/constants/dayStatus'
  import { VENDOR_BG_COLORS, VENDOR_COLORS } from '@/constants/vendors'

// 1. Props Definition
  const props = defineProps({
    // Day prop
    day: {
      type: String,
      required: true,
    },

    // Date prop
    date: {
      type: String,
      required: true,
    },

    // ISO date prop 
    dateString: {
      type: String,
      required: true,
    },

    // Menu items prop
    items: {
      type: Array,
      default: () => [],
    },

    // Active selection prop
    selectedItemId: {
      type: [Number, String],
      default: null,
    },

    // Menu status prop
    status: {
      type: String,
      default: 'open',
    },
  })

// 2. Declare custom action emits
// Even listener for selecting an item
  const emit = defineEmits(['select'])

// 3. Define Computed properties for offday and no items statuses
  const isOffDay = computed(() => props.status === DAY_STATUS.OFF_DAY || props.status === DAY_STATUS.HOLIDAY)
  const isDeadlinePassed = computed(() => props.status === DAY_STATUS.DEADLINE_PASSED)
  const isDisabled = computed(() => isOffDay.value || isDeadlinePassed.value)

  const hasItems = computed(() => props.items && props.items.length > 0)

// 4. Define a general style for food item cards  
  const cardStyles = computed(() => ({
    // General minimum height for card when no food items exist
    minHeight: '300px',

    // General border color
    borderColor: '#D2451E',

    // Border style reference
    borderStyle: isOffDay.value ? 'dashed' : 'solid'
  }))

  // Function to equal both the selected item's id with the item menuid prop
  function isSelected(itemId) {
    return String(itemId) === String(props.selectedItemId)
  }

  // Function to execute the selection event
  function handleSelect (itemId) {
    // Check if card is offday or deadlinepassed
    if (isDisabled.value) return

    // Select a menu using the select emit
    emit('select', { date: props.dateString, itemId })
  }
</script>

<template>
  <v-card
    border
    class="pa-5 d-flex flex-column"
    color="#FFFFFF"
    elevation="0"
    :style="cardStyles"
    :variant="isOffDay ? 'tonal' : 'flat'"
  >
    <!-- Header -->
    <div class="mb-4">
      <div class="font-weight-bold" style="color: #1E1E1E; font-size: 20px;">
        {{ day }}
      </div>

      <div class="font-weight-medium" style="color: #1E1E1E;">
        {{ date }}
      </div>
    </div>

    <!-- Off Day / Holiday State -->
    <div v-if="isOffDay" class="d-flex flex-column align-center justify-center flex-grow-1 py-4 text-center">
      <v-icon class="mb-2" color="#D2451E" size="50">
        mdi-calendar-remove
      </v-icon>
      <div class="font-weight-bold text-subtitle-2" style="color: #D2451E;">
        Off day
      </div>

      <div class="text-caption text-grey-darken-2" style="color: #1E1E1E;">
        {{ status === DAY_STATUS.HOLIDAY ? 'Public holiday' : 'Office closed' }}
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasItems" class="d-flex flex-column align-center justify-center flex-grow-1 text-center">
      <v-icon class="mb-2" color="#D2451E" size="50">
        mdi-food-off-outline
      </v-icon>
      <div class="font-weight-medium" style="font-size: 20px; color: #1E1E1E;">
        No meals added for this day yet
      </div>
    </div>

    <!-- Menu Items List with full details -->
    <div v-else class="d-flex flex-column ga-2 flex-grow-1">
      <v-card
        v-for="item in items"
        :key="item.id"
        class="pa-3 cursor-pointer"
        :disabled="isDeadlinePassed"
        :style="{
          border: '1.5px solid',
          borderColor: isSelected(item.id) ? '#D2451E' : '#BDBDBD',
          backgroundColor: isSelected(item.id) ? '#FADFDC' : 'transparent',
        }"
        variant="flat"
        @click="handleSelect(item.id)"
      >
        <div class="d-flex align-start ga-3">
          
          <!-- Selection indicator (Radio icon) -->
          <div class="flex-shrink-0">
            <v-icon
              :color="isSelected(item.id) ? '#D2451E' : '#BDBDBD'"
              size="20"
            >
              {{ isSelected(item.id) ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
            </v-icon>
          </div>

          <!-- Food Image Thumbnail -->
          <v-avatar class="flex-shrink-0" rounded="lg" size="52" :style="{ backgroundColor: VENDOR_BG_COLORS[item.type] || '#F5F5F5'}">
            <v-img v-if="item.imageUrl" :alt="item.title" cover :src="item.imageUrl" loading="lazy">
              <template #error>
                <div class="d-flex align-center justify-center fill-height">
                  <v-icon :color="VENDOR_COLORS[item.type] || 'grey'" size="25">mdi-food</v-icon>
                </div>
              </template>
            </v-img>

            <div v-else class="d-flex align-center justify-center fill-height">
              <v-icon :color="VENDOR_COLORS[item.type] || 'grey'" size="25">mdi-food</v-icon>
            </div>
          </v-avatar>

          <!-- Text Details -->
          <div class="flex-grow-1 min-width-0">
            <div class="d-flex align-center justify-space-between flex-wrap ga-1 mb-1">
              <span class="text-body-2 font-weight-bold text-grey-darken-4 text-truncate">
                {{ item.title }}
              </span>

              <!-- Type Chip -->
              <v-chip
                v-if="item.type"
                class="font-weight-bold"
                :color="VENDOR_COLORS[item.type] || 'grey'"
                size="small"
                variant="tonal"
              >
                {{ item.type }}
              </v-chip>
            </div>

            <!-- Description -->
            <div v-if="item.description" class="font-weight-medium text-grey-darken-2">
              {{ item.description }}
            </div>
          </div>
        </div>
      </v-card>
    </div>

  </v-card>
</template>

<style scoped>

</style>
