import Register from '@/pages/Register.vue'

describe('<Register />', () => {
  it('renders register form with vuetify elements', () => {
    cy.mount(Register)

    cy.contains('FoodHub').should('be.visible')
    cy.get('input[type="text"]').should('exist')
    cy.get('input[type="email"]').should('exist')
    cy.contains('.v-select', 'Select Department').should('exist')
    cy.contains('.v-select', 'Select System Role').should('exist')
    cy.get('input[type="password"]').should('exist')
    cy.get('button[type="submit"]').should('contain', 'Create Account')
  })

  it('validate email and password rules', () => {
    cy.mount(Register)

    cy.get('input[type="email"]').type('invalid-email').blur()
    cy.contains('E-mail must be valid').should('be.visible')

    cy.get('input[type="password"]').first().type('pass').blur()
    cy.contains('Password must be at least 6 characters').should('be.visible')

    cy.get('input[type="password"]').eq(0).type('original-password')
    cy.get('input[type="password"]').eq(1).type('fake-password')

    cy.get('input[type="password"]').eq(1).blur()
    cy.contains('Passwords do not match').should('be.visible')
  })

  it('toggle eye icon on password input', () => {
    cy.mount(Register)

    cy.get('input[type="password"]').should('exist')

    cy.get('.v-field__append-inner').first().click()
    cy.get('input[type="text"]').should('exist')
  })
})