<script setup>
  const props = defineProps({
    status: {
      type: String,
      required: true,
      validator: value => ['submitted', 'pending', 'draft', 'off'].includes(value.toLowerCase()),
    },
  })

  // Status color mapping
  const statusConfig = {
    submitted: {
      color: '#2E7D32',
      bgColor: '#E8F5E9',
      label: 'Submitted',
    },
    pending: {
      color: '#F57C00',
      bgColor: '#FFF3E0',
      label: 'Pending',
    },
    draft: {
      color: '#F57C00',
      bgColor: '#FFF3E0',
      label: 'Pending',
    },
    off: {
      color: '#D32F2F',
      bgColor: '#FFEBEE',
      label: 'Off',
    },
  }

  const config = statusConfig[props.status.toLowerCase()] || statusConfig.pending
</script>

<template>
  <v-chip
    size="small"
    :style="{
      backgroundColor: config.bgColor,
      color: config.color,
      fontWeight: 600
    }"
    variant="flat"
  >
    {{ config.label }}
  </v-chip>
</template>
