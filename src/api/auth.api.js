import { mockUsers } from '../mocks/auth.mock.js'
import { mockStaff } from '../mocks/staff.mock.js'
import api from './axios.js'

// Mock Data Functions
// These helpers only affect browser localStorage.
function getMockUsers () {
  const saved = window.localStorage.getItem('mockUsers')

  if (saved) {
    return JSON.parse(saved)
  }

  window.localStorage.setItem('mockUsers', JSON.stringify(mockUsers))
  return [...mockUsers]
}

function saveMockUsers (users) {
  window.localStorage.setItem('mockUsers', JSON.stringify(users))
}

// Helper to fetch the logged-in user profile using the JWT token
export async function getAuthUserApi () {
  const response = await api.get('/staff/auth')
  return response.data
}

// function of axios api to login a user
export async function loginApi (email, password) {
  try {
    const response = await api.post('/staff/login', { email, password })
    return response.data
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      const users = getMockUsers()

      const user = users.find(
        u => u.email === email && u.password === password,
      )

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password',
        }
      }

      if (user.status?.toLowerCase() === 'inactive') {
        return {
          success: false,
          error: 'This account is inactive. Contact HR.',
        }
      }

      const { password: _password, ...userInfo } = user

      return {
        success: true,
        token: 'mock-token',
        userInfo,
      }
    }

    throw error
  }
}

// function of axios api to register a user
export async function registerApi (name, email, role, password, department) {
  try {
    const response = await api.post('/staff/register', {
      staff_id: Math.floor(100_000 + Math.random() * 900_000), // Backend requires an integer ID
      name,
      email,
      role,
      status: 'Active', // Backend requires a status value
      department: role === 'staff' ? department : '',
      password: password, // Backend expects hash_password in schema
    })

    return response.data
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      const users = getMockUsers()

      const existingUser = users.find(u => u.email === email)

      if (existingUser) {
        return {
          success: false,
          error: 'Email already exists',
        }
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role,
        status: 'Active',
        department,
      }

      users.push(newUser)
      saveMockUsers(users)

      if (role === 'staff') {
        const savedStaff = window.localStorage.getItem('mockStaff')
        const staffList = savedStaff ? JSON.parse(savedStaff) : [...mockStaff]

        staffList.push({
          id: newUser.id,
          name,
          email,
          role,
          status: 'Active',
          department,
        })

        window.localStorage.setItem('mockStaff', JSON.stringify(staffList))
      }

      const { password: _password, ...userInfo } = newUser

      return {
        success: true,
        userInfo,
      }
    }

    throw error
  }
}
