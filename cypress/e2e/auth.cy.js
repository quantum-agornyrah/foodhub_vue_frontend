describe('Authentication Navigation', () => {
  it('A logout redirector - accessing a protected route', () => {
    cy.window().then((win) => win.sessionStorage.clear())
    cy.visit('/staff')

    cy.url().should('include', '/login')
  })

  it('Allow navigation to next step after successful login for HR', () => {
    cy.HrLogin('ericagornyrah@gmail.com', 'user123')

    cy.visit('/hr')
    cy.url().should('include', '/hr')
  })

  it('Allow navigation to next step after successful login for STAFF', () => {
    cy.StaffLogin('cypresstester@gmail.com', 'cypress123')

    cy.visit('/staff')
    cy.url().should('include', '/staff')
  })
})