<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import loginBg from '@/assets/login-bg.jpg'
  import { useAuthStore } from '../stores/auth.store.js'

  const router = useRouter()
  const authStore = useAuthStore()
  const formRef = ref(null)

  const email = ref('')
  const password = ref('')
  const isLoading = ref(false)
  const showPassword = ref(false)
  const errorMessage = ref('')

  const isFormValid = ref(true)

  const emailRules = [
    value => !!value || 'Email is required',
    value => /.+@.+\..+/.test(value) || 'E-mail must be valid',
  ]

  const passwordRules = [
    value => !!value || 'Password is required',
    value => value.length >= 6 || 'Password must be at least 6 characters',
  ]

  async function onSubmit () {
    // Trigger Vuetify's built-in validation rules programmatically
    if (formRef.value) {
      const { valid } = await formRef.value.validate()
      if (!valid) {
        errorMessage.value = 'Please enter both email and password.'
        return
      }
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      // Call login method from auth store
      const success = await authStore.login(email.value, password.value)

      if (success) {
        // Redirect based on role using Pinia getters
        if (authStore.isHR) {
          router.push('/hr-dashboard')
        } else if (authStore.isStaff) {
          router.push('/staff-dashboard')
        } else {
          router.push('/')
        }
      } else {
        errorMessage.value = authStore.error || 'Invalid credentials. Please try again.'
      }
    } catch {
      errorMessage.value = 'An error occurred connecting to the server.'
    } finally {
      isLoading.value = false
    }
  }
</script>

<template>
  <v-main class="d-flex align-center justify-center pa-sm-4" :style="{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
    <v-card
      class="pa-4 pa-sm-8 mx-auto"
      elevation="0"
      max-width="420"
      style="border: 0.5px solid #D2451E; border-radius: 2px;"
      width="100%"
    >
      <!-- Logo Section -->
      <div class="d-flex align-center justify-center mb-6">
        <v-avatar class="mr-4" color="#F9ECEE" rounded="lg" size="50">
          <v-icon color="#D2451E" size="35">mdi-food-fork-drink</v-icon>
        </v-avatar>

        <span class="font-weight-bold text-title-large">FoodHub</span>
      </div>

      <!-- Error Alert -->
      <v-alert
        v-if="errorMessage"
        class="mb-4"
        density="compact"
        type="error"
        variant="tonal"
      >
        {{ errorMessage }}
      </v-alert>

      <!-- Login Form -->
      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="onSubmit">
        <v-text-field
          v-model="email"
          class="mb-3"
          density="comfortable"
          hide-details="auto"
          label="Email address"
          prepend-inner-icon="mdi-email-outline"
          :rules="emailRules"
          type="email"
          variant="outlined"
        />

        <v-text-field
          v-model="password"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          class="mb-3"
          density="comfortable"
          hide-details="auto"
          label="Password"
          prepend-inner-icon="mdi-lock-outline"
          :rules="passwordRules"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          @click:append-inner="showPassword = !showPassword"
        />

        <!-- Remember me & Forgot password -->
        <div class="d-flex flex-column align-end mb-3">
          <router-link class="text-decoration-none text-error" to="/forgot-password">
            Forgot password?
          </router-link>
        </div>

        <!-- Submit Button -->
        <v-btn
          block
          class="py-5"
          color="#D2451E"
          :disabled="!isFormValid || isLoading"
          elevation="0"
          :loading="isLoading"
          rounded="pill"
          type="submit"
          variant="flat"
        >
          Sign In
        </v-btn>
      </v-form>

      <!-- Create account link -->
      <div class="text-center mt-4">
        <span class="text-grey-darken-1">Don't have an account?</span>

        <router-link class="text-decoration-none text-error ms-1" to="/register">
          Create account
        </router-link>
      </div>
    </v-card>
  </v-main>
</template>
