import DefaultSlot from './testVueFiles/DefaultSlot.vue'

describe('<DefaultSlot />', () => {
  it('renders', () => {

    // Mount and define slot of the selected component
    cy.mount(DefaultSlot, {
      slots: {
        default: 'Hello There!',
      },
    })

    // Assertion: Make sure the div with class, content shows "Hello There!" within the slot
    cy.get('div.content').should('have.text', 'Hello There!')
  })
})