import NamedSlot from './testVueFiles/NamedSlot.vue'

describe('<NamedSlot />', () => {
  it('renders', () => {

    // Mount and declare slot names for a selected component
    cy.mount(NamedSlot, {
      slots: {
        header: 'Another Default Slot - Header Slot',
        footer: 'Footer Slot'
      }
    })

    // Assertion: Point out defined slot names and assign texts to each slot
    cy.get('header').should('have.text', 'Another Default Slot - Header Slot')
    cy.get('footer').should('have.text', 'Footer Slot')
  })
})