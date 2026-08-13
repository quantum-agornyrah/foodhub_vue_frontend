import Login from '@/pages/login.vue'

describe('<Login />', () => {
  it('renders login form with vuetify elements', () => {
    cy.mount(Login)

    cy.contains('FoodHub').should('be.visible')
    cy.get('input[type="email"]').should('exist')
    cy.get('input[type="password"]').should('exist')
    cy.get('button[type="submit"]').should('contain', 'Sign In')
  })

  it('validate email and password rules', () => {
    cy.mount(Login)

    cy.get('input[type="email"]').type('invalid-email').blur()
    cy.contains('E-mail must be valid').should('be.visible')

    cy.get('input[type="password"]').type('pass').blur()
    cy.contains('Password must be at least 6 characters').should('be.visible')
  })

  it('toggle eye icon on password input', () => {
    cy.mount(Login)

    cy.get('input[type="password"]').should('exist')

    cy.get('.v-field__append-inner').click()
    cy.get('input[type="text"]').should('exist')
  })
})