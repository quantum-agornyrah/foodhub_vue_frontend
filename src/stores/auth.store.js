import { defineStore } from 'pinia'
import { getAuthUserApi, loginApi, registerApi } from '../api/auth.api.js'

function getSavedUser () {
  const savedUser = window.sessionStorage.getItem('userInfo')

  if (savedUser) {
    try {
      return JSON.parse(savedUser)
    } catch {
      window.sessionStorage.removeItem('userInfo')

      return {
        id: 0,
        name: '',
        email: '',
        role: '',
        department: '',
      }
    }
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
    // Read from local storage
    token: window.sessionStorage.getItem('token') || '',

    userInfo: getSavedUser(),
    error: null,
    isLoading: false,

    // True if token exists, false otherwise
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
        const re = await loginApi(email, password)
        const token = re['Staff Token'] || re.token

        if (token) {
          // Set the token
          this.token = token
          // State persistence
          window.sessionStorage.setItem('token', token)

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
        const re = await registerApi(name, email, role, password, department)
        if (re) {
          const user = re.userInfo || re
          // Set the user info
          this.userInfo = {
            id: user.staff_id || user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
          }
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
      // Clear local storage
      window.sessionStorage.removeItem('token')
      window.sessionStorage.removeItem('userInfo')

      // Reset state
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
