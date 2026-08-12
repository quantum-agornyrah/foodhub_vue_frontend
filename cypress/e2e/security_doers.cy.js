describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  })

  it('security doers', () => {
    cy.env(['apiKey']).then(({apiKey}) => {
      cy.request({
        method: 'POST',
        url: 'https://api.example.com/data',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
    })
  })
})