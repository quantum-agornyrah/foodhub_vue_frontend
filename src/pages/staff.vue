<script setup>
  // File-based routing meta definition
  definePage({
    meta: {
      requiresAuth: true,
      roles: ['staff'],
    },
  })

  import AppShell from '@/components/layout/AppShell.vue'

</script>

<template>
  <AppShell>
    <router-view v-slot="{ Component }">
      <v-fade-transition mode="out-in">
        <component :is="Component" />
      </v-fade-transition>
    </router-view>
  </AppShell>
</template>