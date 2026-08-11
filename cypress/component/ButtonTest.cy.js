import ButtonTest from './testVueFiles/ButtonTest.vue'

describe('<ButtonTest />', () => {
  it('Exception Variables', () => {
    // Mount and define slot of the selected component
    cy.mount(ButtonTest)

    // Access the button element and extract the number its currently showing
    cy.get('[data-testid="num"]').then(($span) => {
      const num1 = parseFloat($span.text())

      // Cllick the button element
      cy.get('button').click()
      
      // Access the count variable and compare with the button element after click
      // Both values SHOULD be the same
      cy.get('[data-testid="num"]').should(($newSpan) => {
        const num2 = parseFloat($newSpan.text())
        expect(num2).to.eq(num1 + 1)
      })
    })
  })
})