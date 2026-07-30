import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { requireAuth } from './guards.js'

// NB:
// createWebHistory(): Clean URLs (e.g., /staff-dashboard)
// createWebHashHistory(): Hash URLs (e.g., /#/staff-dashboard)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Before route change i.e from dashboard to menu manager, 
// this runs first
// Attach the guard to the router
router.beforeEach(requireAuth)

export default router
