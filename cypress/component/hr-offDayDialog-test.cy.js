import OffDayDialog from '@/components/menu/OffDayDialog.vue'

describe('<OffDayDialog />', () => {
  beforeEach(() => {
    cy.viewport(1000, 800)
  })

  it('Display and close dialog', () => {
    cy.mount(OffDayDialog, {
      props: {
        modelValue: true,
        selectedDate: '2026-08-24'
      }
    })

    cy.contains('Mark as Off Day').should('be.visible')
    cy.get('.mdi-close').click()
    cy.contains('Mark as Off Day').should('not.be.visible')
  })

  it('Interact with radio button', () => {
    cy.mount(OffDayDialog, {
      props: {
        modelValue: true,
        selectedDate: '2026-08-24'
      }
    })

    cy.contains('Select Type').should('be.visible')
    cy.contains('Public Holiday').should('be.visible')
    cy.contains('Off Day').should('be.visible')

    cy.get('input[type="radio"][value="off_day"]').should('be.checked')
    cy.contains('Public Holiday').click()
    cy.get('input[type="radio"][value="holiday"]').should('be.checked')
  })

  it('Populate the reason field', () => {
    cy.mount(OffDayDialog, {
      props: {
        modelValue: true,
        selectedDate: '2026-08-24',
      }
    })

    cy.contains('Reason (optional)').should('be.visible')
    cy.get('textarea').first().clear().type('Intensive construction around office areas').blur()
  })

  it('Click the cancel button', () => {

    cy.mount(OffDayDialog, {
      props: {
        modelValue: true,
        selectedDate: '2026-08-24',
      }
    })

    // Validate food title before
    cy.contains('button', 'Cancel').click()
    cy.contains('Mark as Off Day').should('not.be.visible')
  })

  it('Click the Mark as off day button button', () => {

    cy.mount(OffDayDialog, {
      props: {
        modelValue: true,
        selectedDate: '2026-08-24',
      }
    })

    // Validate food title before
    cy.contains('button', 'Mark as Off Day').should('not.be.disabled').click()
    cy.contains('Mark as Off Day').should('not.be.visible')
  })
})