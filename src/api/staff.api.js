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

// Mock Data Functions
// These helpers only affect browser localStorage.
function getMockStaff () {
  const saved = window.localStorage.getItem('mockStaff')

  if (saved) {
    return JSON.parse(saved)
  }

  window.localStorage.setItem('mockStaff', JSON.stringify(mockStaff))
  return [...mockStaff]
}

function saveMockStaff (staff) {
  window.localStorage.setItem('mockStaff', JSON.stringify(staff))
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// function of axios api to get data
export async function getAllStaffApi () {
  try {
    const response = await api.get('/staff/all')
    const staff = response.data

    const mapped = staff.map(e => ({
      id: e.staff_id, // Map staff_id -> id
      name: e.name,
      email: e.email,
      role: e.role,
      status: e.status,
      department: e.department,
    }))

    return {
      success: true,
      data: mapped,
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_STAFF === 'true') {
      return {
        success: true,
        data: getMockStaff(),
      }
    }

    throw error
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// function of axios api to create a staff
export async function createStaffApi (name, email, role, password, department) {
  try {
    const response = await api.post('/staff/register', {
      staff_id: Math.floor(100_000 + Math.random() * 900_000),
      name,
      email,
      role,
      status: 'Active',
      department: role === 'staff' ? department : '',
      hash_password: password,
    })

    const e = response.data

    return {
      success: true,
      data: {
        id: e.staff_id,
        name: e.name,
        email: e.email,
        role: e.role,
        status: e.status,
        department: e.department,
      },
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_STAFF === 'true') {
      const staff = getMockStaff()
      const users = getMockUsers()

      const existingStaff = staff.find(e => e.email === email)
      const existingUser = users.find(u => u.email === email)

      if (existingStaff || existingUser) {
        return {
          success: false,
          error: 'Staff or user with this email already exists',
        }
      }

      const id = Date.now()

      const newStaff = {
        id,
        name,
        email,
        role,
        status: 'Active',
        department,
      }

      const newUser = {
        id,
        name,
        email,
        password,
        role,
        status: 'Active',
        department,
      }

      staff.push(newStaff)
      saveMockStaff(staff)

      users.push(newUser)
      saveMockUsers(users)

      return {
        success: true,
        data: newStaff,
      }
    }

    throw error
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// function of axios api to update data
export async function updateStaffApi (id, name, email, role, password, department) {
  try {
    const response = await api.put(`/staff/edit/${id}`, {
      staff_id: Number(id),
      name,
      email,
      role,
      status: 'Active',
      department: role === 'staff' ? department : '',
      hash_password: password,
    })

    const e = response.data

    return {
      success: true,
      data: {
        id: e.staff_id,
        name: e.name,
        email: e.email,
        role: e.role,
        status: e.status,
        department: e.department,
      },
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_STAFF === 'true') {
      const staff = getMockStaff()

      const index = staff.findIndex(e => String(e.id) === String(id))

      if (index === -1) {
        return {
          success: false,
          error: 'Staff not found',
        }
      }

      staff[index] = {
        ...staff[index],
        name,
        email,
        role,
        department,
      }

      saveMockStaff(staff)

      return {
        success: true,
        data: staff[index],
      }
    }

    throw error
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// function of axios api to delete ONLY data in the UI
export async function deactivateStaffApi (id) {
  try {
    const response = await api.patch(`/staff/deactivate/${id}`)
    const e = response.data

    return {
      success: true,
      data: {
        id: e.staff_id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        department: response.data.department,
        status: response.data.status,
      },
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_STAFF === 'true') {
      const staff = getMockStaff()
      const users = getMockUsers()

      const staffIndex = staff.findIndex(
        e => String(e.id) === String(id),
      )

      if (staffIndex === -1) {
        return {
          success: false,
          error: 'Staff not found',
        }
      }

      staff[staffIndex] = {
        ...staff[staffIndex],
        status: 'Inactive',
      }

      const userIndex = users.findIndex(
        u => String(u.id) === String(id),
      )

      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          status: 'Inactive',
        }
      }

      saveMockStaff(staff)
      saveMockUsers(users)

      return {
        success: true,
        data: staff[staffIndex],
      }
    }

    throw error
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function to permanently delete staff (mock only)
export async function deleteStaffApi (id) {
  try {
    const response = await api.delete(`/staff/delete/${id}`)
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_STAFF === 'true') {
      const staff = getMockStaff()
      const users = getMockUsers()

      const filteredStaff = staff.filter(
        e => String(e.id) !== String(id),
      )

      const filteredUsers = users.filter(
        u => String(u.id) !== String(id),
      )

      saveMockStaff(filteredStaff)
      saveMockUsers(filteredUsers)

      return {
        success: true,
      }
    }

    throw error
  }
}
