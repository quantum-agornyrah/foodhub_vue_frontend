describe('My First Test', () => {
  it('Gets, types and asserts', () => {
    cy.visit('https://example.cypress.io')

    cy.contains('type').click()

    // Include '/commands/actions' which 
    // Should be on a new URL
    cy.url().should('include', '/commands/actions')

    // Get an input e.g. a form input
    cy.get('.action-email').type('fake@email.com')

    // Verify that value has been updated
    cy.get('.action-email').should('have.value', 'fake@email.com')
  })
})