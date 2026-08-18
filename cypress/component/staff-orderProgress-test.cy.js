import OrderProgressBar from '@/components/staff/OrderProgressBar.vue'

describe('<OrderProgressBar />', () => {

  it('Test 0% progress', () => {
    cy.mount(OrderProgressBar, {
      props: {
        selectedCount: 0,
        totalCount: 5,
      },
    })

    // Verify if text label exists
    cy.contains('0 of 5 days selected').should('be.visible')

    // Get the v-progress-linear component
    cy.get('.v-progress-linear').should('be.visible').and('have.attr', 'aria-valuenow', '0')
  })

  it('Test 20% progress or more', () => {
    cy.mount(OrderProgressBar, {
      props: {
        selectedCount: 3,
        totalCount: 5,
      },
    })

    // Verify if text label exists
    cy.contains('3 of 5 days selected').should('be.visible')

    // Get the v-progress-linear component
    cy.get('.v-progress-linear').should('be.visible').and('have.attr', 'aria-valuenow', '60')
  })

  it('Test 100% progress', () => {
    cy.mount(OrderProgressBar, {
      props: {
        selectedCount: 5,
        totalCount: 5,
      },
    })

    // Verify if text label exists
    cy.contains('5 of 5 days selected').should('be.visible')

    // Get the v-progress-linear component
    cy.get('.v-progress-linear').should('be.visible').and('have.attr', 'aria-valuenow', '100')
  })
})