<script setup>
  import { ref, watch } from 'vue'

// 1. Declare the two-way v-model binding
// This handles the prop receiving and emitting updates automatically
  const isVisible = defineModel({
    type: Boolean,
    default: false,
  })

  // 2. Define the rest of the props
  const props = defineProps({

    // Order details prop
    order: {
      type: Object,
      defaul: () => null,
    },
    
    // Read or Write ability prop - True for HR
    readonly: {
      type: Boolean,
      default: false,
    },
    
    // Loading animation prop
    loading: {
      type: Boolean,
      default: false,
    },
  })

// 3. Declare custom action emits
// Even listener for the submit-review button
  const emit = defineEmits(['submit-review'])

  const rating = ref(0)
  const comment = ref('')

  // 4. Watch for changes in reactive values, 
  // trace and get rating and comment fro eah food item when dialog is visible and when an order is selected
  watch([isVisible, () => props.order], () => {
    if (isVisible.value && props.order) {
      rating.value = props.order.rating || 0
      comment.value = props.order.comment || ''
    }
  })

  // Function to close dialog
  function handleClose () {
    // 1. Clean the form
    resetForm()

    // 2. Disable the dialog
    isVisible.value = false
  }

  // Function to submit review
  function submit () {
    // 1. Prevent any error incase orders turn out to be null
    if (!props.orders) return

    // 2. Execute the event 
    emit('submit-review', { 
      id: props.order.id, 
      rating: rating.value, 
      comment: comment.value 
    })
  }

  // Function to clear form inputs
  function resetForm () {
    rating.value = 0
    comment.value = ''
  }
</script>

<template>
  <v-dialog
    max-width="600"
    v-model="isVisible"
    persistent
  >
    <v-card elevation="0" style="border: 2px solid #D2451E;">
      <!-- Dialog Header -->
      <v-card-title class="px-8" style="background-color: #D2451E;">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center ga-3">
            <v-icon color="white" size="26">
              {{ readonly ? 'mdi-comment-text-multiple-outline' : 'mdi-star-face' }}
            </v-icon>
            <h2 class="text-title-medium font-weight-bold text-white">
              {{ readonly ? 'Staff Review' : 'Review Your Meal' }}
            </h2>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="handleClose"
          />
        </div>
      </v-card-title>

      <!-- Dialog Content -->
      <v-card-text class="px-8 pt-10">
        <!-- Rating -->
        <div>
          <label class="font-weight-bold mb-2 d-block" style="color: #1E1E1E;">
            <v-icon class="mr-2">mdi-star-outline</v-icon>
            Rating *
          </label>

          <v-rating
            v-model="rating"
            color="amber"
            :readonly="readonly"
            size="large"
            class="ml-n3"
            density="comfortable"
          />
        </div>

        <!-- Comments -->
        <div>
          <label class="font-weight-bold mb-2 d-block" style="color: #1E1E1E;">
            <v-icon class="mr-2">mdi-note-text-outline</v-icon>
            Comment *
          </label>

          <v-textarea
            v-model="comment"
            placeholder="e.g. The Jollof Rice was a bit salty"
            :readonly="readonly"
            rows="3"
            variant="outlined"
          />
        </div>
      </v-card-text>

      <!-- Dialog Actions -->
      <v-card-actions class="pa-4 pa-sm-6 pt-0 d-flex flex-column-reverse flex-sm-row justify-end ga-3">
        <v-spacer class="d-none d-sm-block" />

        <v-btn
          v-if="!readonly"
          class="text-capitalize font-weight-bold px-sm-8 w-100 w-sm-auto"
          color="#D2451E"
          variant="outlined"
          @click="resetForm"
        >
          Reset
        </v-btn>

        <v-btn
          v-if="!readonly"
          class="text-capitalize font-weight-bold px-sm-8 w-100 w-sm-auto ml-0 ml-sm-2"
          color="#D2451E"
          variant="flat"
          :disabled="loading"
          :loading="loading"
          @click="submit"
        >
          Submit Review
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
