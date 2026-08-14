describe('Register Page - E2E Test', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })

    cy.visit('/register')
  })

  // Test to call api, input validation and login with correct credentials
  it('successfully register with the right credentials', () => {
    cy.intercept('POST', '**/staff/register').as('registerRequest')

    cy.get('input[type="text"]').first().type('Cypress Tester')
    cy.get('input[type="email"]').type('cypresstester@gmail.com')

    // cy.contains('.v-select', 'Select System Role').click()
    // cy.contains('.v-list-item', 'Staff').click()

    cy.contains('.v-select', 'Select Department').click()
    cy.contains('.v-list-item', 'Networking').click()

    cy.get('input[type="password"]').eq(0).type('cypress123')
    cy.get('input[type="password"]').eq(1).type('cypress123')

    cy.get('button[type="submit"]').click()

    cy.wait('@registerRequest').its('response.statusCode').should('eq', 200)

    cy.contains('Registration successful').should('be.visible')

    cy.url().should('include', '/login')

  })

  // Test to check input field credential invalidity
  it('display invalid credential errors', () => {
    cy.intercept('POST', '**/staff/register').as('registerRequest')

    cy.get('input[type="text"]').first().type('Cypress Tester')
    cy.get('input[type="email"]').type('cypresstester@gmail.com')

    // cy.contains('.v-select', 'Select System Role').click()
    // cy.contains('.v-list-item', 'Staff').click()

    cy.contains('.v-select', 'Select Department').click()
    cy.contains('.v-list-item', 'Brands').click()

    cy.get('input[type="password"]').eq(0).type('cypress123')
    cy.get('input[type="password"]').eq(1).type('cypress124')

    cy.get('input[type="password"]').eq(1).blur()

    cy.contains('Passwords do not match').should('be.visible')
  })
})