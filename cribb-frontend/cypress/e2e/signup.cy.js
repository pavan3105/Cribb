describe('Checking Sign Up button', () => {
  it('Checks if clicking on the sign up buttons opens signup page', () => {
    cy.visit("/")
    cy.get('button').contains('Sign up').click()
    cy.url().should('include', '/signup')
    cy.get('h1').should('contain', 'SIGN UP')
  })
})