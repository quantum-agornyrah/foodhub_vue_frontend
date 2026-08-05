import ErrorBoundary from './ErrorBoundary.vue'
import { h } from 'vue'
import ChildWithError from './ChildWithError.vue'

describe('Testing with onErrorCaptured', () => {
  it('displays the fallback UI on error', () => {
    cy.on('uncaught:exception', (err) => {
      // Assert on the error thrown during render
      expect(err.message).to.include('I crashed!')

      // Return false so that cypress does not fail test
      return false
    })

    // Mount the ErrorBoundary content and assert a fallback UI to show an error
    cy.mount(() => h(ErrorBoundary, () => h(ChildWithError)))
    cy.get('[data-cy=fallback]').should('contain', 'Something went wrong')
  })
})