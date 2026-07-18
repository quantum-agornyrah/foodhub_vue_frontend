// Start Vue 3 engine
import { createApp } from 'vue' 

// Register necessary plugins for Vue 3 to run
import { registerPlugins } from '@/plugins'

// Get the main or starting or ROOT Component
import App from './App.vue'

// Initialize Font Styles
import 'unfonts.css'

// Create a Vue app instance from the starting ROOT component of the main engine
const app = createApp(App)

// Register plugins assigned or to be used in the Vue app instance
registerPlugins(app)

// Stamp or mount the instance on the DOM for access
app.mount('#app')
