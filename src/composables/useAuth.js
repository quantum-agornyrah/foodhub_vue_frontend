import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSnackbar } from '@/composables/useSnackbar'
import { ROLES } from '@/constants/roles'
import { useAuthStore } from '@/stores/auth.store'

// Function to lay out ueser logic i.e authentication and navigation
export function useAuth () {
  const router = useRouter()
  const authStore = useAuthStore()
  const { error: snackError } = useSnackbar()

  // Computed properties to easily check user state for roles, authentication status and userInfo
  const user = computed(() => authStore.userInfo)
  const role = computed(() => authStore.userInfo.role)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isHR = computed(() => authStore.isHR)
  const isStaff = computed(() => authStore.isStaff)

  // True while the login or register API call is called and executed
  const isLoading = computed(() => authStore.isLoading)

  // Map each role to its home route
  const ROLE_HOME = {
    [ROLES.HR]: '/hr-dashboard',
    [ROLES.STAFF]: '/staff-dashboard',
  }

  // Redirection navigation logic for each user role
  function redirectByRole () {
    const home = ROLE_HOME[authStore.userInfo.role] ?? '/login'
    router.push(home)
  }

  // Function to login a user
  async function login (email, password) {
    // 1. Check authentication from auth.store
    // auth.store.login handles token storage, userInfo, and isAuthenticated
    const success = await authStore.login(email, password)
    if (success) {

      // 2. Redirect after successful login based on roles
      redirectByRole()
    } else {

      // 3. Toast notification for UI if login fails
      snackError(authStore.error ?? 'Login failed. Check your credentials.')
    }
    return success
  }

  async function logout () {
    // auth.store.logout clears localStorage and resets state
    await authStore.logout()
    router.push('/login')
  }

  return {
    // State
    user,
    role,
    isAuthenticated,
    isHR,
    isStaff,
    isLoading,
    ROLES,

    // Actions
    login,
    logout,
    redirectByRole,
  }
}
