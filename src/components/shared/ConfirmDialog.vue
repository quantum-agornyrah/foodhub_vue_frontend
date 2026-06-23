<script setup>
// Reusable confirmation dialog redesigned to match Add/Edit staff modals
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Are you sure?',
    },
    message: {
      type: String,
      default: 'This action cannot be undone.',
    },
    confirmLabel: {
      type: String,
      default: 'Confirm',
    },
    cancelLabel: {
      type: String,
      default: 'Cancel',
    },
    confirmColor: {
      type: String,
      default: '#58111A',
    },
    icon: {
      type: String,
      default: 'mdi-help-circle-outline',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

  function onConfirm () {
    emit('confirm')
  }

  function onCancel () {
    emit('update:modelValue', false)
    emit('cancel')
  }
</script>

<template>
  <v-dialog
    max-width="600"
    :model-value="modelValue"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card elevation="0" style="border: 2px solid #D2451E;">
      <!-- Title Header Bar -->
      <v-card-title class="px-8" style="background-color: #D2451E;">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center ga-3">
            <v-icon class="mr-2" color="white">{{ icon }}</v-icon>

            <h2 class="text-title-large font-weight-bold text-white">
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
      <v-card-actions class="pa-6 pt-0">
        <v-spacer />

        <v-btn
          class="text-capitalize font-weight-bold px-14"
          color="#1E1E1E"
          :disabled="loading"
          variant="outlined"
          @click="onCancel"
        >
          {{ cancelLabel }}
        </v-btn>

        <v-btn
          class="text-capitalize font-weight-bold px-14"
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
