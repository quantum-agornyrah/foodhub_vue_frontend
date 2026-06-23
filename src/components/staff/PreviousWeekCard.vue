<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'submitted',
    },
    to: {
      type: String,
      default: '/my-order-history',
    },
  })

  const badgeDetails = computed(() => {
    if (props.status === 'in_progress' || props.status === 'draft') {
      return {
        text: 'In progress',
        color: '#FFF3E0',
        textColor: '#EF6C00',
      }
    }
    return {
      text: 'Submitted',
      color: '#E8F5E9',
      textColor: '#2E7D32',
    }
  })
</script>

<template>
  <v-card
    class="pa-5 mb-3 rounded-lg d-flex align-center justify-space-between cursor-pointer"
    style="border: 1px solid #BDBDBD;"
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

    <!-- Right Section -->
    <v-chip
      class="font-weight-bold"
      :color="badgeDetails.color"
      size="small"
      :text-color="badgeDetails.textColor"
      variant="flat"
    >
      {{ badgeDetails.text }}
    </v-chip>
  </v-card>
</template>

<style scoped>

</style>
