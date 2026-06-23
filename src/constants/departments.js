// Corporate departments list
export const DEPARTMENTS = [
  'Administration',
  'HR - Human Resource',
  'IT - Information Technology',
  'Data Center',
  'Brands',
  'Accounts',
  'Project Management',
  'Projects',
  'Networking',
  'Cyber Security',
]

// Get all departments with "All" option
export function getDepartmentsWithAll () {
  return ['All', ...DEPARTMENTS]
}

// Check if department is valid
export function isValidDepartment (department) {
  return DEPARTMENTS.includes(department)
}
