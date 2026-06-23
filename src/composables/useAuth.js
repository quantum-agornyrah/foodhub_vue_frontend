import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSnackbar } from '@/composables/useSnackbar'
import { ROLES } from '@/constants/roles'
import { useAuthStore } from '@/stores/auth.store'

// Views should never touch auth.store directly — use this composable.
export function useAuth () {
  const router = useRouter()
  const authStore = useAuthStore()
  const { error: snackError } = useSnackbar()

  // Computed properties to easily check user state
  const user = computed(() => authStore.userInfo)
  const role = computed(() => authStore.userInfo.role)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isHR = computed(() => authStore.isHR)
  const isStaff = computed(() => authStore.isStaff)

  // True while the login or register API call is in flight
  const isLoading = computed(() => authStore.isLoading)

  // Map each role to its home route
  const ROLE_HOME = {
    [ROLES.HR]: '/hr-dashboard',
    [ROLES.STAFF]: '/staff-dashboard',
  }

  function redirectByRole () {
    const home = ROLE_HOME[authStore.userInfo.role] ?? '/login'
    router.push(home)
  }

  // Actions
  async function login (email, password) {
    // auth.store.login handles token storage, userInfo, and isAuthenticated
    const success = await authStore.login(email, password)
    if (success) {
      redirectByRole()
    } else {
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
