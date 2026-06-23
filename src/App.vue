<script setup>
import { useSnackbar } from './composables/useSnackbar';
const { isVisible, message, color, timeout, dismiss } = useSnackbar()
</script>

<template>
  <v-app>
    <router-view />

    <!-- Global Snackbar Host -->
    <v-snackbar
      :model-value="isVisible"
      :color="color"
      :timeout="timeout"
      location="top"
      @update:model-value="dismiss"
    >
      {{ message }}
      <template #actions>
        <v-btn variant="text" @click="dismiss">Close</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>
