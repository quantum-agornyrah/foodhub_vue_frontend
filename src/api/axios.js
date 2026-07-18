import axios from 'axios'
import axiosRetry from 'axios-retry'

// Axios retry interceptor (package axios-retry):
// Retry for 3 times in total; access or point to axios first(original) and then retry TWO times
// Exponential delay: Wait 1s, then 2s, then 4s between retries
axiosRetry(axios, { retries: 2, retryDelay: axiosRetry.exponentialDelay })

// 1. BASE CONNECTION
// Creating an axios instance to connect frontend to backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {'Content-Type': 'application/json'},
})

// 2. RUN BEFORE EVERY API CALL (on request)
// Add a request interceptor to attach the token
api.interceptors.request.use(
  config => {
    // Get the JWT token from session storage
    const token = window.sessionStorage.getItem('token')
    if (token) {

      // If a token exists, attach an authorization header (BEARER) to it to make it accessible to api calls
      config.headers.Authorization = `Bearer ${token}`
    }
    // Send modified request
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

// 3. RUN AFTER EVERY API CALL (on response)
// Add a response interceptor to handle token expiration/401 errors
api.interceptors.response.use(
  // Success path of the response after API call
  response => response,

  // If an error occurs after the API call,
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

// Function call
export default api
