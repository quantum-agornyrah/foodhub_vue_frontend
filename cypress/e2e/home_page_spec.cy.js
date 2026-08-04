describe('HR Dashboard Page', () => {
  beforeEach(() => {
    // 1. Mock API calls that the HR dashboard fetches when it loads
    cy.intercept('GET', '**/staff/**', { statusCode: 200, body: [] })
    cy.intercept('GET', '**/orders/**', { statusCode: 200, body: [] })
    cy.intercept('GET', '**/deadline/**', { statusCode: 200, body: {} })
  })

  it('loads the HR page successfully', () => {
    // 2. Visit /hr and inject sessionStorage BEFORE the Vue app initializes
    cy.visit('/hr', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('token', 'cypress-jwt-token-111')
        win.sessionStorage.setItem('userInfo', JSON.stringify({
          id: 101,
          name: 'Cypress-HR Test',
          email: 'cypresstesthr@gmail.com',
          role: 'hr'
        }))
      }
    })

    // 3. Verify page rendered
    cy.url().should('include', '/hr')
  })
})