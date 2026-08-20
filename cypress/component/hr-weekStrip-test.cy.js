import WeekStrip from '@/components/menu/WeekStrip.vue'

describe('<WeekStrip />', () => {
  // Freeze time to get a definite weekOffset
  const BASE_DATE = new Date('2026-08-20T10:00:00.00Z').getTime()

  beforeEach(() => {
    cy.clock(BASE_DATE)
    cy.viewport(1000, 600)
  })

  it('Display all 5 days available in a particualr offset as tabs', () => {
    cy.mount(WeekStrip, {
      props: {
        weekOffset: 1,
        offDays: [],
        selectedDate: '2026-08-24'
      },
    })

    // Verify if the menu exists
    cy.contains('Monday 24').should('be.visible')
    cy.contains('Tuesday 25').should('be.visible')
    cy.contains('Wednesday 26').should('be.visible')
    cy.contains('Thursday 27').should('be.visible')
    cy.contains('Friday 28').should('be.visible')
  })

  it('Test for active day selection', () => {
    cy.mount(WeekStrip, {
      props: {
        weekOffset: 1,
        offDays: [],
        selectedDate: '2026-08-24'
      },
    })

    // Verify if the class exists
    cy.contains('button', 'Monday 24').should('have.class', 'v-btn--variant-flat')
  })

  it('Test for tab switch', () => {
    const onUpdate = cy.spy().as('newSelectedDate')

    cy.mount(WeekStrip, {
      props: {
        weekOffset: 1,
        offDays: [],
        selectedDate: '2026-08-24',

        onUpdate
      },
    })

    // Verify if the class exists
    cy.contains('button', 'Wednesday 26').click()
    cy.contains('button', 'Wednesday 26').should('have.class', 'v-btn--variant-flat')
  })

  it('Test for off day', () => {
    cy.mount(WeekStrip, {
      props: {
        weekOffset: 1,
        offDays: ['2026-08-27']
      },
    })

    // Verify if the class exists
    cy.contains('button', 'Thursday 27').should('have.class', 'text-decoration-line-through')
  })
})