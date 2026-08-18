describe('template spec', () => {
  beforeEach(() => {
    cy.StaffLogin('cypresstester@gmail.com', 'cypress123')
  })

  it('Render necessary data on the dashboard', () => {
    // Declare all necessary intercepts
    cy.intercept('GET', '**/staff/all/**').as('getAllStaff')
    cy.intercept('GET', '**/menu/all/**').as('getMenu')

    cy.visit('/staff')
    cy.url().should('include', '/staff')
    cy.contains('Good', { timeout: 10000 }).should('be.visible')
  })

  it('Navigate from dashboard to History page', () => {
    // Get all menu items
    cy.intercept('GET', '**/orders/all/**').as('getAllOrders')

    cy.visit('/staff')
    cy.url().should('include', '/staff')

    // Find the History button and click it
    cy.contains('button', 'View All History').click()
    cy.url().should('include', '/history')
    cy.contains('My order history').should('be.visible')
  })

  it('Navigate to the overview page, select and make an order', () => {
    // Stub the menu item with an intercept of mock data
    cy.intercept('GET', '**/menu/all**', {
      statusCode: 200,
      body: [
        {
          id: 1,
          title: 'Jollof Rice',
          description: 'Jollof Rice with Chicken and Shito',
          image_url: '',
          type: 'Vongees',
          day: 'Monday',
          date: '2026-08-24',
          week_string: '2026-08-24',
          status: 'open',
        },
      ],
    }).as('getMenuItem')

    // Stub Post Order with an intercept of mock data - Foreign Key constraint
    cy.intercept('POST', '**/orders/create**', {
      statusCode: 200,
      body: [
        {
          id: 999,
          date: '2026-08-24',
          day: 'Monday',
          staff_name: 'Cypress Tester',
          week_string: '2026-08-24',
          menu_item_id: 1,
          menu_title: 'Jollof Rice',
          status: 'submitted',
        },
      ],
    }).as('postOrder')

    // Stub all orders for history page
    cy.intercept('GET', '**/orders/my**', {
      statusCode: 200,
      body: [
        {
          id: 999,
          date: '2026-08-24',
          day: 'Monday',
          staff_name: 'Cypress Tester',
          week_string: '2026-08-24',
          menu_item_id: 1,
          menu_title: 'Jollof Rice',
          status: 'submitted',
        },
      ],
    }).as('getMyOrders')

    // Visit the Overview page directly
    cy.visit('/staff/overview')
    cy.url().should('include', '/overview')
    cy.contains('Order for Next Week').should('be.visible')

    // Make a selection in the first day card
    cy.get('.cursor-pointer').first().click()

    // Submit selections
    cy.contains('button', 'Submit all selections').should('not.be.disabled').click()

    // Wait for the api call to return a success message that an order has been saved
    cy.wait('@postOrder').its('response.statusCode').should('be.oneOf', [200, 201])

    cy.visit('/staff/history')
    cy.url().should('include', '/history')
    cy.get('.v-data-table', { timeout: 10000 }).should('contain', 'Submitted')
  })
})