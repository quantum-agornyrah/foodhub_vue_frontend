import DayOrderCard from '@/components/staff/DayOrderCard.vue'

describe('<DayOrderCard />', () => {
  const mockItems = [
    {
      id: 1,
      title: 'Jollof Rice',
      description: 'Jollof with egg',
      type: 'Vongees',
      imageUrl: '',
    },
    {
      id: 2,
      title: 'Arony Rice',
      description: 'Rice with sausage',
      type: 'Kente',
      imageUrl: '',
    },
  ]

  it('Test for state where menu is available and selectable', () => {
    cy.mount(DayOrderCard, {
      props: {
        day: 'Monday',
        date: 'August 24',
        dateString: '2026-08-24',
        items: mockItems,
        selectedItemId: null,
        status: 'open',
      },
    })

    // Verify if the menu exists
    cy.contains('Monday').should('be.visible')
    cy.contains('Jollof Rice').should('be.visible')
    cy.contains('Arony Rice').should('be.visible')
  })

  it('Test for Holiday or Off Day state', () => {
    cy.mount(DayOrderCard, {
      props: {
        day: 'Tuesday',
        date: 'August 25',
        dateString: '2026-08-25',
        items: [],
        selectedItemId: null,
        status: 'off_day',
      },
    })

    // Verify if the menu exists
    cy.contains('Off day').should('be.visible')
    cy.contains('Jollof Rice').should('not.exist')
  })

  it('Test for when a menu item is selected', () => {
    // Create a function that tracks the number of times it gets called
    const onSelect = cy.spy().as('selectMenuItem')

    cy.mount(DayOrderCard, {
      props: {
        day: 'Monday',
        date: 'August 24',
        dateString: '2026-08-24',
        items: mockItems,
        selectedItemId: null,
        status: 'open',
        onSelect,
      },
    })

    // Verify if the menu is selected
    cy.contains('Jollof Rice').click()
    cy.get('@selectMenuItem').should('have.been.calledOnce')
  })

  it('Test for Empty state', () => {
    cy.mount(DayOrderCard, {
      props: {
        day: 'Wednesday',
        date: 'August 26',
        dateString: '2026-08-26',
        items: [],
        selectedItemId: null,
        status: 'open',
      },
    })

    // Verify if the menu exists
    cy.contains('Wednesday').should('be.visible')
    cy.contains('No meals added for this day yet').should('be.visible')
  })
})