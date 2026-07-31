<script setup>
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
        to="/hr"
        active-class="bg-primary-light text-primary font-weight-bold"
      />

      <v-list-item
        prepend-icon="mdi-silverware-fork-knife"
        title="Menu manager"
        to="/hr/menu"
        active-class="bg-primary-light text-primary font-weight-bold"
      />

      <v-list-item
        prepend-icon="mdi-clipboard-list-outline"
        title="Orders"
        to="/hr/orders"
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
