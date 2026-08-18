import DeadlineAlert from '@/components/staff/DeadlineAlert.vue'

describe('<DeadlineAlert />', () => {
  // Get and Set a fixed date (deadline) for testing
  const BASE_DEADLINE = new Date('2026-08-20T10:00:00.000Z').getTime()

  beforeEach(() => {
    // Freeze browser time before each test
    cy.clock(BASE_DEADLINE)
  })

  it('Test for upcoming deadline i.e deadline > 5 hours', () => {

    // 2 days before deadline
    const deadlineIso = '2026-08-22T10:00:00.000Z'

    cy.mount(DeadlineAlert, {
      props: {
        deadlineIso,
      },
    })

    // Verify if text label exists
    cy.contains('Click this banner to select your meals for next week').should('be.visible')

    // Get the icon element
    cy.get('.mdi-calendar-clock').should('be.visible')
  })

  it('Test for urgent deadline i.e deadline < 5 hours', () => {
    // 1 hour before deadline before deadline
    const deadlineIso = '2026-08-20T12:00:00.000Z'

    cy.mount(DeadlineAlert, {
      props: {
        deadlineIso,
      },
    })

    // Verify if text label exists
    cy.contains('Urgent: Click this banner to complete your meal selection!').should('be.visible')

    // Get the icon element
    cy.get('.mdi-alert-decagram').should('be.visible')
  })


  it('Test for passed deadline', () => {
    // Deadline passed
    const deadlineIso = '2026-08-20T09:00:00.000Z'

    cy.mount(DeadlineAlert, {
      props: {
        deadlineIso,
      },
    })

    // Verify if text label exists
    cy.contains('Ordering deadline has passed').should('be.visible')

    // Get the icon element
    cy.get('.mdi-alert-circle').should('be.visible')
  })

  it('Test arrow button', () => {
    const deadlineIso = '2026-08-22T10:00:00.000Z'

    cy.mount(DeadlineAlert, {
      props: {
        deadlineIso,
        to: '/staff/overview',
      },
    })

    // Verify if text label exists
    cy.get('.v-card').should('be.visible')

  })
})