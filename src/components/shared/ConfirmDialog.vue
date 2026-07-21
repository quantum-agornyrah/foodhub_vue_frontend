<script setup>
// 1. Declare the two-way v-model binding
// This handles the prop receiving and emitting updates automatically
  const isVisible = defineModel({
    type: Boolean,
    default: false,
  })

// 2. Declare remaining component props
  const props = defineProps({

    // Confirmation title prop
    title: {
      type: String,
      default: 'Are you sure?',
    },

    // Confirmation message/Info prop
    message: {
      type: String,
      default: 'This action cannot be undone.',
    },

    // Confirm button text prop
    confirmLabel: {
      type: String,
      default: 'Confirm',
    },

    // Cancel button text prop
    cancelLabel: {
      type: String,
      default: 'Cancel',
    },

    // Confirm button color prop
    confirmColor: {
      type: String,
      default: '#D2451E',
    },

    // Dialog header icon prop
    icon: {
      type: String,
      default: 'mdi-help-circle-outline',
    },

    // Loading annimation prop
    loading: {
      type: Boolean,
      default: false,
    },
  })

// 3. Declare custom action emits
// Even listener for confirm button and the cancel button
  const emit = defineEmits(['confirm', 'cancel'])

  // Function to execute the confirm button
  function onConfirm () {
    // Execute the confirm button
    emit('confirm')
  }

  // Function to execute the cancel button
  function onCancel () {
    // 1. Close the dialog
    isVisible.value = false

    // 2. Execute the cancel button
    emit('cancel')
  }
</script>

<template>
  <v-dialog
    max-width="600"
    v-model="isVisible"
    persistent
  >
    <v-card elevation="0" style="border: 2px solid #D2451E;">
      <!-- Title Header Bar -->
      <v-card-title class="px-8" style="background-color: #D2451E;">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center ga-3">
            <v-icon class="mr-2" size="26" color="white">{{ icon }}</v-icon>

            <h2 class="text-title-medium font-weight-bold text-white">
              {{ title }}
            </h2>
          </div>

          <v-btn
            color="white"
            density="comfortable"
            icon="mdi-close"
            variant="text"
            @click="onCancel"
          />
        </div>
      </v-card-title>

      <v-divider class="mb-5" />

      <!-- Dialog Core Message -->
      <v-card-text class="px-8 pt-4">
        <div class="text-body-1 mb-6 text-grey-darken-3 font-weight-medium">
          {{ message }}
        </div>
      </v-card-text>

      <!-- Consistent Actions Layout -->
      <v-card-actions class="pa-4 pa-sm-6 pt-0 d-flex flex-column-reverse flex-sm-row justify-end ga-3">
        <v-spacer class="d-none d-sm-block" />

        <v-btn
          class="text-capitalize font-weight-bold px-sm-14 w-100 w-sm-auto"
          color="#1E1E1E"
          :disabled="loading"
          variant="outlined"
          @click="onCancel"
        >
          {{ cancelLabel }}
        </v-btn>

        <v-btn
          class="text-capitalize font-weight-bold px-sm-14 w-100 w-sm-auto ml-0 ml-sm-2"
          color="#D2451E"
          :loading="loading"
          variant="flat"
          @click="onConfirm"
        >
          {{ confirmLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
