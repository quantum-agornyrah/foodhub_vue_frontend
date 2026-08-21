import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

describe('<ConfirmDialog />', () => {
  beforeEach(() => {
    cy.viewport(1000, 800)
  })

  it('Display and close dialog', () => {
    cy.mount(ConfirmDialog, {
      props: {
        modelValue: true,
        title: 'The Confirm Heading',
        message: 'Are you confident in this dialog test?',
        confirmLabel: 'Yes',
        cancelLabel: 'No',
      }
    })

    cy.contains('The Confirm Heading').should('be.visible')
    cy.get('.mdi-close').click()
    cy.contains('The Confirm Heading').should('not.be.visible')
  })

  it('Click the Confirm button', () => {
    const onConfirm = cy.spy().as('confirmDialog')

    cy.mount(ConfirmDialog, {
      props: {
        modelValue: true,
        title: 'The Confirm Heading',
        message: 'Are you confident in this dialog test?',
        confirmLabel: 'Yes',
        cancelLabel: 'No',

        onConfirm
      }
    })

    cy.contains('button', 'Yes').click()
    cy.get('@confirmDialog').should('have.been.calledOnce')
  })

  it('Click the Cancel button', () => {
    const onCancel = cy.spy().as('cancelDialog')

    cy.mount(ConfirmDialog, {
      props: {
        modelValue: true,
        title: 'The Confirm Heading',
        message: 'Are you confident in this dialog test?',
        confirmLabel: 'Yes',
        cancelLabel: 'No',

        onCancel
      }
    })

    cy.contains('button', 'No').click()
    cy.get('@cancelDialog').should('have.been.calledOnce')
    cy.contains('The Confirm Heading').should('not.be.visible')
  })
})