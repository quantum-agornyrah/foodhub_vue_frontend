<script setup>
  import { computed } from 'vue'
  import { DAY_STATUS } from '@/constants/dayStatus'

// 1. Props Definition
  const props = defineProps({
    // Day of the week prop
    weekDays: {
      type: Array,
      required: true,
    },

    // Selected food items prop
    selections: {
      type: Object,
      required: true,
    },

    // Food menu prop
    menuItems: {
      type: Array,
      required: true,
    },

    // Submitted menu items prop
    isSubmitted: {
      type: Boolean,
      default: false,
    },

    // Submitting prop
    isSubmitting: {
      type: Boolean,
      default: false,
    },

    // Save as draft prop
    isSavingDraft: {
      type: Boolean,
      default: false,
    },

    // Deadline check prop
    isDeadlinePassed: {
      type: Boolean,
      default: false,
    },
    
    // Submission after deadline passed prop
    isSubmittingAll: {
      type: Boolean,
      default: false,
    },
  })

// 2. Declare custom action emits
// Even listener for submitting an order
  const emit = defineEmits(['submit', 'save-draft'])

// 4. Check if at least one selectiion of food menu item is made
  const hasSelections = computed(() => {
    return Object.values(props.selections).some(id => id !== null && id !== undefined)
  })

// 4. Declare a disabling logic
const isActionDisabled = computed(() => {
  return !hasSelections.value || props.isSavingDraft || props.isSubmittingAll || props.isSubmitted || props.isDeadlinePassed
})
</script>

<template>
  <v-card
    class="pa-5 mb-8"
    color="#D2451E"
    variant="flat"
  >
    <div class="font-weight-medium text-white text-center mb-4" style="font-size: 20px;">
      Your Order Actions
    </div>

    <!-- Buttons -->
    <div class="d-flex flex-column ga-3 mb-3">
      <!-- Save Draft Button -->
      <v-btn
        class="text-capitalize font-weight-bold rounded-lg py-5 w-100"
        prepend-icon="mdi-file-document-edit-outline"
        :disabled="isActionDisabled"
        :loading="isSavingDraft"
        color="white"
        variant="flat"
        @click="emit('save-draft')"
      >
        Save as Draft
      </v-btn>

      <!-- Submit All Button -->
      <v-btn
        class="text-capitalize font-weight-bold rounded-lg py-5 w-100"
        color="white"
        :disabled="isActionDisabled"
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

</style>
