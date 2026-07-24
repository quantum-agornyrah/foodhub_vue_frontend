<script setup>
  import { computed } from 'vue'

// 1. Props Definition
  const props = defineProps({
    // Food title prop
    title: {
      type: String,
      required: true,
    },

    // Food description prop
    subtitle: {
      type: String,
      default: '',
    },

    // Food status prop { open, off_day, holiday, deadline_passed }
    status: {
      type: String,
      default: 'submitted',
    },

    // Route prop
    to: {
      type: String,
      default: '/my-order-history',
    },
  })

</script>

<template>
  <v-card
    class="pa-5 mb-3 d-flex align-center justify-space-between cursor-pointer"
    style="border: 1px solid #D2451E;"
    :to="to"
    variant="flat"
  >
    <!-- Left Section -->
    <div>
      <div class="font-weight-bold mb-1" style="font-size: 18px;">
        {{ title }}
      </div>

      <div class="font-weight-medium" style="font-size: 17px;">
        {{ subtitle }}
      </div>
    </div>
  </v-card>
</template>

<style scoped>

</style>
