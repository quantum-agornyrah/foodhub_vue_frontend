import { defineStore } from 'pinia'
import { getAuthUserApi, loginApi, registerApi } from '../api/auth.api.js'

function getSavedUser () {
  // userInfo details on session storage
  const savedUser = window.sessionStorage.getItem('userInfo')

  // Check if userInfo already exists on the session storage
  if (savedUser) {
    try {

      // Present or output the result in JSON format
      return JSON.parse(savedUser)
    } catch {

      // Remove userInfo details when there is an uncertain error 
      window.sessionStorage.removeItem('userInfo')

      // and return null values
      return {
        id: 0,
        name: '',
        email: '',
        role: '',
        department: '',
      }
    }

    // If userInfo doenst exist on the session storage already, populate it
  } else {
    return {
      id: 0,
      name: '',
      email: '',
      role: '',
      department: '',
    }
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Read the JWT token from session storage
    token: window.sessionStorage.getItem('token') || '',

    userInfo: getSavedUser(),
    error: null,
    isLoading: false,

    // True if token exists or user is logged in, false otherwise
    // !!window.sessionStorage.getItem('token') produces a STRICT boolean value
    // Either Falsy or Truthy depending on token availability
    isAuthenticated: !!window.sessionStorage.getItem('token'),
  }),

  getters: {
    isStaff (state) {
      return state.userInfo.role === 'staff'
    },
    isHR (state) {
      return state.userInfo.role === 'hr'
    },
  },

  actions: {
    // function to login a user
    async login (email, password) {
      this.isLoading = true
      this.error = null
      try {
        // 1. Call API
        const re = await loginApi(email, password)

        // 2. Get and save API
        const token = re['Staff Token'] || re.token

        if (token) {
          // Set the token
          this.token = token
          // State persistence
          window.sessionStorage.setItem('token', token)

          // 3. Fetch User profile
          // Fetch the userinfo using the token
          const profile = re.userInfo || await getAuthUserApi()

          // Set the user info
          this.userInfo = {
            id: profile.staff_id || profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            department: profile.department,
          }
          // Set authentication status
          this.isAuthenticated = true

          // 4. Save profile to session storage
          // State persistence
          window.sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          return true
        } else {
          this.error = 'Invalid credentials'
          this.isAuthenticated = false
          return false
        }
      } catch (error) {
        this.error = error.message
        this.isAuthenticated = false
        return false
      } finally {
        this.isLoading = false
      }
    },

    // function to register a user
    async register (name, email, role, password, department) {
      this.isLoading = true
      this.error = null
      try {
        // 1. Call API
        const re = await registerApi(name, email, role, password, department)
        if (re) {

          // 2. Save user Information
          const user = re.userInfo || re
          // Set the user info
          this.userInfo = {
            id: user.staff_id || user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
          }

          // 3. Save in session storage
          // State persistence;
          window.sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          return true
        } else {
          this.error = 'Registration failed'
          return false
        }
      } catch (error) {
        this.error = error.message
        console.error('Store error during registration:', error)
        return false
      } finally {
        this.isLoading = false
      }
    },

    // function to logout a user
    async logout () {
      // 1. Clear session storage
      window.sessionStorage.removeItem('token')
      window.sessionStorage.removeItem('userInfo')

      // 2. Reset state
      this.token = ''
      this.userInfo = {
        id: 0,
        name: '',
        email: '',
        role: '',
        department: '',
      }
      this.isAuthenticated = false
    },
  },
})
