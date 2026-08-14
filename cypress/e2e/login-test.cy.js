describe('Login Page - E2E Test', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })

    cy.visit('/login')
  })

  // Test to call api, input validation and login with correct credentials
  it('successfully login with the right credentials', () => {
    cy.intercept('POST', '**/staff/login').as('loginRequest')

    cy.get('input[type="email"]').type('cypresstester@gmail.com')
    cy.get('input[type="password"]').type('cypress123')

    cy.get('button[type="submit"]').click()

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)

    cy.url().should('include', '/staff')

    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('token')).to.exist
    })
  })

  // Test to check input field credential invalidity
  it('display invalid credential errors', () => {
    cy.intercept('POST', '**/staff/login').as('loginRequest')

    cy.get('input[type="email"]').type('wrong@gmail.com')
    cy.get('input[type="password"]').type('wrong123')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginRequest')

    cy.contains('Invalid credentials').should('be.visible')
  })
})