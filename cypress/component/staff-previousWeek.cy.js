import PreviousWeekCard from '@/components/staff/PreviousWeekCard.vue'

describe('<PreviousWeekCard />', () => {
  const mockData = {
    title: 'Week of August 10 - 14',
    subtitle: '5 days ordered',
    status: 'submitted'
  }

  it('Test for an existing previous week card', () => {
    cy.mount(PreviousWeekCard, {
      props: {
        ...mockData,
      },
    })

    // Verify if text label exists
    cy.contains('Week of August 10 - 14').should('be.visible')
    cy.contains('5 days ordered').should('be.visible')

  })

  it('Test for clickable previous cards', () => {
    cy.mount(PreviousWeekCard, {
      props: {
        ...mockData,
        to: '/staff/history',
      },
    })

    // Verify if text label exists
    cy.get('.v-card').should('have.attr', 'href', '/staff/history')

  })
})