import Stepper from './Stepper.vue'

describe('<Stepper />', () => {
  it('mounts', () => {
    cy.mount(Stepper)
  })

  // Selectors & Assertions
  it('stepper should default to 0', () => {
    cy.mount(Stepper)
    cy.get('span').should('have.text', '0')
  })
  it('stepper should default to 0', () => {
    cy.mount(Stepper)
    cy.get('[data-cy=counter]').should('have.text', '0')
  })

  // Passing Props to Components
  it('supports a "count" prop to set the value', () => {
    cy.mount(Stepper, { props: { count: 100 } })
    cy.get('[data-cy=counter]').should('have.text', '100')
  })

  // Testing Interactions
  it ('when the increment button is clicked, the counter is increased', () => {
    cy.mount(Stepper)
    cy.get('[data-cy=increment]').click()
    cy.get('[data-cy=counter]').should('have.text', '1')
  })
  it ('when the decrement button is clicked, the counter is decreased', () => {
    cy.mount(Stepper)
    cy.get('[data-cy=decrement]').click()
    cy.get('[data-cy=counter]').should('have.text', '-1')
  })

  // Testing Components with Events - Using Spies
  it ('clicking + fires a change event with the increment value', () => {
    // Creat a spy alias
    const onChangeSpy = cy.spy().as('onChangeSpy')
    cy.mount(Stepper, { props: { onChange: onChangeSpy } })
    cy.get('[data-cy=increment]').click()

    // Get the spy using the prepended symbol
    cy.get('[@onChangeSpy]').should('have.been.calledWith', 1)
  })

  // Overriding the configured value
  it ('Over ride with alignments', () => {
    cy.get('button').click({ scrollBehavior: { inline: 'start'} })
  })

  // break on a debugger before the action command
  it ('Debugger', () => {
    cy.get('button').debug().click()
  })

  // force the click and all subsequent events
  // to fire even if this element isn't considered 'actionable'
  it ('Force click', () => {
    cy.get('button').click({ force: true })
  })

  it ('Cypress closures', () => {
    cy.get('button').then(($btn) => {

      // store the button's text
      const txt = $btn.text()

      // submit a form
      cy.get('form').submit()

      // compare the two buttons' text
      // and make sure they are different
      cy.get('button').should(($btn2) => {
        expect($btn2.text()).not.to.eq(txt)
      })
    })
  })

  it('Cypress Debuggers', () => {
    cy.get('button').then(($btn) => {
      // inspect $btn <object>
      debugger

      cy.get('[data-testid="countries"]')
        .select('USA')
        .then(($select) => {
          // inspect $select <object>
          debugger

          cy.clock().then(($clock) => {
            // inspect $clock <object>
            debugger

            $btn // is still available
            $select // is still available too
          })
        })
    })
  })
})