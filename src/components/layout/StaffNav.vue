<script setup>
// Presentation component for Worker Navigation list
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '../../stores/auth.store.js'

  const authStore = useAuthStore()
  const router = useRouter()

  function logout () {
    authStore.logout()
    router.push({ path: '/login' })
  }
</script>

<template>
  <div>
    <v-list class="bg-transparent" density="compact" nav>
      <v-list-item
        active-class="bg-primary-light text-primary font-weight-bold"
        class="text-white rounded-lg mb-1"
        prepend-icon="mdi-view-dashboard-outline"
        title="Dashboard"
        to="/staff-dashboard"
        value="dashboard"
      />

      <v-list-item
        active-class="bg-primary-light text-primary font-weight-bold"
        class="text-white rounded-lg mb-1"
        prepend-icon="mdi-calendar-check-outline"
        title="Order this week"
        to="/weekly-overview"
        value="order-week"
      />

      <v-list-item
        active-class="bg-primary-light text-primary font-weight-bold"
        class="text-white rounded-lg mb-1"
        prepend-icon="mdi-history"
        title="My history"
        to="/my-order-history"
        value="my-history"
      />

      <v-list-item
        active-class="bg-primary-light text-primary font-weight-bold"
        class="text-white rounded-lg mb-1"
        prepend-icon="mdi-logout"
        title="Sign out"
        value="signout"
        @click="logout"
      />
    </v-list>
  </div>
</template>
