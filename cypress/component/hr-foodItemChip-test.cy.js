import FoodItemChip from '@/components/menu/FoodItemChip.vue'

describe('<FoodItemChip />', () => {
  const mockItems = {
    title: 'Jollof Rice',
    imageUrl: '',
    description: 'Jollof with egg',
    type: 'Vongees',
  }

  it('Display meal title and vendor type', () => {
    cy.mount(FoodItemChip, {
      props: {
        ...mockItems,
      },
    })

    // Verify if the menu exists
    cy.contains('Jollof Rice').should('be.visible')
  })

  it('Test for vendor type color dot', () => {
    cy.mount(FoodItemChip, {
      props: {
        ...mockItems,
      },
    })

    // Verify if the class exists
    cy.get('.vendor-type-dot').should('be.visible').and('have.attr', 'title', 'Vongees')
  })
})