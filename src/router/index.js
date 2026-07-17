import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store.js'
import { requireAuth } from './guards.js'

// NB:
// createWebHistory(): Clean URLs (e.g., /staff-dashboard)
// createWebHashHistory(): Hash URLs (e.g., /#/staff-dashboard)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => {

        // Access the authentication store i.e isAutehnticated state
        const authStore = useAuthStore()

        // If isAuthenticated is FALSE
        if (!authStore.isAuthenticated) {
          return '/login'
        }

        // If TRUE and getter role is either HR or not;
        return authStore.isHR ? '/hr-dashboard' : '/staff-dashboard'
      },
    },
    {
      path: '/login',
      name: 'LoginPage',

      // Lazy loading technique
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

      // Protected routing based on role
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

// Before route change i.e from dashboard to menu manager, 
// this runs first
// Attach the guard to the router
router.beforeEach(requireAuth)

export default router
