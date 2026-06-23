<script setup>
// Reusable empty state component
  defineProps({
    icon: {
      type: String,
      default: 'mdi-inbox-outline',
    },
    title: {
      type: String,
      default: 'Nothing here yet',
    },
    subtitle: {
      type: String,
      default: '',
    },
  })
</script>

<template>
  <div class="d-flex flex-column align-center justify-center py-12 text-center">
    <v-avatar class="mb-4" color="#F5F4F0" size="72">
      <v-icon color="grey-darken-1" :icon="icon" size="36" />
    </v-avatar>

    <div class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-1">
      {{ title }}
    </div>

    <div v-if="subtitle" class="text-body-2 text-grey-darken-1" style="max-width: 280px;">
      {{ subtitle }}
    </div>
  </div>
</template>
