import { defineStore } from 'pinia'
import {
  createStaffApi,
  deactivateStaffApi,
  deleteStaffApi,
  getAllStaffApi,
  updateStaffApi,
} from '../api/staff.api.js'
import { DEPARTMENTS } from '../constants/departments.js'

export const useStaffStore = defineStore('staff', {
  state: () => ({
    allStaff: [], // Array of all staff members
    isLoading: false, // Loading state
    error: null, // Error messages
  }),

  getters: {
    // Get active staff only
    activeStaff: state =>
      state.allStaff.filter(staff => staff.status === 'Active'),

    // Get staff by role
    staffByRole: state => role =>
      state.allStaff.filter(staff => staff.role === role),

    // Count total staff
    totalStaff: state => state.allStaff.length,

    // Get staff by department
    staffByDepartment: state => department =>
      state.allStaff.filter(staff => staff.department === department),

    // Get unique departments (for analytics/reporting)
    uniqueDepartments: state => {
      const depts = state.allStaff.map(s => s.department).filter(Boolean)
      return [...new Set(depts)].sort()
    },

    // Get staff with invalid departments (for data quality checks)
    staffWithInvalidDepartments: state => {
      return state.allStaff.filter(staff =>
        staff.department && !DEPARTMENTS.includes(staff.department),
      )
    },

    // Get staff without department assigned
    staffWithoutDepartment: state => {
      return state.allStaff.filter(staff => !staff.department)
    },
  },

  actions: {
    // Fetch all staff members
    async getAllStaff () {
      this.isLoading = true
      this.error = null

      try {
        const response = await getAllStaffApi()

        if (response.success) {
          this.allStaff = response.data
          return true
        } else {
          this.error = response.error
          return false
        }
      } catch (error) {
        console.error('Failed to fetch staff:', error)
        this.error = error
        return false
      } finally {
        this.isLoading = false
      }
    },

    // Create new staff member
    async createStaff (name, email, role, password, department) {
      this.isLoading = true
      this.error = null

      try {
        const response = await createStaffApi(name, email, role, password, department)

        if (response.success) {
          
          //Add the staff directly without calling the whole list
          this.allStaff.push(response.data)
          // await this.getAllStaff()
          return true
        } else {
          this.error = response.error
          return false
        }
      } catch (error) {
        console.error('Failed to create staff:', error)
        this.error = error
        return false
      } finally {
        this.isLoading = false
      }
    },

    // Update staff member
    async updateStaff (id, name, email, role, password, department) {
      this.isLoading = true
      this.error = null

      try {
        const response = await updateStaffApi(id, name, email, role, password, department)

        if (response.success) {

          //Update the staff directly without calling the whole list
          const index = this.allStaff.findIndex(staff => staff.id === id)
          if (index !== -1) {
            this.allStaff[index] = response.data
          }
          // await this.getAllStaff() // Refresh list
          return true
        } else {
          this.error = response.error
          return false
        }
      } catch (error) {
        console.error('Failed to update staff:', error)
        this.error = error
        return false
      } finally {
        this.isLoading = false
      }
    },

    // function to deactivate an staff
    async deactivateStaff (id) {
      this.isLoading = true
      this.error = null
      try {
        const response = await deactivateStaffApi(id)
        if (response.success) {
          const index = this.allStaff.findIndex(s => s.id === id)
          if (index !== -1) {
            this.allStaff[index].status = 'Inactive'
          }
          this.error = null
          return true
        } else {
          this.error = response.error
          this.isLoading = false
          return false
        }
      } catch (error) {
        this.error = error
        this.isLoading = false
        return false
      } finally {
        this.isLoading = false
      }
    },

    // Delete staff member
    async deleteStaff (id) {
      this.isLoading = true
      this.error = null

      try {
        const response = await deleteStaffApi(id)

        if (response.success) {
          
          // Remove the staff by referencing its exact id, directly without calling the whole list
          this.allStaff = this.allStaff.filter(s => s.id !== id)
          // await this.getAllStaff() // Refresh list
          return true
        } else {
          this.error = response.error
          return false
        }
      } catch (error) {
        console.error('Failed to delete staff:', error)
        this.error = error
        return false
      } finally {
        this.isLoading = false
      }
    },
  },
})