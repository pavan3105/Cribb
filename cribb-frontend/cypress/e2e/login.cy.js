describe('Checking Login Up button', () => {
  it('Checks if clicking on the login up buttons opens Login page', () => {
    cy.visit("/")
    cy.get('button').contains('Login').click()
    cy.url().should('include', '/login')
    cy.get('h1').should('contain', 'LOGIN')
  })
})