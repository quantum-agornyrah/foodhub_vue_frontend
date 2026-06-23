<script setup>
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
        to="/hr-dashboard"
        value="dashboard"
      />

      <v-list-item
        active-class="bg-primary-light text-primary font-weight-bold"
        class="text-white rounded-lg mb-1"
        prepend-icon="mdi-silverware-fork-knife"
        title="Menu manager"
        to="/menu-manager"
        value="menu manager"
      />

      <v-list-item
        active-class="bg-primary-light text-primary font-weight-bold"
        class="text-white rounded-lg mb-1"
        prepend-icon="mdi-clipboard-list-outline"
        title="Orders"
        to="/order-summary"
        value="orders"
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
