<script setup>
import { useSnackbar } from './composables/useSnackbar';
import { useDisplay } from 'vuetify'

const { isVisible, message, color, timeout, dismiss } = useSnackbar()
const { mobile } = useDisplay()
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
      multi-line
      :max-width="mobile ? '90vw' : '500px'"
      :min-width="mobile ? '0' : '300px'"
      rounded="lg"
      @update:model-value="dismiss"
    >
    
      <span class="text-body-2 font-weight-medium"> {{ message }} </span>

      <template #actions>
        <v-btn 
          density="comfortable"
          variant="text" 
          size="small"
          @click="dismiss"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>
