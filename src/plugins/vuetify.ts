import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Theme configuration for adding styles to pages or the UI frameworks
const foodhubTheme = {
  dark: false,
  colors: {
    'background': '#FAF8F5', // Soft warm cream background
    'surface': '#FFFFFF', // Pure white for card surfaces
    'primary': '#D2451E', // Signature Terracotta Orange
    'primary-light': '#F9ECEE', // Soft terracotta tint for active item backgrounds
    'secondary': '#8C8C8C', // Gray for secondary texts/borders
    'error': '#C62828',
    'success': '#2E7D32',
    'warning': '#EF6C00',
    'info': '#1565C0',
  },
}

// Function to call out the theme
export default createVuetify({
  theme: {
    defaultTheme: 'foodhubTheme',
    themes: {
      foodhubTheme,
    },
  },
})
