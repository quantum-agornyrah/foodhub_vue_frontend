<script setup>
  import { computed } from 'vue'
  import { VENDOR_BG_COLORS, VENDOR_COLORS } from '@/constants/vendors'

// 1. Prop Definition
  const props = defineProps({

    // Food title prop
    title: {
      type: String,
      required: true,
    },

    // Food description prop
    description: {
      type: String,
      default: '',
    },

    // Food image url prop
    imageUrl: {
      type: String,
      default: '',
    },

    // Food vendor type prop
    type: {
      type: String,
      default: '',
    },
  })

// 2. Define vendor description styles to each food item
  const typeBadgeColor = computed(() => VENDOR_COLORS[props.type] || '#888888')
  const typeIconBg = computed(() => VENDOR_BG_COLORS[props.type] || '#F5F5F5')
</script>

<template>
  <!-- Mini row (Compact Mode) -->
  <div class="compact-food d-flex align-center ga-2 pa-2 rounded-lg">
    <v-avatar class="flex-shrink-0" rounded="md" size="40" :style="{ backgroundColor: typeIconBg }">
      <v-img v-if="imageUrl" :alt="title" cover :src="imageUrl">
        <template #error>
          <v-icon :color="typeBadgeColor" size="22">mdi-food</v-icon>
        </template>
      </v-img>
      <v-icon v-else :color="typeBadgeColor" size="22">mdi-food</v-icon>
    </v-avatar>

    <div class="flex-grow-1 min-width-0">
      <div class="font-weight-medium text-truncate">
        {{ title }}
      </div>
    </div>

    <!-- Type Badge Dot -->
    <div
      class="vendor-type-dot flex-shrink-0"
      :style="{ backgroundColor: typeBadgeColor }"
      :title="type"
    />
  </div>
</template>

<style scoped>
.compact-food {
  background-color: #FAFAF8;
  border: 1px solid #F0EDE8;
  transition: background-color 0.15s ease;
}

.compact-food:hover {
  background-color: #F5F2EC;
  cursor: pointer;
}

.vendor-type-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>