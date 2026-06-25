<script setup>
  import { computed } from 'vue'
  import { DAY_STATUS } from '@/constants/dayStatus'

  const props = defineProps({
    weekDays: {
      type: Array,
      required: true,
    },
    selections: {
      type: Object,
      required: true,
    },
    menuItems: {
      type: Array,
      required: true,
    },
    isSubmitting: {
      type: Boolean,
      default: false,
    },
    isSavingDraft: {
      type: Boolean,
      default: false,
    },
    isSubmittingAll: {
      type: Boolean,
      default: false,
    },
    isDeadlinePassed: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['submit', 'save-draft'])

  // Resolve name/status for each day
  const summaryItems = computed(() => {
    return props.weekDays.map(day => {
      const isOff = day.status === DAY_STATUS.OFF_DAY || day.status === DAY_STATUS.HOLIDAY
      const itemId = props.selections[day.date]
      const selectedItem = props.menuItems.find(item => String(item.id) === String(itemId))

      let displayText = 'Not selected yet'
      let textStyle = { color: '#8C8C8C', fontStyle: 'italic' }
      let isOffDay = false

      if (isOff) {
        displayText = 'Off day'
        textStyle = { color: '#C62828', fontWeight: 'bold' }
        isOffDay = true
      } else if (selectedItem) {
        displayText = selectedItem.title
        textStyle = { color: '#1E1E1E', fontWeight: 'bold' }
      }

      return {
        date: day.date,
        dayLabel: day.dayName || day.label?.split(' ')[0] || 'Day',
        displayText,
        textStyle,
        isOffDay,
      }
    })
  })

  // Check if at least one choice is made
  const hasSelections = computed(() => {
    return Object.values(props.selections).some(id => id !== null && id !== undefined)
  })
</script>

<template>
  <v-card
    class="pa-5 mb-8"
    style="background-color: #D2451E;"
    variant="flat"
  >
    <div class="font-weight-medium text-white mb-4" style="font-size: 20px;">
      Your Order Actions
    </div>

    <!-- Summary List -->
    <!-- <v-list class="pa-5 rounded-lg mb-6 d-flex flex-column ga-3">
      <div
        v-for="item in summaryItems"
        :key="item.date"
        class="d-flex align-center justify-space-between py-1"
      >
        <span class="font-weight-medium" style="width: 70px; font-size: 17px;">
          {{ item.dayLabel }}
        </span>

        <div class="d-flex align-center justify-end flex-grow-1">
          <v-icon
            v-if="item.isOffDay"
            class="mr-1"
            color="#C62828"
            size="16"
          >
            mdi-umbrella-beach-outline
          </v-icon>

          <span style="font-size: 17px;" :style="item.textStyle">
            {{ item.displayText }}
          </span>
        </div>
      </div>
    </v-list> -->

    <!-- <v-alert
      v-if="isDeadlinePassed"
      type="warning"
      variant="tonal"
      density="compact"
      class="mb-4 text-caption"
      text="The ordering deadline for this week has passed. Selections cannot be modified."
    /> -->

    <!-- Buttons -->
    <div class="d-flex flex-column flex-sm-row ga-3 mb-3">
      <!-- Save Draft Button (Now on the left) -->
      <v-btn
        class="text-capitalize font-weight-medium rounded-lg py-5 flex-1-1"
        :class="{ 'disabled-white-btn': !hasSelections || isSavingDraft || isSubmittingAll || isDeadlinePassed }"
        :disabled="!hasSelections || isSavingDraft || isSubmittingAll || isDeadlinePassed"
        :loading="isSavingDraft"
        :style="{
          backgroundColor: 'white !important',
          color: (!hasSelections || isSavingDraft || isSubmittingAll || isDeadlinePassed) ? 'rgba(0,0,0,0.38) !important' : '#1E1E1E !important'
        }"
        variant="flat"
        @click="emit('save-draft')"
      >
        Save as Draft
      </v-btn>

      <!-- Submit All Button (Now on the right) -->
      <v-btn
        class="text-capitalize font-weight-medium rounded-lg py-5 flex-1-1"
        color="white"
        :disabled="!hasSelections || isSubmitting || isDeadlinePassed"
        :loading="isSubmittingAll"
        prepend-icon="mdi-send-outline"
        variant="outlined"
        @click="emit('submit')"
      >
        Submit all selections
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
/* Override Vuetify's disabled button styling */
:deep(.v-btn.v-btn--disabled) {
  opacity: 1 !important;
}

.disabled-white-btn {
  pointer-events: none;
  cursor: not-allowed;
}

</style>
