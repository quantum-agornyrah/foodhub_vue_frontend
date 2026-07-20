<script setup>
  import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import { useAuthStore } from '../../stores/auth.store.js'
  import { useMenuStore } from '../../stores/menu.store.js'
  import HrNav from './HrNav.vue'
  import StaffNav from './StaffNav.vue'
  
  const { mobile } = useDisplay()
  const authStore = useAuthStore()
  const menuStore = useMenuStore()
  const router = useRouter()
  const route = useRoute()

  // Drawer open/close state for mobile
  const drawer = ref(false)

  // Connect websocket when shell mount i.e when user is authenticated
  onMounted(() => {
    if(authStore.isAuthenticated){
      menuStore.connectWebSocket()
    }
  })

  // Diconnect when user logs out or shell unmounts
  onBeforeUnmount(() => {
    menuStore.disconnectWebSocket()
  })

  // Automatically closes a mobile navigation drawer whenever the user navigates to a new page
  watch(
    () => route.path, 
    () => {
      drawer.value = false
    }
  )

  // Role Detection Logic
  const role = computed(() => {
    // Check if user is authenticated and get the user's role
    if (authStore.isAuthenticated && authStore.userInfo?.role) {

      // Get the role as the result
      return authStore.userInfo.role
    }
    // Fallback: Check the route path to see if a particular URL link is (hr) specific
    // If yes, role is set as (hr)
    const path = router.currentRoute.value
    if (path.meta.roles?.includes('hr')) {
      return 'hr'
    }
    return 'staff'
  })

  // Function to log out a user
  function logout () {
    authStore.logout()
    router.push({ path: '/login' })
  }

</script>

<template>
  <v-row class="fill-height">

    <!-- NAV-BAR FOR DESKTOP -->
    <v-navigation-drawer
      v-if="!mobile"
      color="#D2451E"
      expand-on-hover
      permanent
      rail
      width="280"
    >

      <v-list>
        <v-list-item>
          <template #prepend>
            <v-icon size="27">mdi-food-fork-drink</v-icon>
          </template>

          <span class="font-weight-bold text-title-large">FoodHub</span>
        </v-list-item>
      </v-list>

      <v-divider class="border-opacity-25" color="white" />

      <!-- Role-based nav -->
      <HrNav v-if="role === 'hr'" />
      <StaffNav v-else-if="role === 'staff'" />
    </v-navigation-drawer>

    <!-- NAV-BAR FOR MOBILE & TABLET -->
    <v-app-bar v-if="mobile" color="#D2451E" flat height="80">
      <template #prepend>
        <v-btn
          :icon="drawer ? 'mdi-close' : 'mdi-menu'"
          size="55"
          variant="text"
          @click="drawer = !drawer"
        />
      </template>

      <v-app-bar-title class="d-flex justify-center font-weight-bold text-white">
        <div>
          <v-avatar class="mr-3" color="#F9ECEE" rounded="lg" size="40">
            <v-icon color="#D2451E" size="33">mdi-food-fork-drink</v-icon>
          </v-avatar>

          <span class="font-weight-bold text-title-large">FoodHub</span>
        </div>
      </v-app-bar-title>
    </v-app-bar>

    <!-- NAV-BAR FOR TABLET & MOBILE -->
    <v-navigation-drawer
      v-if="mobile"
      v-model="drawer"
      color="#D2451E"
      temporary
      width="280"
    >

      <v-divider class="border-opacity-25" color="white" />

      <!-- Role-based nav -->
      <HrNav v-if="role === 'hr'" />
      <StaffNav v-else-if="role === 'staff'" />
    </v-navigation-drawer>

    <!-- Page content renders here -->
    <v-main>
      <div class="pa-2">
        <slot />
      </div>
    </v-main>

  </v-row>
</template>

<style scoped>

</style>
