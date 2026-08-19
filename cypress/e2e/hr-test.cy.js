describe('template spec', () => {
  // Necessary Mock data
  const mockStaff =[
    { staff_id: 1, name: 'User One', email: 'userone@foodhub.com', role: 'staff', department: 'Accounts'},
    { staff_id: 2, name: 'User Two', email: 'usertwo@foodhub.com', role: 'staff', department: 'Brands'},
    { staff_id: 3, name: 'User Three', email: 'userthree@foodhub.com', role: 'staff', department: 'IT - Apps'},
  ]

  const mockMenu =[
    { 
      id: 1, 
      title: 'Jollof Rice', 
      description: 'Jollof with chicken', 
      type: 'Vongees',
      day: 'Monday',
      date: '2026-08-24',
      week_string: '2026-08-24',
      status: 'open',
    },
    { 
      id: 2, 
      title: 'Arony Rice', 
      description: 'Arony Rice with Fish', 
      type: 'Vongees',
      day: 'Monday',
      date: '2026-08-24',
      week_string: '2026-08-24',
      status: 'open',
    },
    { 
      id: 3, 
      title: 'Waakye', 
      description: 'Waakye with Sardine', 
      type: 'Kente',
      day: 'Tuesday',
      date: '2026-08-25',
      week_string: '2026-08-24',
      status: 'open',
    },
  ]

  const mockOrders =[
    {
      id: 101,
      staff_id: 1,
      staff_name: 'User One',
      department: 'Accounts',
      date: '2026-08-24',
      day: 'Monday',
      week_string: '2026-08-24',
      menu_item_id: 1,
      menu_title: 'Jollof Rice',
      status: 'submitted',
    },
    {
      id: 102,
      staff_id: 2,
      staff_name: 'User Two',
      department: 'Brands',
      date: '2026-08-24',
      day: 'Monday',
      week_string: '2026-08-24',
      menu_item_id: 2,
      menu_title: 'Arony Rice',
      status: 'submitted',
    },
    {
      id: 103,
      staff_id: 1,
      staff_name: 'User One',
      department: 'Accounts',
      date: '2026-08-25',
      day: 'Tuesday',
      week_string: '2026-08-24',
      menu_item_id: 1,
      menu_title: 'Waakye',
      status: 'submitted',
    },
    {
      id: 104,
      staff_id: 3,
      staff_name: 'User Three',
      department: 'IT - Apps',
      date: '2026-08-24',
      day: 'Monday',
      week_string: '2026-08-24',
      menu_item_id: 1,
      menu_title: 'Jollof Rice',
      status: 'submitted',
    },
  ]

  beforeEach(() => {
    cy.HrLogin('ericagornyrah@gmail.com', 'user123')
  })

  it('Render necessary data on the dashboard', () => {
    // Declare all necessary intercepts
    cy.intercept('GET', '**/staff/all**', { statusCode: 200, body: mockStaff }).as('getAllStaff')
    cy.intercept('GET', '**/menu/all**', { statusCode: 200, body: mockMenu }).as('getMenu')
    cy.intercept('GET', '**/orders/all**', { statusCode: 200, body: mockOrders }).as('getOrders')

    // Access the hr dashboard
    cy.visit('/hr')
    cy.url().should('include', '/hr')

    // Wait for all calls to load
    cy.wait(['@getAllStaff', '@getOrders', '@getMenu'])

    //Very Header
    cy.contains('Next week').should('be.visible')

    // Make sure the stats cards are made available
    cy.contains('Staff ordering').should('be.visible')
    cy.contains('Orders submitted').should('be.visible')
    cy.contains('Pending').should('be.visible')
    cy.contains('Off days this week').should('be.visible')

    // Verify menu cards
    cy.contains('Monday').should('be.visible')
    cy.contains('Tuesday').should('be.visible')
  })

  it('Navigate from the dashboard to the menu page, select a tab and make a menu', () => {
    // Stub the menu item with an intercept of mock data
    cy.intercept('GET', '**/menu/all**', { statusCode: 200, body: mockMenu}).as('getMenu')


    // Visit the Menu page directly
    cy.visit('/hr/menu')
    cy.url().should('include', '/menu')

    cy.contains('h1', 'Menu manager').should('be.visible')

    // Click the add food button
    cy.contains('button', 'Add food item').click()

    // Get the dialog and confirm its heading
    cy.get('.v-dialog').should('be.visible')
    cy.contains('h2', 'Add Food Items').should('be.visible')
  })

  it('Navigate to the Order Summary page', () => {
    // Declare all necessary intercepts
    cy.intercept('GET', '**/staff/all**', { statusCode: 200, body: mockStaff }).as('getAllStaff')
    cy.intercept('GET', '**/menu/all**', { statusCode: 200, body: mockMenu }).as('getMenu')
    cy.intercept('GET', '**/orders/all**', { statusCode: 200, body: mockOrders }).as('getOrders')

    cy.visit('/hr/orders')
    cy.url().should('include', '/orders')

    // Verify header title
    cy.contains('Order summary').should('be.visible')

    // Wait for calls to load
    cy.wait(['@getAllStaff', '@getOrders'])

    // Check summary stats
    cy.contains('Total orders').should('be.visible')
    cy.contains('Most popular').should('be.visible')

    // Verify orders are listed
    cy.contains('User One').should('be.visible')
    cy.contains('User Two').should('be.visible')
    cy.contains('User Three').should('be.visible')
  })
})