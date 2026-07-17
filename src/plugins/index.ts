import type { App } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import vuetify from './vuetify'

// Function to fetch pinia stores, vue router and vuetify components LIBRARIES 
// and register them in the instance
export function registerPlugins (app: App) {
  // First plugin to install/fetch = Pinia for state management
  app.use(createPinia())
  // Second, Router for navigation between i.e needs access to stores
  app.use(router)
  // Third, Vuetify for UI frameworks
  app.use(vuetify)
}
