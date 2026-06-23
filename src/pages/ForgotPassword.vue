<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import loginBg from '@/assets/login-bg.jpg'

  const router = useRouter()
  const formRef = ref(null)

  const email = ref('')
  const isLoading = ref(false)
  const errorMessage = ref('')
  const isFormValid = ref(true)
  const emailSent = ref(false) // Tracks whether the reset email was sent

  const emailRules = [
    value => !!value || 'Email is required',
    value => /.+@.+\..+/.test(value) || 'E-mail must be valid',
  ]

  async function onSubmit () {
    if (formRef.value) {
      const { valid } = await formRef.value.validate()
      if (!valid) {
        errorMessage.value = 'Please enter a valid email address.'
        return
      }
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      // TODO: Replace with actual API call e.g. await authStore.forgotPassword(email.value)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Show success state
      emailSent.value = true
    } catch {
      errorMessage.value = 'An error occurred. Please try again.'
    } finally {
      isLoading.value = false
    }
  }
</script>

<template>
  <v-main class="d-flex align-center justify-center" :style="{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
    <v-card
      class="pa-8 mx-auto"
      elevation="0"
      max-width="420"
      style="border: 0.5px solid #D2451E; border-radius: 2px;"
      width="100%"
    >
      <!-- Logo Section -->
      <div class="d-flex align-center justify-center mb-4">
        <v-avatar class="mr-4" color="#F9ECEE" rounded="lg" size="40">
          <v-icon color="#D2451E" size="24">mdi-food-fork-drink</v-icon>
        </v-avatar>

        <span class="font-weight-bold text-h6 text-grey-darken-4">FoodHub</span>
      </div>

      <!-- STEP 1: Email Input Form -->
      <template v-if="!emailSent">
        <div class="text-center mb-6">
          <h2 class="text-h6 font-weight-bold">Forgot Password</h2>
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

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="onSubmit">
          <v-text-field
            v-model="email"
            class="mb-4"
            density="comfortable"
            hide-details="auto"
            label="Email address"
            prepend-inner-icon="mdi-email-outline"
            :rules="emailRules"
            type="email"
            variant="outlined"
          />

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
            Send Reset Link
          </v-btn>
        </v-form>
      </template>

      <!-- STEP 2: Success Confirmation -->
      <template v-else>
        <div class="text-center">
          <v-icon class="mb-4" color="#D2451E" size="64">mdi-email-check-outline</v-icon>
          <h2 class="text-h6 font-weight-bold mb-2">Check your email</h2>

          <p class="text-body-2 text-grey-darken-1 mb-6">
            We've sent a password reset link to <strong>{{ email }}</strong>.
            Please check your inbox and follow the instructions.
          </p>

          <v-btn
            block
            class="py-5"
            color="#D2451E"
            elevation="0"
            rounded="pill"
            variant="flat"
            @click="router.push('/')"
          >
            Back to Sign In
          </v-btn>
        </div>
      </template>

      <!-- Back to Login Link -->
      <div v-if="!emailSent" class="text-center mt-4">
        <router-link class="text-decoration-none text-body-2" style="color: #D2451E;" to="/login">
          ← Back to Sign In
        </router-link>
      </div>
    </v-card>
  </v-main>
</template>
