import DayMenuCard from '@/components/menu/DayMenuCard.vue'

describe('<DayMenuCard />', () => {
  const mockItems = [
    {
      id: 1,
      title: 'Jollof Rice',
      description: 'Jollof with egg and fish',
      type: 'Vongees',
      imageUrl: '',
    },
    {
      id: 2,
      title: 'Margerine Rice',
      description: 'Rice with sausage and fried fish',
      type: 'Kente',
      imageUrl: '',
    },
  ]

  it('Test for state where menu is showed', () => {
    
    cy.mount(DayMenuCard, {
      props: {
        day: 'Monday',
        date: 'August 24',
        dateString: '2026-08-24',
        items: mockItems,
        orderedCount: 1,
        totalStaff: 3,
        status: 'open',
        canEdit: true,
      },
    })

    // cy.wait(['@getOrders', '@getAllStaff'])

    // Verify if the menu exists
    cy.contains('Monday').should('be.visible')
    cy.contains('Jollof Rice').should('be.visible')
    cy.contains('Margerine Rice').should('be.visible')
    cy.contains('1 / 3 ordered').should('be.visible')
  })

  it('Test for Holiday or Off Day state', () => {
    cy.mount(DayMenuCard, {
      props: {
        day: 'Tuesday',
        date: 'August 25',
        dateString: '2026-08-25',
        items: [],
        status: 'off_day',
      },
    })

    // Verify if the menu exists
    cy.contains('Off day').should('be.visible')
    cy.get('.mdi-calendar-remove').should('be.visible')
  })

  it('Test for when an "add item" button is clicked', () => {
    // Create a function that tracks the number of times it gets called
    const onAdd = cy.spy().as('addFoodItem')

    cy.mount(DayMenuCard, {
      props: {
        day: 'Monday',
        date: 'August 24',
        dateString: '2026-08-24',
        items: mockItems,
        status: 'open',
        canEdit: true,

        'onAdd-item': onAdd
      },
    })

    // Verify if the menu is selected
    cy.contains('button', 'Add item').click()
    cy.get('@addFoodItem').should('have.been.calledOnce')
  })

  it('Test for Empty state', () => {
    cy.mount(DayMenuCard, {
      props: {
        day: 'Wednesday',
        date: 'August 26',
        dateString: '2026-08-26',
        items: [],
        status: 'open',
      },
    })

    // Verify if the menu exists
    cy.contains('Wednesday').should('be.visible')
    cy.contains('No items yet').should('be.visible')
  })
})