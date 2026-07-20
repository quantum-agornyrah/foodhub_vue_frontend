<script setup>
// Presentation component for Worker Navigation list
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth.store.js'

  const authStore = useAuthStore()
  const router = useRouter()

  // Function to logout a user
  function logout () {
    authStore.logout()
    router.push({ path: '/login' })
  }
</script>

<template>
  <div>
    <v-list class="bg-transparent" density="compact" nav>
      <v-list-item
        prepend-icon="mdi-view-dashboard-outline"
        title="Dashboard"
        to="/staff-dashboard"
        active-class="bg-primary-light text-primary font-weight-bold"
      />

      <v-list-item
        prepend-icon="mdi-calendar-check-outline"
        title="Order this week"
        to="/weekly-overview"
        active-class="bg-primary-light text-primary font-weight-bold"
      />

      <v-list-item
        prepend-icon="mdi-history"
        title="My history"
        to="/my-order-history"
        active-class="bg-primary-light text-primary font-weight-bold"
      />

      <v-list-item
        prepend-icon="mdi-logout"
        title="Sign out"
        @click="logout"
        active-class="bg-primary-light text-primary font-weight-bold"
      />
    </v-list>
  </div>
</template>
