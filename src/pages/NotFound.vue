<template>
  <v-main class="d-flex align-center justify-center" :style="{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
    <v-card
      class="pa-8 mx-auto"
      elevation="0"
      max-width="420"
      style="border: 0.5px solid #D2451E; border-radius: 2px;"
      width="100%"
    >
      <!-- Icon -->
      <div class="text-center mb-4">
        <v-icon color="#D2451E" size="64">mdi-emoticon-sad-outline</v-icon>
      </div>
      <!-- Title -->
      <h2 class="text-h6 font-weight-bold text-center">404</h2>
      <h2 class="text-h6 font-weight-bold text-center mb-4 mt-n6">Page NOT FOUND</h2>
      <!-- Back Home Button -->
      <v-btn
        block
        class="py-5"
        color="#D2451E"
        elevation="0"
        rounded="pill"
        variant="flat"
        @click="() => $router.push('/')"
      >
        Back to Home
      </v-btn>
    </v-card>
  </v-main>
</template>

<script setup>

  import loginBg from '@/assets/login-bg.jpg'

</script>
