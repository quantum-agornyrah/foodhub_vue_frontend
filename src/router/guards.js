import { useAuthStore } from '../stores/auth.store.js'

// NB:
// to: where user is going
// from: where user came from
// next: callback to allow/deny navigation

export function requireAuth (to, from, next) {
  const authStore = useAuthStore()

  // If the route requires auth and the user is NOT authenticated
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  // Guest or Public pages
  const guestOnlyRoutes = ['/login', '/register', '/forgot-password']

  // If user is logged in and trying to access guest or public pages
  if (authStore.isAuthenticated && (guestOnlyRoutes.includes(to.name) || guestOnlyRoutes.includes(to.path))) {

    // Direct to dashboard of each role first right after successful login
    return next(authStore.isHR ? '/hr' : '/staff')
  }

  // Only enforce role checks if the user is logged in
  if (authStore.isAuthenticated) {

    // Roles that a user can access the deestination page as: [hr, staff]
    const allowedRoles = to.meta.roles

    // Checks if the user's role IS NOT in the list of allowed roles.
    if (allowedRoles && !allowedRoles.includes(authStore.userInfo?.role)) {
      return next(authStore.isHR ? '/hr' : '/staff')
    }
  }

  // Allow next notification by default to other pages based on roles
  return next()
}
