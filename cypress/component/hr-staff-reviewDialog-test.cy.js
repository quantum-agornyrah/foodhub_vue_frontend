import ReviewDialog from '@/components/shared/ReviewDialog.vue'

describe('<ReviewDialog />', () => {
  beforeEach(() => {
    cy.viewport(1000, 800)
  })

  const mockTest = { 
    id: 101, 
    rating: 4, 
    comment: 'Great meal' 
  }

  it('Display and close dialog - For Staff', () => {
    cy.mount(ReviewDialog, {
      props: {
        modelValue: true,
        order: mockTest,
        readonly: false,
      }
    })

    cy.contains('Review Your Meal').should('be.visible')
    cy.contains('button', 'Reset').should('be.visible')
    cy.contains('button', 'Submit Review').should('be.visible')
    cy.get('.mdi-close').click()
    cy.contains('Review Your Meal').should('not.be.visible')
  })

  it('Display and close dialog - For Hr', () => {
    cy.mount(ReviewDialog, {
      props: {
        modelValue: true,
        order: mockTest,
        readonly: true,
      }
    })

    cy.contains('Staff Review').should('be.visible')

    cy.get('.mdi-close').click()
    cy.contains('Staff Review').should('not.be.visible')

  })

  it('Interact with the ratings - For Staff', () => {

    cy.mount(ReviewDialog, {
      props: {
        modelValue: true,
        order: {},
        readonly: false,
      }
    })

    cy.contains('Rating *').should('be.visible')
    cy.get('.v-rating__item button').eq(3).click()
  })

  it('Input review text - For Staff', () => {

    cy.mount(ReviewDialog, {
      props: {
        modelValue: true,
        order: {},
        readonly: false,
      }
    })

    cy.contains('Comment *').should('be.visible')
    cy.get('textarea').first().type('This food is great')

  })

  it('Click the Submit button - For Staff', () => {
    const onSubmit = cy.spy().as('submitReview')

    cy.mount(ReviewDialog, {
      props: {
        modelValue: true,
        order: mockTest,
        readonly: false,

        'onSubmit-review': onSubmit,
      }
    })

    cy.contains('button', 'Submit Review').click()
    cy.get('@submitReview').should('have.been.calledOnce')
  })

  it('Click the Reset button - For Staff', () => {

    cy.mount(ReviewDialog, {
      props: {
        modelValue: true,
        order: mockTest,
        readonly: false,
      }
    })

    cy.contains('button', 'Reset').click()
    cy.contains('Comment *').should('be.visible')
    cy.get('textarea').should('be.empty')
  })
})