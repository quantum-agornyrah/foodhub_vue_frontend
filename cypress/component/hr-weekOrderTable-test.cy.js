import WeekOrderTable from '@/components/orders/WeekOrderTable.vue'

describe('<WeekOrderTable />', () => {
  beforeEach(() => {
    cy.viewport(1000, 800)
  })

  // Necessary Mock data
  const mockWeek =[ '2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28' ]

  const mockOrders =[
    {
      id: 101,
      staffId: 1,
      staffName: 'User One',
      department: 'Brands',
      date: '2026-08-24',
      menuTitle: 'Rice Ball',
      rating: 4, 
      comment: 'Great meal'
    },
    {
      id: 102,
      staffId: 1,
      staffName: 'User One',
      department: 'Brands',
      date: '2026-08-25',
      menu_item_id: 2,
      menuTitle: 'Arony Rice',
    },
    {
      id: 103,
      staffId: 1,
      staffName: 'User One',
      department: 'Brands',
      date: '2026-08-26',
      menuTitle: 'Waakye',
    },
    {
      id: 104,
      staffId: 1,
      staffName: 'User One',
      department: 'Brands',
      date: '2026-08-27',
      menuTitle: 'Kenkey',
    },
  ]

  it('Display table with orders and week dates', () => {
    cy.mount(WeekOrderTable, {
      props: {
        orders: mockOrders,
        weekDates: mockWeek,
      }
    })

    cy.contains('Staff').should('be.visible')
    cy.contains('Department').should('be.visible')
    cy.contains('Monday').should('be.visible')
    cy.contains('Friday').should('be.visible')

    cy.contains('User One').should('be.visible')
    cy.contains('Rice Ball').should('be.visible')
    cy.contains('Brands').should('be.visible')
  })

  it('Display dash for unordered days', () => {
    cy.mount(WeekOrderTable, {
      props: {
        orders: mockOrders,
        weekDates: mockWeek,
      }
    })

    cy.contains('Staff').should('be.visible')
    cy.contains('Department').should('be.visible')
    cy.contains('Monday').should('be.visible')
    cy.contains('Friday').should('be.visible')

    cy.contains('User One').should('be.visible')
    cy.contains('-').should('be.visible')
    cy.contains('Brands').should('be.visible')
  })

  it('Test for Empty Table', () => {
    cy.mount(WeekOrderTable, {
      props: {
        orders: [],
        weekDates: mockWeek,
      }
    })

    cy.get('.mdi-clipboard-text-off-outline').should('be.visible')
    cy.contains('No orders for this week').should('be.visible')
  })

  it('Test for Valid search', () => {
    cy.mount(WeekOrderTable, {
      props: {
        orders: mockOrders,
        weekDates: mockWeek,
      }
    })

    cy.get('input[type="text"]').first().type('User One')
    cy.contains('User One').should('be.visible')
  })

  it('Test for Invalid search', () => {
    cy.mount(WeekOrderTable, {
      props: {
        orders: [],
        weekDates: mockWeek,
      }
    })

    cy.get('input[type="text"]').first().type('King')
    cy.contains('No staff members found for "King"').should('be.visible')
  })

  it('Test for Review trademark on a food item and the Review dialog', () => {
    cy.mount(WeekOrderTable, {
      props: {
        orders: mockOrders,
        weekDates: mockWeek,
      }
    })

    cy.get('.mdi-star').should('be.visible')
    cy.get('.mdi-star').click()
    cy.contains('Staff Review').should('be.visible')
  })
})