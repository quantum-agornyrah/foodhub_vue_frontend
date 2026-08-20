import WeekPicker from '@/components/shared/WeekPicker.vue'

describe('<WeekPicker />', () => {
  // Freeze time to get a definite weekOffset
  const BASE_DATE = new Date('2026-08-20T10:00:00.00Z').getTime()

  beforeEach(() => {
    cy.clock(BASE_DATE)
    cy.viewport(600, 600)
  })

  it('Display week ranges based on weekOffset', () => {
    cy.mount(WeekPicker, {
      props: {
        modelValue: 1,
      },
    })

    // Verify if the menu exists
    cy.get('.mdi-chevron-left').should('be.visible')
    cy.contains('Aug 24 - Aug 28, 2026').should('be.visible')
    cy.get('.mdi-chevron-right').should('be.visible')

  })

  it('Test for previous week button navigation', () => {
    // Make an update in offset when button is clicked
    const onUpdate = cy.spy().as('previousWeek')

    cy.mount(WeekPicker, {
      props: {
        modelValue: 1,

        'onUpdate:modelValue': onUpdate,
      },
    })

    // Verify if the class exists
    cy.get('.mdi-chevron-left').click()
    cy.get('@previousWeek').should('have.been.calledWith', 0)
  })

  it('Test for next week button navigation', () => {
    const onUpdate = cy.spy().as('followingWeek')

    cy.mount(WeekPicker, {
      props: {
        modelValue: 1,

        'onUpdate:modelValue': onUpdate,
      },
    })

    // Verify if the class exists
    cy.get('.mdi-chevron-right').click()
    cy.get('@followingWeek').should('have.been.calledWith', 2)
  })
})