import FoodFormDialog from '@/components/menu/FoodFormDialog.vue'

describe('<FoodFormDialog />', () => {
  beforeEach(() => {
    cy.viewport(1000, 800)
  })

  const mockItems = {
      id: 1,
      title: 'Jollof Rice',
      description: 'Jollof with egg',
      type: 'Vongees',
      imageUrl: '',
  }

  it('Display and close dialog', () => {
    cy.mount(FoodFormDialog, {
      props: {
        modelValue: true,
        foodItem: mockItems
      }
    })

    cy.contains('Edit Food Item').should('be.visible')
    cy.get('.mdi-close').click()
    cy.contains('Edit Food Item').should('not.be.visible')
  })

  it('Verify that fields of the dialog are prepopulated', () => {
    cy.mount(FoodFormDialog, {
      props: {
        modelValue: true,
        foodItem: mockItems,
      }
    })

    cy.contains('Food Title *').should('be.visible')
    cy.get('input[type="text"]').first().should('have.value', 'Jollof Rice')

    cy.contains('Description').should('be.visible')
    cy.contains('Vendor Type').should('be.visible')
  })

  it('Edit a field to validate food title', () => {
    cy.mount(FoodFormDialog, {
      props: {
        modelValue: true,
        foodItem: mockItems,
      }
    })

    cy.get('input[type="text"]').first().clear().type('fo').blur()
    cy.contains('Title must be at least 3 characters').should('be.visible')

  })

  it('Click the update button', () => {
    const onSave = cy.spy().as('updateForm')

    cy.mount(FoodFormDialog, {
      props: {
        modelValue: true,
        foodItem: mockItems,

        onSave
      }
    })

    // Validate food title before
    cy.get('input[type="text"]').first().clear().type('Jollof Rice').blur()
    cy.contains('button', 'Update').should('not.be.disabled').click()
    cy.get('@updateForm').should('have.been.calledOnce')
  })
})