import Stepper from './Stepper.vue'

describe('<Stepper />', () => {
  it('mounts', () => {
    // see: https://on.cypress.io/mounting-vue
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

})