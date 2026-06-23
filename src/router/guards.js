import { useAuthStore } from '../stores/auth.store.js'

export function requireAuth (to, from, next) {
  const authStore = useAuthStore()

  // If the route requires auth and the user is NOT authenticated
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'LoginPage' })
  }

  const guestOnlyRoutes = ['LoginPage', 'Register', 'ForgotPassword']

  if (authStore.isAuthenticated && guestOnlyRoutes.includes(to.name)) {
    return next(authStore.isHR ? { name: 'HrDashboard' } : { name: 'StaffDashboard' })
  }

  // Only enforce role checks if the user is logged in
  if (authStore.isAuthenticated) {
    const allowedRoles = to.meta.roles

    if (allowedRoles && !allowedRoles.includes(authStore.userInfo?.role)) {
      return next(authStore.isHR ? { name: 'HrDashboard' } : { name: 'StaffDashboard' })
    }
  }

  return next()
}
