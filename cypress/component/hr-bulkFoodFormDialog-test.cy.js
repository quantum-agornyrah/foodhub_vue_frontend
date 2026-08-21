import BulkFoodFormDialog from '@/components/menu/BulkFoodFormDialog.vue'

describe('<BulkFoodFormDialog />', () => {
  beforeEach(() => {
    cy.viewport(1000, 800)
  })

  it('Display and close dialog', () => {
    cy.mount(BulkFoodFormDialog, {
      props: {
        modelValue: true,
      }
    })

    cy.contains('Add Food Items').should('be.visible')
    cy.get('.mdi-close').click()
    cy.contains('Add Food Items').should('not.be.visible')
  })

  it('Test to add or remove rows', () => {
    cy.mount(BulkFoodFormDialog, {
      props: {
        modelValue: true,
      }
    })

    cy.contains('Item 1').should('be.visible')
    cy.contains('button', 'Add row').click()
    cy.contains('Item 2').should('be.visible')

    cy.contains('button', 'Remove Item').click()
    cy.contains('Item 1').should('be.visible')
  })

  it('Verify that fields of the dialog can be populated', () => {
    cy.mount(BulkFoodFormDialog, {
      props: {
        modelValue: true,
      }
    })

    cy.contains('.v-field', 'Food Title *').should('be.visible')
    cy.get('input[type="text"]').first().type('Jollof Rice')
    cy.contains('.v-field', 'Description').should('be.visible')
  })

  it('Edit a field to validate food title', () => {
    cy.mount(BulkFoodFormDialog, {
      props: {
        modelValue: true,
      }
    })

    cy.get('input[type="text"]').first().clear().type('fo').blur()
    cy.contains('Title must be at least 3 characters').should('be.visible')
  })

  it('Click the save button', () => {
    const onSave = cy.spy().as('saveForm')

    cy.mount(BulkFoodFormDialog, {
      props: {
        modelValue: true,

        onSave
      }
    })

    // Validate food title before
    cy.get('input[type="text"]').eq(0).clear().type('Jollof Balls').blur()
    cy.get('textarea').eq(0).type('Jollof with egg')

    cy.contains('.v-field', 'Vendor Type').should('be.visible').click()
    cy.get('.v-overlay__content .v-list-item').contains('Kente').click()

    cy.contains('button', 'Save all').should('not.be.disabled').click()
    cy.get('@saveForm').should('have.been.calledOnce')
  })
})