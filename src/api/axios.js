import axios from 'axios'

// Entire frontend — zero retry logic. 
// A network blip causes silent failure.
import axiosRetry from 'axios-retry'

// Axios retry interceptor (package axios-retry):
axiosRetry(axios, { retries: 2, retryDelay: axiosRetry.exponentialDelay })

// Creating an axios instance to connect frontend to backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to attach the token
api.interceptors.request.use(
  config => {
    const token = window.sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}` // Or whatever format your backend expects
    }
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle token expiration/401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired, clear local storage and redirect
      window.sessionStorage.removeItem('token')
      window.sessionStorage.removeItem('userInfo')
      // Only redirect if we are not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
