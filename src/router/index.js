import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store.js'
import { requireAuth } from './guards.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          return '/login'
        }
        return authStore.isHR ? '/hr-dashboard' : '/staff-dashboard'
      },
    },
    {
      path: '/login',
      name: 'LoginPage',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/pages/Register.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('@/pages/ForgotPassword.vue'),
      meta: { requiresAuth: false },
    },

    // THE STAFF ROUTES
    {
      path: '/staff-dashboard',
      name: 'StaffDashboard',

      // Implementing lazy loading
      component: () => import('@/pages/staff/StaffDashboard.vue'),
      meta: { requiresAuth: true, roles: ['staff'] },
    },
    {
      path: '/my-order-history',
      name: 'MyOrderHistory',

      // Implementing lazy loading
      component: () => import('@/pages/staff/MyOrderHistory.vue'),
      meta: { requiresAuth: true, roles: ['staff'] },
    },
    {
      path: '/weekly-overview',
      name: 'WeeklyOverview',

      // Implementing lazy loading
      component: () => import('@/pages/staff/WeeklyOverview.vue'),
      meta: { requiresAuth: true, roles: ['staff'] },
    },

    // THE HR ROUTES
    {
      path: '/hr-dashboard',
      name: 'HrDashboard',

      // Implementing lazy loading
      component: () => import('@/pages/hr/HrDashboard.vue'),
      meta: { requiresAuth: true, roles: ['hr'] },
    },
    {
      path: '/menu-manager',
      name: 'MenuManager',

      // Implementing lazy loading
      component: () => import('@/pages/hr/MenuManager.vue'),
      meta: { requiresAuth: true, roles: ['hr'] },
    },
    {
      path: '/order-summary',
      name: 'OrderSummary',

      // Implementing lazy loading
      component: () => import('@/pages/hr/OrderSummary.vue'),
      meta: { requiresAuth: true, roles: ['hr'] },
    },

    // Catch-all route for 404s
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFound.vue'),
    },
  ],
})

// Attach the guard to the router
router.beforeEach(requireAuth)

export default router
