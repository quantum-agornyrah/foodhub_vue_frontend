<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import loginBg from '@/assets/login-bg.jpg'
  import { DEPARTMENTS } from '@/constants/departments.js'
  import { useAuthStore } from '../stores/auth.store.js'

  const router = useRouter()
  const authStore = useAuthStore()
  const formRef = ref(null)

  const name = ref('')
  const email = ref('')
  const role = ref('staff')
  const department = ref('')
  const password = ref('')
  const confirmPassword = ref('')

  const isLoading = ref(false)
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')
  const isFormValid = ref(true)

  // System roles for selection
  const roles = [
    { title: 'Staff', value: 'staff' },
    { title: 'HR Manager', value: 'hr' },
  ]

  // Corporate departments list
  const departments = DEPARTMENTS

  // Rules
  const nameRules = [
    value => !!value || 'Full name is required',
    value => value.trim().split(' ').length >= 2 || 'Please enter both first and last name',
  ]

  const emailRules = [
    value => !!value || 'Email is required',
    value => /.+@.+\..+/.test(value) || 'E-mail must be valid',
  ]

  const roleRules = [
    value => !!value || 'Role selection is required',
  ]

  const departmentRules = [
    value => {
      if (role.value === 'staff') {
        return !!value || 'Department is required for staff'
      }
      return true
    },
  ]

  const passwordRules = [
    value => !!value || 'Password is required',
    value => value.length >= 6 || 'Password must be at least 6 characters',
  ]

  const confirmPasswordRules = [
    value => !!value || 'Please confirm your password',
    value => value === password.value || 'Passwords do not match',
  ]

  // Function to validate rules/form and submit input
  async function onSubmit () {
    
    // 1. Validate form
    const { valid } = await formRef.value.validate()
    if (!valid) return

    try {
      // 2. Call register method from auth store
      const result = await authStore.register(
        name.value,
        email.value,
        role.value,
        password.value,
        role.value === 'staff' ? department.value : null,
      )

      //3. Check if registration is executed and is ssuccessful or fails
      if (result) {
        successMessage.value = 'Registration successful! Redirecting to login...'
        setTimeout(() => {
          // 4. Redirect to the home or login page after 2 seconds
          router.push('/')
        }, 2000)
      } else {
        errorMessage.value = 'Registration failed. Please try again.'
      }
    } catch {
      errorMessage.value = 'An error occurred during registration. Please try again.'
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
      <div class="d-flex align-center justify-center mb-6">
        <v-avatar class="mr-4" color="#F9ECEE" rounded="lg" size="50">
          <v-icon color="#D2451E" size="35">mdi-food-fork-drink</v-icon>
        </v-avatar>

        <span class="font-weight-bold text-title-large">FoodHub</span>
      </div>

      <!-- Title / Header -->
      <div class="text-center mb-6">
        <h2 class="text-h6 font-weight-bold">Create Account</h2>
      </div>

      <!-- Feedback Alerts -->
      <v-alert
        v-if="errorMessage"
        class="mb-4"
        density="compact"
        type="error"
        variant="tonal"
      >
        {{ errorMessage }}
      </v-alert>

      <v-alert
        v-if="successMessage"
        class="mb-4"
        density="compact"
        type="success"
        variant="tonal"
      >
        {{ successMessage }}
      </v-alert>

      <!-- Registration Form -->
      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="onSubmit">
        <!-- Full Name -->
        <v-text-field
          v-model="name"
          class="mb-3"
          density="comfortable"
          hide-details="auto"
          label="Full Name"
          prepend-inner-icon="mdi-account-outline"
          :rules="nameRules"
          type="text"
          variant="outlined"
        />

        <!-- Email -->
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

        <!-- Role Selection -->
        <v-select
          v-model="role"
          class="mb-3"
          density="comfortable"
          hide-details="auto"
          :items="roles"
          label="Select System Role"
          prepend-inner-icon="mdi-briefcase-outline"
          :rules="roleRules"
          variant="outlined"
        />

        <!-- Dynamic Department Selection (Only active when role is 'worker') -->
        <v-expand-transition>
          <div v-if="role === 'staff'">
            <v-select
              v-model="department"
              class="mb-3"
              density="comfortable"
              hide-details="auto"
              :items="departments"
              label="Select Department"
              prepend-inner-icon="mdi-domain"
              :rules="departmentRules"
              variant="outlined"
            />
          </div>
        </v-expand-transition>

        <!-- Password -->
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

        <!-- Confirm Password -->
        <v-text-field
          v-model="confirmPassword"
          :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
          class="mb-4"
          density="comfortable"
          hide-details="auto"
          label="Confirm Password"
          prepend-inner-icon="mdi-lock-check-outline"
          :rules="confirmPasswordRules"
          :type="showConfirmPassword ? 'text' : 'password'"
          variant="outlined"
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
        />

        <!-- Submit Button -->
        <v-btn
          block
          class="py-5 my-6"
          color="#D2451E"
          :disabled="!isFormValid || isLoading"
          elevation="0"
          :loading="isLoading"
          rounded="pill"
          type="submit"
          variant="flat"
        >
          Create Account
        </v-btn>
      </v-form>

      <!-- Back to Login Link -->
      <div class="text-center mt-4">
        <span class="text-grey-darken-1 text-body-2">Already have an account?</span>

        <router-link class="text-decoration-none" style="color: #D2451E;" to="/login">
          Sign In
        </router-link>
      </div>
    </v-card>
  </v-main>
</template>
