// Corporate departments list
export const DEPARTMENTS = [
  'Administration',
  'HR - Human Resource',
  'IT - Apps',
  'Data Center',
  'Brands',
  'Accounts',
  'Project Management',
  'Project Reporting',
  'Networking',
  'Cyber Security',
  'Law Firm'
]

// Get all departments with "All" option
export function getDepartmentsWithAll () {
  return ['All', ...DEPARTMENTS]
}

// Check if department is valid
export function isValidDepartment (department) {
  return DEPARTMENTS.includes(department)
}
